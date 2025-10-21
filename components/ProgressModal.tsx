import React, { useState, useMemo } from 'react';
import { TypingSession } from '../types';
import { analyzeTypingProgress } from '../services/geminiService';
import ProgressBarChart from './ProgressBarChart';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TypingSession[];
  onClearHistory: () => void;
}

type TimePeriod = 'today' | 'week';

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, history, onClearHistory }) => {
  const [period, setPeriod] = useState<TimePeriod>('today');
  const [analysis, setAnalysis] = useState<string>('');
  // FIX: Changed state type from `false` to `boolean` to allow setting loading state to true.
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - now.getDay() * 24 * 60 * 60 * 1000;

    return history.filter(session => {
      if (period === 'today') {
        return session.timestamp >= startOfToday;
      }
      if (period === 'week') {
        return session.timestamp >= startOfWeek;
      }
      return true;
    }).slice(-10); // show last 10 sessions for the period
  }, [history, period]);

  const handleAnalyze = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis('');
    const result = await analyzeTypingProgress(filteredHistory);
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };
  
  if (!isOpen) return null;

  const chartDataWPM = filteredHistory.map(s => ({ label: s.language.substring(0,4), value: s.wpm }));
  const chartDataAccuracy = filteredHistory.map(s => ({ label: s.language.substring(0,4), value: s.accuracy }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl m-4 p-6 text-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Your Progress</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="flex gap-2 border-b border-gray-700 mb-4">
          <button onClick={() => setPeriod('today')} className={`py-2 px-4 ${period === 'today' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Today</button>
          <button onClick={() => setPeriod('week')} className={`py-2 px-4 ${period === 'week' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>This Week</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
           <ProgressBarChart data={chartDataWPM} title="WPM (Words Per Minute)" color="text-blue-400" />
           <ProgressBarChart data={chartDataAccuracy} title="Accuracy (%)" color="text-emerald-400" />
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            {isLoadingAnalysis && <p className="text-gray-400">Analyzing your performance...</p>}
            {analysis && <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>}
            <button onClick={handleAnalyze} disabled={isLoadingAnalysis || filteredHistory.length < 2} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isLoadingAnalysis ? 'Thinking...' : 'Analyze with AI'}
            </button>
             {filteredHistory.length < 2 && <p className="text-xs text-gray-500 mt-1">Complete at least 2 sessions in this period for analysis.</p>}
        </div>

        <div className="mt-6 flex justify-end">
            <button onClick={onClearHistory} className="text-sm text-red-400 hover:text-red-300">Clear All History</button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;