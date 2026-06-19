import ExpenseItem from './ExpenseItem';
import EmptyState from './EmptyState';
import { Receipt } from 'lucide-react';

const ExpenseList = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        subtitle="Start tracking your spending by adding an expense."
        icon={Receipt}
      />
    );
  }

  return (
    <div className="divide-y divide-glass">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ExpenseList;