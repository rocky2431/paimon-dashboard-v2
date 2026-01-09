/**
 * RebalancingChart Component
 *
 * Bar chart for rebalancing activity
 */

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { RebalancingData } from '../ReportPreview';

interface RebalancingChartProps {
  data: RebalancingData;
}

function RebalancingChart({ data }: RebalancingChartProps) {
  const chartData = [
    { name: 'Completed', value: data.completedTrades },
    { name: 'Pending', value: data.pendingTrades },
  ];

  return (
    <div data-testid="rebalancing-chart" className="w-full h-64">
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

export default RebalancingChart;
