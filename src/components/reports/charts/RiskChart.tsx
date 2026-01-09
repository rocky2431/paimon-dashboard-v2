/**
 * RiskChart Component
 *
 * Pie chart for risk distribution
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { RiskData } from '../ReportPreview';

interface RiskChartProps {
  data: RiskData;
}

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

function RiskChart({ data }: RiskChartProps) {
  const chartData = data.riskDistribution || [];

  return (
    <div data-testid="risk-chart" className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => entry.name}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskChart;
