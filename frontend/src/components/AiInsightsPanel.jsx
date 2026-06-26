import { useState } from 'react';
import { getExpenseSummary, getBudgetSuggestions } from '../api/aiApi';

const AiInsightsPanel = () => {
  const [summary, setSummary] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(null);

  const fetchSummary = async () => {
    setActiveTab('summary');
    setLoadingSummary(true);
    setError('');
    try {
      const { data } = await getExpenseSummary();
      setSummary(data.summary || 'Not enough data to generate a summary yet.');
    } catch {
      setError('Could not fetch summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchBudget = async () => {
    setActiveTab('budget');
    setLoadingBudget(true);
    setError('');
    try {
      const { data } = await getBudgetSuggestions();
      setBudgets(data.suggestions || []);
    } catch {
      setError('Could not fetch budget suggestions. Please try again.');
    } finally {
      setLoadingBudget(false);
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h2 className="text-base font-semibold text-amber-900">AI Insights</h2>
        <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
          Premium
        </span>
      </div>

      <div className="px-6 py-4">
        <div className="flex gap-3 mb-4">
          <button
            onClick={fetchSummary}
            disabled={loadingSummary}
            className={`text-sm px-4 py-2 rounded-md font-medium transition-colors border
              ${activeTab === 'summary'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {loadingSummary ? '✨ Analyzing…' : '✨ Spending Summary'}
          </button>
          <button
            onClick={fetchBudget}
            disabled={loadingBudget}
            className={`text-sm px-4 py-2 rounded-md font-medium transition-colors border
              ${activeTab === 'budget'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {loadingBudget ? '📊 Calculating…' : '📊 Budget Suggestions'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {activeTab === 'summary' && !loadingSummary && summary && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
            <p className="text-sm text-indigo-900 leading-relaxed">{summary}</p>
          </div>
        )}

        {activeTab === 'budget' && !loadingBudget && budgets.length > 0 && (
          <div className="space-y-3">
            {budgets.map((b) => (
              <div key={b.category} className="border border-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">{b.category}</span>
                  <div className="text-xs text-gray-500">
                    Current:{' '}
                    <span className="font-medium text-gray-700">
                      ₹{parseFloat(b.currentSpend).toFixed(2)}
                    </span>{' '}
                    → Budget:{' '}
                    <span className="font-medium text-green-700">
                      ₹{parseFloat(b.suggestedBudget).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">{b.tip}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'budget' && !loadingBudget && budgets.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Add more expenses to get personalized budget suggestions.
          </p>
        )}
      </div>
    </div>
  );
};

export default AiInsightsPanel;