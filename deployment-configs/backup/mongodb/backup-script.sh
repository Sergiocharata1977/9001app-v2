#!/bin/bash

# MongoDB Atlas Backup Script for 9001app-v2
# This script performs automated backups of MongoDB Atlas databases

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/backups/mongodb"
LOG_DIR="/var/log/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="9001app_backup_${DATE}"

# Load environment variables
source "${SCRIPT_DIR}/../config/backup.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "${LOG_DIR}/backup.log"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "${LOG_DIR}/backup.log"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "${LOG_DIR}/backup.log"
}

# Create directories if they don't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "${LOG_DIR}"

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if mongodump is available
    if ! command -v mongodump &> /dev/null; then
        error "mongodump is not installed"
        exit 1
    fi
    
    # Check if AWS CLI is available (for S3 uploads)
    if ! command -v aws &> /dev/null; then
        warning "AWS CLI is not installed. S3 uploads will be skipped."
    fi
    
    # Check if required environment variables are set
    if [[ -z "${MONGODB_URI:-}" ]]; then
        error "MONGODB_URI environment variable is not set"
        exit 1
    fi
    
    log "Prerequisites check completed"
}

# Function to perform MongoDB backup
perform_backup() {
    log "Starting MongoDB backup..."
    
    local backup_path="${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Create backup directory
    mkdir -p "${backup_path}"
    
    # Perform backup using mongodump
    log "Running mongodump..."
    if mongodump \
        --uri="${MONGODB_URI}" \
        --out="${backup_path}" \
        --gzip \
        --verbose; then
        
        log "MongoDB backup completed successfully"
        
        # Create backup metadata
        cat > "${backup_path}/backup_metadata.json" << EOF
{
    "backup_name": "${BACKUP_NAME}",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "mongodb_uri": "${MONGODB_URI}",
    "backup_size": "$(du -sh "${backup_path}" | cut -f1)",
    "compression": "gzip",
    "version": "1.0.0"
}
EOF
        
        return 0
    else
        error "MongoDB backup failed"
        return 1
    fi
}

# Function to compress backup
compress_backup() {
    log "Compressing backup..."
    
    local backup_path="${BACKUP_DIR}/${BACKUP_NAME}"
    local archive_path="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    if tar -czf "${archive_path}" -C "${BACKUP_DIR}" "${BACKUP_NAME}"; then
        log "Backup compressed successfully: ${archive_path}"
        
        # Remove uncompressed directory
        rm -rf "${backup_path}"
        
        # Calculate checksum
        local checksum=$(sha256sum "${archive_path}" | cut -d' ' -f1)
        echo "${checksum}" > "${archive_path}.sha256"
        
        log "Backup checksum: ${checksum}"
        return 0
    else
        error "Backup compression failed"
        return 1
    fi
}

# Function to upload to S3
upload_to_s3() {
    if [[ -z "${S3_BUCKET:-}" ]]; then
        warning "S3_BUCKET not configured, skipping S3 upload"
        return 0
    fi
    
    if ! command -v aws &> /dev/null; then
        warning "AWS CLI not available, skipping S3 upload"
        return 0
    fi
    
    log "Uploading backup to S3..."
    
    local archive_path="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    local s3_key="mongodb-backups/${BACKUP_NAME}.tar.gz"
    
    if aws s3 cp "${archive_path}" "s3://${S3_BUCKET}/${s3_key}" \
        --storage-class STANDARD_IA \
        --metadata "backup-date=${DATE},project=9001app-v2"; then
        
        log "Backup uploaded to S3: s3://${S3_BUCKET}/${s3_key}"
        
        # Upload checksum file
        aws s3 cp "${archive_path}.sha256" "s3://${S3_BUCKET}/${s3_key}.sha256"
        
        return 0
    else
        error "S3 upload failed"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        if [[ -f "${file}" ]]; then
            rm -f "${file}"
            rm -f "${file}.sha256"
            ((deleted_count++))
            log "Deleted old backup: $(basename "${file}")"
        fi
    done < <(find "${BACKUP_DIR}" -name "9001app_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -print0)
    
    log "Cleanup completed. Deleted ${deleted_count} old backup files"
}

# Function to validate backup
validate_backup() {
    log "Validating backup..."
    
    local archive_path="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    local checksum_file="${archive_path}.sha256"
    
    if [[ ! -f "${archive_path}" ]]; then
        error "Backup file not found: ${archive_path}"
        return 1
    fi
    
    if [[ ! -f "${checksum_file}" ]]; then
        error "Checksum file not found: ${checksum_file}"
        return 1
    fi
    
    # Verify checksum
    local expected_checksum=$(cat "${checksum_file}")
    local actual_checksum=$(sha256sum "${archive_path}" | cut -d' ' -f1)
    
    if [[ "${expected_checksum}" == "${actual_checksum}" ]]; then
        log "Backup validation successful"
        return 0
    else
        error "Backup validation failed: checksum mismatch"
        return 1
    fi
}

# Function to send notifications
send_notification() {
    local status="$1"
    local message="$2"
    
    # Send Slack notification if configured
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        if [[ "${status}" == "FAILED" ]]; then
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                'text': 'MongoDB Backup ${status}',
                'attachments': [{
                    'color': '${color}',
                    'fields': [
                        {
                            'title': 'Project',
                            'value': '9001app-v2',
                            'short': true
                        },
                        {
                            'title': 'Backup Name',
                            'value': '${BACKUP_NAME}',
                            'short': true
                        },
                        {
                            'title': 'Message',
                            'value': '${message}',
                            'short': false
                        }
                    ]
                }]
            }" \
            "${SLACK_WEBHOOK_URL}" || warning "Failed to send Slack notification"
    fi
    
    # Send email notification if configured
    if [[ -n "${EMAIL_RECIPIENTS:-}" ]] && command -v mail &> /dev/null; then
        echo "MongoDB Backup ${status}: ${message}" | \
        mail -s "9001app-v2 MongoDB Backup ${status}" "${EMAIL_RECIPIENTS}" || \
        warning "Failed to send email notification"
    fi
}

# Main execution
main() {
    log "Starting MongoDB backup process for 9001app-v2"
    
    # Check prerequisites
    check_prerequisites
    
    # Perform backup
    if perform_backup; then
        # Compress backup
        if compress_backup; then
            # Validate backup
            if validate_backup; then
                # Upload to S3
                upload_to_s3
                
                # Cleanup old backups
                cleanup_old_backups
                
                # Send success notification
                send_notification "SUCCESS" "Backup completed successfully: ${BACKUP_NAME}"
                
                log "Backup process completed successfully"
                exit 0
            else
                error "Backup validation failed"
                send_notification "FAILED" "Backup validation failed"
                exit 1
            fi
        else
            error "Backup compression failed"
            send_notification "FAILED" "Backup compression failed"
            exit 1
        fi
    else
        error "MongoDB backup failed"
        send_notification "FAILED" "MongoDB backup failed"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --validate     Validate existing backups"
        echo "  --cleanup      Clean up old backups only"
        exit 0
        ;;
    --validate)
        validate_backup
        exit $?
        ;;
    --cleanup)
        cleanup_old_backups
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac