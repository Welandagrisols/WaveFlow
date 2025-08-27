import { ShoppingCart, TrendingUp, Car, Zap, User } from "lucide-react";
import { format } from "date-fns";

interface TransactionItemProps {
  transaction: {
    id: string;
    amount: string;
    direction: 'IN' | 'OUT';
    description: string;
    transactionDate: string;
    transactionType: string;
    categoryId?: string;
  };
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const getTransactionIcon = () => {
    const iconMap: { [key: string]: any } = {
      'MPESA': ShoppingCart,
      'BANK': TrendingUp,
      'CASH': User,
    };
    
    return iconMap[transaction.transactionType] || ShoppingCart;
  };

  const isIncome = transaction.direction === 'IN';
  const IconComponent = getTransactionIcon();
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors" data-testid={`transaction-item-${transaction.id}`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${isIncome ? 'bg-yasinga-success' : 'bg-yasinga-error'} bg-opacity-10 rounded-lg flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${isIncome ? 'text-yasinga-success' : 'text-yasinga-error'}`} />
        </div>
        <div>
          <p className="font-medium text-slate-800" data-testid={`transaction-description-${transaction.id}`}>
            {transaction.description}
          </p>
          <p className="text-sm text-slate-500">
            {format(new Date(transaction.transactionDate), 'MMM dd, h:mm a')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isIncome ? 'text-yasinga-success' : 'text-yasinga-error'}`} data-testid={`transaction-amount-${transaction.id}`}>
          {isIncome ? '+' : '-'}KES {Number(transaction.amount).toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 capitalize">
          {transaction.transactionType.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
