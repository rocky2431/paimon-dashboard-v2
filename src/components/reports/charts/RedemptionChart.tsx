/**
 * RedemptionChart Component
 *
 * Bar chart for redemption metrics
 */

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { RedemptionData } from '../ReportPreview';

interface RedemptionChartProps {
  data: RedemptionData;
}

function RedemptionChart({ data }: RedemptionChartProps) {
  const chartData = [
    { name: 'Pending', value: data.pendingRequests },
    { name: 'Processed Today', value: data.processedToday },
  ];

  return (
    <div data-testid="redemption-chart" className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RedemptionChart;
