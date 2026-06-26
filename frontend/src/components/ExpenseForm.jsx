import { useState, useEffect, useRef } from 'react';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { suggestCategory } from '../api/aiApi';
import useDebouncedValue from '../hooks/useDebouncedValue';
import FormInput from './FormInput';
import Button from './Button';
import { Sparkles, Brain, Loader2 } from 'lucide-react';

const initialForm = { amount: '', description: '', category: '',note:'' };

const validate = (form) => {
  const errors = {};

  const amountNum = parseFloat(form.amount);
  if (!form.amount) {
    errors.amount = 'Amount is required';
  } else if (isNaN(amountNum) || amountNum <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!form.description.trim()) {
    errors.description = 'Description is required';
  } else if (form.description.length > 255) {
    errors.description = 'Description must be 255 characters or fewer';
  }

  if (!form.category) {
    errors.category = 'Please select a category';
  }
  if (form.note && form.note.length > 500) {
  errors.note = 'Note must be 500 characters or fewer';
}

  return errors;
};

const ExpenseForm = ({ onAdd }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [suggesting, setSuggesting] = useState(false);
  const [wasAiSuggested, setWasAiSuggested] = useState(false);

  // Tracks whether the user has manually picked a category themselves
  const userOverrodeCategory = useRef(false);

  const debouncedDescription = useDebouncedValue(form.description, 600);

  useEffect(() => {
    const description = debouncedDescription.trim();

    if (description.length < 3 || userOverrodeCategory.current) {
      return;
    }

    let cancelled = false;

    const fetchSuggestion = async () => {
      setSuggesting(true);
      try {
        const { data } = await suggestCategory(description);
        if (!cancelled && data.category) {
          setForm((prev) => ({ ...prev, category: data.category }));
          setWasAiSuggested(true);
        }
      } catch {
        // Silently ignore AI suggestions errors
      } finally {
        if (!cancelled) setSuggesting(false);
      }
    };

    fetchSuggestion();

    return () => {
      cancelled = true;
    };
  }, [debouncedDescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      userOverrodeCategory.current = true;
      setWasAiSuggested(false);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const resetAiTracking = () => {
    userOverrodeCategory.current = false;
    setWasAiSuggested(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await onAdd({
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category,
      });
      setForm(initialForm);
      resetAiTracking();
    } catch (err) {
      const apiError = err.response?.data?.error;

      if (err.response?.status === 422 && apiError?.details) {
        const fieldErrors = {};
        apiError.details.forEach((d) => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError('Could not add expense. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-4">
        {/* Amount Input */}
        <FormInput
          label="Amount (INR)"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0.00"
        />

        {/* Description Input */}
        <FormInput
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="e.g. Server hosting renewal"
        />

        {/* Category Selector with AI suggestion highlights */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="category" className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Category
            </label>
            
            {/* AI suggestion indicator animations */}
            {suggesting && (
              <span className="flex items-center gap-1.5 text-xs text-purple-400 font-medium animate-pulse">
                <Brain className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </span>
            )}
            
            {!suggesting && wasAiSuggested && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-800/40 text-purple-300 font-bold font-sans">
                <Sparkles className="w-3 h-3 fill-purple-300" />
                Suggested by Gemini AI
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              aria-invalid={!!errors.category}
              className={`block w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 bg-slate-900/60 text-slate-200 border cursor-pointer focus:outline-none ${
                errors.category
                  ? 'border-red-600/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/25'
                  : wasAiSuggested
                  ? 'border-purple-700/40 shadow-[0_0_12px_rgba(109,40,217,0.12)] focus:border-purple-700'
                  : 'border-white/8 focus:border-blue-600/50'
              }`}
            >
              <option value="" disabled className="bg-bg-deep text-slate-400">
                Select a category
              </option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-bg-deep text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
    Note <span className="text-gray-400 font-normal">(optional)</span>
  </label>
  <textarea
    id="note"
    name="note"
    value={form.note}
    onChange={handleChange}
    rows={2}
    maxLength={500}
    placeholder="Any extra detail about this expense…"
    className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm resize-none
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
      ${errors.note ? 'border-red-400' : 'border-gray-300'}`}
  />
  <div className="flex justify-between mt-1">
    {errors.note
      ? <p className="text-xs text-red-600">{errors.note}</p>
      : <span />}
    <p className="text-xs text-gray-400">{form.note.length}/500</p>
  </div>
</div>
          {errors.category && <p className="mt-1 text-[11px] font-medium text-red-400">{errors.category}</p>}
        </div>
      </div>

      {serverError && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3 animate-fade-in font-medium">
          {serverError}
        </p>
      )}

      <Button type="submit" loading={submitting} fullWidth>
        Add transaction
      </Button>
    </form>
  );
};

export default ExpenseForm;