
import React from 'react';
import { TypingStats } from '../types';

interface MetricsProps {
  stats: TypingStats;
}

const MetricItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-md w-32">
    <span className="text-gray-400 text-sm font-medium">{label}</span>
    <span className="text-blue-400 text-3xl font-bold">{value}</span>
  </div>
);

const Metrics: React.FC<MetricsProps> = ({ stats }) => {
  return (
    <div className="flex justify-center gap-4 my-6">
      <MetricItem label="WPM" value={stats.wpm.toFixed(0)} />
      <MetricItem label="Accuracy" value={`${stats.accuracy.toFixed(0)}%`} />
      <MetricItem label="Time" value={`${stats.time.toFixed(0)}s`} />
    </div>
  );
};

export default Metrics;
