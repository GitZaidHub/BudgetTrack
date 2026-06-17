import { useState, useEffect, useRef } from 'react';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { suggestCategory } from '../api/aiApi';
import useDebouncedValue from '../hooks/useDebouncedValue';
import FormInput from './FormInput';
import Button from './Button';

const initialForm = { amount: '', description: '', category: '' };

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

  return errors;
};

const ExpenseForm = ({ onAdd }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [suggesting, setSuggesting] = useState(false);
  const [wasAiSuggested, setWasAiSuggested] = useState(false);

  // Tracks whether the user has manually picked a category themselves —
  // once they have, we stop overwriting their choice with new AI suggestions.
  const userOverrodeCategory = useRef(false);

  const debouncedDescription = useDebouncedValue(form.description, 600);

  useEffect(() => {
    const description = debouncedDescription.trim();

    // Don't call the AI for trivially short input, and don't overwrite
    // a category the user has deliberately chosen themselves.
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
        // Silently ignore — AI suggestion is non-critical.
        // The form remains fully usable via manual category selection.
      } finally {
        if (!cancelled) setSuggesting(false);
      }
    };

    fetchSuggestion();

    return () => {
      cancelled = true; // avoids a stale response overwriting a newer one
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0.00"
        />

        <div className="sm:col-span-2">
          <FormInput
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="e.g. Lunch at Dominos"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          {suggesting && (
            <span className="text-xs text-indigo-500 animate-pulse">AI thinking…</span>
          )}
          {!suggesting && wasAiSuggested && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              ✨ AI suggested
            </span>
          )}
        </div>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          aria-invalid={!!errors.category}
          className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      <Button type="submit" loading={submitting}>
        Add expense
      </Button>
    </form>
  );
};

export default ExpenseForm;