import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, ShoppingCart, Car, Zap, User, Building } from "lucide-react";

export default function Transactions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("30");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const getTransactionIcon = (transaction: any) => {
    const iconMap: { [key: string]: any } = {
      'MPESA': ShoppingCart,
      'BANK': Building,
      'CASH': User,
    };
    
    const IconComponent = iconMap[transaction.transactionType] || ShoppingCart;
    const isIncome = transaction.direction === 'IN';
    const colorClass = isIncome ? 'text-yasinga-success' : 'text-yasinga-error';
    
    return (
      <div className={`w-10 h-10 ${isIncome ? 'bg-yasinga-success' : 'bg-yasinga-error'} bg-opacity-10 rounded-lg flex items-center justify-center`}>
        <IconComponent className={`w-5 h-5 ${colorClass}`} />
      </div>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (categoryFilter !== "all" && transaction.categoryId !== categoryFilter) {
      return false;
    }
    
    const transactionDate = new Date(transaction.transactionDate);
    const now = new Date();
    const daysAgo = parseInt(periodFilter);
    const filterDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return transactionDate >= filterDate;
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
          <div className="h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 yasinga-fade-in">
      <Card className="yasinga-card">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-lg font-semibold text-slate-800">All Transactions</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-period-filter">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {transactionsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-slate-600">Date</th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600">Description</th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600">Category</th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600">Amount</th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransactions.map((transaction) => {
                    const category = categories.find(cat => cat.id === transaction.categoryId);
                    const isIncome = transaction.direction === 'IN';
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-slate-50 transition-colors" data-testid={`transaction-row-${transaction.id}`}>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction)}
                            <div>
                              <p className="font-medium text-slate-800" data-testid={`transaction-description-${transaction.id}`}>
                                {transaction.description}
                              </p>
                              <p className="text-xs text-slate-500">
                                {transaction.transactionType} Transaction
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {category?.name || 'Uncategorized'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-semibold ${isIncome ? 'text-yasinga-success' : 'text-yasinga-error'}`}>
                            {isIncome ? '+' : '-'}KES {Number(transaction.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant={transaction.status === 'COMPLETED' ? 'default' : 'secondary'}
                            className={transaction.status === 'COMPLETED' ? 'bg-yasinga-success/10 text-yasinga-success' : ''}
                          >
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12" data-testid="text-no-transactions">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">No transactions found</h3>
              <p className="text-slate-500">
                {categoryFilter !== "all" || periodFilter !== "30" 
                  ? "Try adjusting your filters to see more transactions."
                  : "Your transactions will appear here once you start using the app."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
