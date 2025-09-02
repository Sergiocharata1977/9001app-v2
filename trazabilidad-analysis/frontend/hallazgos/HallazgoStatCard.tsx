import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const HallazgoStatCard = ({ title, value, icon, colorClass }) => {
  return (
    <Card className={`text-white ${colorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default HallazgoStatCard;
