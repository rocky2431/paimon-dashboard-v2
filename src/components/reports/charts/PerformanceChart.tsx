/**
 * PerformanceChart Component
 *
 * Line chart for performance metrics
 */

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { PerformanceData } from '../ReportPreview';

interface PerformanceChartProps {
  data: PerformanceData;
}

function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.dailyReturns || [];

  return (
    <div data-testid="performance-chart" className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceChart;
