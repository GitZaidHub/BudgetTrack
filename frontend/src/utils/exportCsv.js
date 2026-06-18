/**
 * Converts an array of expense objects into a downloadable CSV file
 * and triggers the browser's download dialog. Pure client-side —
 * no backend involvement, per the milestone's frontend-only scope.
 */
export const exportExpensesToCsv = (expenses, filename = 'expenses.csv') => {
  const headers = ['Date', 'Description', 'Category', 'Amount'];

  const rows = expenses.map((exp) => [
    new Date(exp.createdAt).toLocaleDateString('en-IN'),
    // Escape quotes/commas by wrapping in quotes and doubling any inner quotes
    `"${exp.description.replace(/"/g, '""')}"`,
    exp.category,
    exp.amount,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};