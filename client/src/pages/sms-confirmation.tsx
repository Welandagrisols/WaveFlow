import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Clock, CheckCircle, AlertCircle, Building2, User } from "lucide-react";
import type { SmsTransaction, Category, Supplier } from "@shared/schema";

interface UnconfirmedTransaction extends SmsTransaction {
  parsedAmount?: number;
  suggestedSupplier?: Supplier;
}

export default function SmsConfirmation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch unconfirmed SMS transactions
  const { data: unconfirmedTransactions = [], isLoading } = useQuery<UnconfirmedTransaction[]>({
    queryKey: ["/api/sms-transactions/unconfirmed"],
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch suppliers for suggestions
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const confirmTransactionMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      itemName: string;
      supplierName: string;
      categoryId: string;
      isPersonal: boolean;
    }) => {
      const { id, ...body } = data;
      return await apiRequest(`/api/sms-transactions/${id}/confirm`, {
        method: "PATCH",
        body: body,
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction confirmed",
        description: "The SMS transaction has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sms-transactions/unconfirmed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/summary"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to confirm transaction. Please try again.",
        variant: "destructive",
      });
      console.error("Confirmation error:", error);
    },
  });

  const [confirmationForms, setConfirmationForms] = useState<Record<string, {
    itemName: string;
    supplierName: string;
    categoryId: string;
    isPersonal: boolean;
  }>>({});

  const updateForm = (transactionId: string, updates: Partial<typeof confirmationForms[string]>) => {
    setConfirmationForms(prev => ({
      ...prev,
      [transactionId]: { ...prev[transactionId], ...updates }
    }));
  };

  const getForm = (transactionId: string) => {
    return confirmationForms[transactionId] || {
      itemName: '',
      supplierName: '',
      categoryId: '',
      isPersonal: false
    };
  };

  const handleConfirm = async (transaction: UnconfirmedTransaction) => {
    const form = getForm(transaction.id);
    
    if (!form.itemName || !form.supplierName || !form.categoryId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    confirmTransactionMutation.mutate({
      id: transaction.id,
      ...form,
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(numAmount);
  };

  const getSuggestedSupplier = (phone: string): Supplier | undefined => {
    return suppliers.find(s => s.phone === phone);
  };

  const initializeForm = (transaction: UnconfirmedTransaction) => {
    if (confirmationForms[transaction.id]) return;

    const suggestedSupplier = getSuggestedSupplier(transaction.recipientPhone || '');
    const defaultCategory = categories.find(c => c.name === 'Food & Dining')?.id || 
                          categories.find(c => !c.isBusiness)?.id || 
                          categories[0]?.id || '';

    setConfirmationForms(prev => ({
      ...prev,
      [transaction.id]: {
        itemName: '',
        supplierName: suggestedSupplier?.name || transaction.recipientName || '',
        categoryId: suggestedSupplier?.defaultCategoryId || defaultCategory,
        isPersonal: transaction.accountType === 'personal'
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Confirm Transactions</h1>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Confirm Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and categorize your M-Pesa transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {unconfirmedTransactions.length} pending
          </span>
        </div>
      </div>

      {unconfirmedTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No unconfirmed transactions. New M-Pesa SMS messages will appear here for quick confirmation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {unconfirmedTransactions.map((transaction) => {
            const form = getForm(transaction.id);
            const suggestedSupplier = getSuggestedSupplier(transaction.recipientPhone || '');
            
            // Initialize form if not exists
            if (!confirmationForms[transaction.id]) {
              initializeForm(transaction);
            }

            return (
              <Card key={transaction.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </span>
                        <Badge variant="outline">
                          {transaction.simCard}
                        </Badge>
                        <Badge variant={transaction.accountType === 'business' ? 'default' : 'secondary'}>
                          {transaction.accountType === 'business' ? (
                            <><Building2 className="w-3 h-3 mr-1" /> Business</>
                          ) : (
                            <><User className="w-3 h-3 mr-1" /> Personal</>
                          )}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {transaction.recipientName && (
                          <span className="font-medium">{transaction.recipientName}</span>
                        )}
                        {transaction.recipientPhone && (
                          <span className="text-gray-500"> • {transaction.recipientPhone}</span>
                        )}
                        <span className="text-gray-500"> • {transaction.transactionCode}</span>
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">SMS Text</Label>
                    <p className="text-sm mt-1 font-mono">{transaction.smsText}</p>
                  </div>

                  {suggestedSupplier && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Known Supplier Detected
                        </span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Previous purchases: {suggestedSupplier.commonItems?.join(', ') || 'None recorded'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`item-${transaction.id}`}>What was purchased?</Label>
                      <Input
                        id={`item-${transaction.id}`}
                        placeholder="e.g., Tomatoes, Cooking oil, Rent"
                        value={form.itemName}
                        onChange={(e) => updateForm(transaction.id, { itemName: e.target.value })}
                        data-testid={`input-item-${transaction.id}`}
                      />
                      {suggestedSupplier?.commonItems && suggestedSupplier.commonItems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestedSupplier.commonItems.slice(0, 3).map((item) => (
                            <Button
                              key={item}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => updateForm(transaction.id, { itemName: item })}
                              data-testid={`button-suggest-${item}`}
                            >
                              {item}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`supplier-${transaction.id}`}>Supplier/Payee</Label>
                      <Input
                        id={`supplier-${transaction.id}`}
                        placeholder="e.g., John's Grocery, Mama Mboga"
                        value={form.supplierName}
                        onChange={(e) => updateForm(transaction.id, { supplierName: e.target.value })}
                        data-testid={`input-supplier-${transaction.id}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`category-${transaction.id}`}>Category</Label>
                      <Select
                        value={form.categoryId}
                        onValueChange={(value) => updateForm(transaction.id, { categoryId: value })}
                      >
                        <SelectTrigger data-testid={`select-category-${transaction.id}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`personal-${transaction.id}`}>Personal Expense</Label>
                        <Switch
                          id={`personal-${transaction.id}`}
                          checked={form.isPersonal}
                          onCheckedChange={(checked) => updateForm(transaction.id, { isPersonal: checked })}
                          data-testid={`switch-personal-${transaction.id}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Toggle on if this was a personal expense, not business-related
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={confirmTransactionMutation.isPending}
                      data-testid={`button-skip-${transaction.id}`}
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={() => handleConfirm(transaction)}
                      disabled={confirmTransactionMutation.isPending || !form.itemName || !form.supplierName || !form.categoryId}
                      data-testid={`button-confirm-${transaction.id}`}
                    >
                      {confirmTransactionMutation.isPending ? "Confirming..." : "Confirm Transaction"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Test SMS Input for Demo */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Test SMS Processing</CardTitle>
          <CardDescription>
            Paste an M-Pesa SMS here to test the automatic detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestSmsForm onSubmit={() => queryClient.invalidateQueries({ queryKey: ["/api/sms-transactions/unconfirmed"] })} />
        </CardContent>
      </Card>
    </div>
  );
}

// Test SMS form component
function TestSmsForm({ onSubmit }: { onSubmit: () => void }) {
  const [smsText, setSmsText] = useState('');
  const [simCard, setSimCard] = useState('SIM1');
  const { toast } = useToast();

  const processSms = useMutation({
    mutationFn: async (data: { smsText: string; simCard: string }) => {
      return await apiRequest('/api/sms-transactions', {
        method: 'POST',
        body: JSON.stringify({
          smsText: data.smsText,
          senderNumber: 'M-PESA',
          simCard: data.simCard,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS processed",
        description: "The SMS has been parsed and added for confirmation.",
      });
      setSmsText('');
      onSubmit();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process SMS. Please check the format.",
        variant: "destructive",
      });
      console.error("SMS processing error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsText.trim()) return;
    
    processSms.mutate({ smsText: smsText.trim(), simCard });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="test-sms">M-Pesa SMS Text</Label>
        <Textarea
          id="test-sms"
          placeholder="QE52HJ61MN Confirmed. Ksh2,500.00 sent to JOHN SUPPLIER 0712345678 on 12/3/24 at 2:15 PM. M-PESA balance is Ksh45,200.00..."
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          rows={3}
          data-testid="textarea-test-sms"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="test-sim">SIM Card</Label>
          <Select value={simCard} onValueChange={setSimCard}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SIM1">SIM 1</SelectItem>
              <SelectItem value="SIM2">SIM 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="submit" 
          disabled={!smsText.trim() || processSms.isPending}
          data-testid="button-process-sms"
        >
          {processSms.isPending ? "Processing..." : "Process SMS"}
        </Button>
      </div>
    </form>
  );
}