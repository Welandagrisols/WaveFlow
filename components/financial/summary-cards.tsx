import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";

interface SummaryCardsProps {
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  };
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const totalBalance = totalIncome - totalExpenses;
  const transactionCount = summary?.transactionCount || 0;

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

  const getCardColors = (color: string) => {
    switch (color) {
      case "yasinga-primary":
        return { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", ring: "ring-blue-100" };
      case "yasinga-error":
        return { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", ring: "ring-red-100" };
      case "yasinga-success":
        return { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", ring: "ring-green-100" };
      case "yasinga-warning":
        return { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", ring: "ring-orange-100" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600", ring: "ring-gray-100" };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const colors = getCardColors(card.color);
        
        return (
          <Card key={card.title} className="yasinga-card border-0 shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={card.testId}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900 leading-tight">{card.value}</p>
                </div>
                <div className={`w-14 h-14 ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center ring-4 ${colors.ring} ml-3`}>
                  <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                </div>
              </div>
              <div className="flex items-center text-sm">
                {card.change && (
                  <span className={`font-medium ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change}
                  </span>
                )}
                <span className="text-slate-500 ml-1">{card.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
