import ExpenseItem from './ExpenseItem';
import EmptyState from './EmptyState';

const ExpenseList = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-gray-100">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ExpenseList;