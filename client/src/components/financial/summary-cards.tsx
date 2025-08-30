import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";

interface SummaryCardsProps {
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  };
  totalExpenses?: number;
  totalIncome?: number;
  totalTransactions?: number;
  pendingAmount?: number;
}

export default function SummaryCards({ 
  summary, 
  totalExpenses: propExpenses, 
  totalIncome: propIncome, 
  totalTransactions: propTransactions, 
  pendingAmount 
}: SummaryCardsProps) {
  const totalIncome = propIncome ?? summary?.totalIncome ?? 0;
  const totalExpenses = propExpenses ?? summary?.totalExpenses ?? 0;
  const totalBalance = totalIncome - totalExpenses;
  const transactionCount = propTransactions ?? summary?.transactionCount ?? 0;

  const cards = [
    {
      title: "Total Balance",
      value: `KES ${totalBalance.toLocaleString()}`,
      icon: Wallet,
      color: "yasinga-primary",
      change: "+12.5%",
      changeLabel: "vs last month",
      testId: "card-total-balance"
    },
    {
      title: "This Month Spent",
      value: `KES ${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "yasinga-error",
      change: "+8.2%",
      changeLabel: "vs last month",
      testId: "card-month-spent"
    },
    {
      title: "This Month Income",
      value: `KES ${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: "yasinga-success",
      change: "+5.4%",
      changeLabel: "vs last month",
      testId: "card-month-income"
    },
    {
      title: "Total Transactions",
      value: transactionCount.toString(),
      icon: Clock,
      color: "yasinga-warning",
      change: "",
      changeLabel: "this month",
      testId: "card-transactions"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={card.title} className="yasinga-card" data-testid={card.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yasinga-slate-600">{card.title}</p>
                  <p className="text-2xl font-bold text-yasinga-slate-800">{card.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${card.color} bg-opacity-10 rounded-lg flex items-center justify-center border border-${card.color} border-opacity-20`}>
                  <IconComponent className={`w-6 h-6 text-${card.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {card.change && (
                  <span className={card.change.startsWith('+') ? 'text-yasinga-success font-medium' : 'text-yasinga-error font-medium'}>
                    {card.change}
                  </span>
                )}
                <span className="text-yasinga-slate-500 ml-1">{card.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
