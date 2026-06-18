/**
 * Filters a list of expenses to only those within the given range type,
 * relative to today. All comparisons use local time at midnight boundaries.
 */
export const filterByRange = (expenses, rangeType) => {
  if (rangeType === 'all') return expenses;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate;

  switch (rangeType) {
    case 'daily':
      startDate = startOfToday;
      break;
    case 'weekly': {
      // Monday as the start of the week
      const dayOfWeek = startOfToday.getDay(); // 0 = Sunday
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(startOfToday);
      startDate.setDate(startOfToday.getDate() - diffToMonday);
      break;
    }
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      return expenses;
  }

  return expenses.filter((exp) => new Date(exp.createdAt) >= startDate);
};

export const RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This week' },
  { value: 'monthly', label: 'This month' },
];