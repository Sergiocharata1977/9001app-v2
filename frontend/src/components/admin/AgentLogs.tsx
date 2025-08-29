import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Terminal,
  Search,
  Download,
  Trash2,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug
} from 'lucide-react';
import { agentService, AgentLog } from '@/services/agentService';

interface AgentLogsProps {
  isConnected: boolean;
}

const AgentLogs: React.FC<AgentLogsProps> = ({ isConnected }) => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [limit, setLimit] = useState(100);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh && isConnected) {
      intervalRef.current = setInterval(loadLogs, 5000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isConnected, selectedAgent, limit]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedAgent, selectedLevel]);

  useEffect(() => {
    if (autoRefresh) {
      scrollToBottom();
    }
  }, [filteredLogs, autoRefresh]);

  const loadLogs = async () => {
    if (!isConnected) return;
    
    try {
      setLoading(true);
      const agentId = selectedAgent === 'all' ? undefined : selectedAgent;
      const newLogs = await agentService.getLogs(agentId, limit);
      setLogs(newLogs);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.agentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por nivel
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Ordenar por timestamp (más recientes primero)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
  };

  const handleDownloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.agentId}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      error: 'bg-red-100 text-red-800',
      warn: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      debug: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={levelConfig[level] || levelConfig.info}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAgentBadge = (agentId: string) => {
    const agentColors = {
      'security-agent': 'bg-red-100 text-red-800',
      'structure-agent': 'bg-blue-100 text-blue-800',
      'typescript-agent': 'bg-purple-100 text-purple-800',
      'api-agent': 'bg-green-100 text-green-800',
      'mongodb-agent': 'bg-yellow-100 text-yellow-800',
      'web-agent': 'bg-pink-100 text-pink-800',
      'system': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={agentColors[agentId] || agentColors.system}>
        {agentId}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controles de filtrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              Logs del Sistema
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={autoRefresh ? 'default' : 'secondary'}>
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Badge>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por agente */}
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los agentes</SelectItem>
                <SelectItem value="security-agent">Security Agent</SelectItem>
                <SelectItem value="structure-agent">Structure Agent</SelectItem>
                <SelectItem value="typescript-agent">TypeScript Agent</SelectItem>
                <SelectItem value="api-agent">API Agent</SelectItem>
                <SelectItem value="mongodb-agent">MongoDB Agent</SelectItem>
                <SelectItem value="web-agent">Web Agent</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por nivel */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            {/* Límite de logs */}
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Límite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 logs</SelectItem>
                <SelectItem value="100">100 logs</SelectItem>
                <SelectItem value="200">200 logs</SelectItem>
                <SelectItem value="500">500 logs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm text-gray-600">
                Mostrando {filteredLogs.length} de {logs.length} logs
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownloadLogs}
                variant="outline"
                size="sm"
                disabled={filteredLogs.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              
              <Button
                onClick={handleClearLogs}
                variant="outline"
                size="sm"
                disabled={logs.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
              
              <Button
                onClick={loadLogs}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualización de logs */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-gray-900 text-green-400 h-96 overflow-y-auto font-mono text-sm">
            {!isConnected ? (
              <div className="p-4 text-yellow-400">
                <p>Sistema de agentes no conectado.</p>
                <p>Para ver logs en tiempo real, inicie el sistema de agentes:</p>
                <p className="mt-2 text-green-400">cd agent-coordinator && npm start</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-4 text-gray-500">
                {logs.length === 0 ? 'No hay logs disponibles' : 'No hay logs que coincidan con los filtros'}
              </div>
            ) : (
              <div className="p-4">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 py-1 hover:bg-gray-800 rounded px-2"
                  >
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {getLevelIcon(log.level)}
                      <span className="text-xs">
                        {getLevelBadge(log.level)}
                      </span>
                    </div>
                    
                    <span className="text-xs">
                      {getAgentBadge(log.agentId)}
                    </span>
                    
                    <span className="flex-1 break-words">
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentLogs;