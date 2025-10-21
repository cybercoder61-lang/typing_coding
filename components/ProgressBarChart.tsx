import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface ProgressBarChartProps {
  data: ChartData[];
  title: string;
  color: string;
}

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({ data, title, color }) => {
  if (!data.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No data for this period.
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const chartHeight = data.length * 40;

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-300 mb-2">{title}</h4>
      <div className="bg-gray-800 p-4 rounded-lg">
        <svg width="100%" height={chartHeight} aria-label={title}>
          {data.map((item, index) => {
            const y = index * 40;
            const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <g key={index} transform={`translate(0, ${y})`}>
                <text x="0" y="15" className="text-xs fill-current text-gray-400" dominantBaseline="middle">
                  {item.label}
                </text>
                 <rect
                  x="0"
                  y="20"
                  width={`${barWidth}%`}
                  height="12"
                  className={`fill-current ${color} rounded`}
                >
                    <title>{`${title}: ${item.value.toFixed(0)}`}</title>
                 </rect>
                <text x={`${barWidth + 2}%`} y="26" className="text-xs font-bold fill-current text-gray-200">
                  {item.value.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ProgressBarChart;
