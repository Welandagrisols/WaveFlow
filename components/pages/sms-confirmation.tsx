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
      isLoan?: boolean;
      loanRecipient?: string;
      expectedRepaymentDate?: string;
    }) => {
      const { id, ...body } = data;
      return await apiRequest("PATCH", `/api/sms-transactions/${id}/confirm`, body);
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
    isLoan: boolean;
    loanRecipient: string;
    expectedRepaymentDate: string;
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
      isPersonal: false,
      isLoan: false,
      loanRecipient: '',
      expectedRepaymentDate: ''
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

  const handleSkip = async (transactionId: string) => {
    try {
      // For now, just remove from local state - in a real app you might want to mark it as skipped
      setConfirmationForms(prev => {
        const { [transactionId]: _, ...rest } = prev;
        return rest;
      });
      
      toast({
        title: "Transaction skipped",
        description: "Transaction skipped for now. You can process it later.",
      });
      
      // Refresh the list to remove the skipped transaction from view
      queryClient.invalidateQueries({ queryKey: ["/api/sms-transactions/unconfirmed"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip transaction.",
        variant: "destructive",
      });
    }
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
    
    // Use intelligent suggestions from the SMS parser
    const suggestedPurpose = (transaction as any).suggestedPurpose || '';
    const suggestedCategoryName = (transaction as any).suggestedCategory || '';
    
    // Find category ID by name from suggestions, or use default
    const suggestedCategory = categories.find(c => c.name === suggestedCategoryName);
    const defaultCategory = suggestedCategory?.id ||
                          categories.find(c => c.name === 'Food & Beverages')?.id || 
                          categories.find(c => c.name === 'Kitchen Supplies')?.id ||
                          categories.find(c => !c.isBusiness)?.id || 
                          categories[0]?.id || '';

    setConfirmationForms(prev => ({
      ...prev,
      [transaction.id]: {
        itemName: suggestedPurpose, // Auto-fill with intelligent suggestion
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
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown date'}
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

                  {(transaction as any).suggestedPurpose && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          Smart Suggestions Applied
                        </span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Auto-detected: <strong>{(transaction as any).suggestedPurpose}</strong> → <strong>{(transaction as any).suggestedCategory}</strong>
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        You can edit these suggestions as needed
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

                    <div className="space-y-3">
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

                      {form.isPersonal && (
                        <div className="ml-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`loan-${transaction.id}`} className="text-orange-800 dark:text-orange-300 text-sm font-medium">
                              Is this a loan to someone?
                            </Label>
                            <Switch
                              id={`loan-${transaction.id}`}
                              checked={form.isLoan || false}
                              onCheckedChange={(checked) => updateForm(transaction.id, { isLoan: checked })}
                              data-testid={`switch-loan-${transaction.id}`}
                            />
                          </div>

                          {form.isLoan && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor={`recipient-${transaction.id}`} className="text-orange-800 dark:text-orange-300">
                                  Who received this loan?
                                </Label>
                                <Input
                                  id={`recipient-${transaction.id}`}
                                  placeholder="e.g., John, Sister, Friend"
                                  value={form.loanRecipient || ''}
                                  onChange={(e) => updateForm(transaction.id, { loanRecipient: e.target.value })}
                                  className="border-orange-300 focus:border-orange-500"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`repayment-${transaction.id}`} className="text-orange-800 dark:text-orange-300">
                                  Expected repayment date
                                </Label>
                                <Input
                                  type="date"
                                  id={`repayment-${transaction.id}`}
                                  value={form.expectedRepaymentDate || ''}
                                  onChange={(e) => updateForm(transaction.id, { expectedRepaymentDate: e.target.value })}
                                  className="border-orange-300 focus:border-orange-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSkip(transaction.id)}
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
      
      {/* Quick SMS Input */}
      <Card className="border-dashed bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Quick SMS Processing
          </CardTitle>
          <CardDescription>
            Paste your M-Pesa SMS here for instant processing. The app will automatically detect transaction details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuickSmsForm onSubmit={() => queryClient.invalidateQueries({ queryKey: ["/api/sms-transactions/unconfirmed"] })} />
        </CardContent>
      </Card>

      {/* SMS Templates for Quick Access */}
      <Card className="border-dashed bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common M-Pesa transaction templates for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmsTemplates onTemplateSelect={(template) => {
            queryClient.invalidateQueries({ queryKey: ["/api/sms-transactions/unconfirmed"] });
          }} />
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced SMS form component with auto-detection
function QuickSmsForm({ onSubmit }: { onSubmit: () => void }) {
  const [smsText, setSmsText] = useState('');
  const [simCard, setSimCard] = useState('SIM1');
  const [autoProcess, setAutoProcess] = useState(true);
  const { toast } = useToast();

  const processSms = useMutation({
    mutationFn: async (data: { smsText: string; simCard: string }) => {
      return await apiRequest('POST', '/api/sms-transactions', {
        smsText: data.smsText,
        senderNumber: 'M-PESA',
        simCard: data.simCard,
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS processed instantly",
        description: "Transaction detected and parsed automatically.",
      });
      setSmsText('');
      onSubmit();
    },
    onError: (error) => {
      toast({
        title: "Processing failed",
        description: "Check SMS format and try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-process when SMS is pasted (if auto-process enabled)
  const handleTextChange = (value: string) => {
    setSmsText(value);
    
    if (autoProcess && value.trim().length > 50 && value.toLowerCase().includes('ksh')) {
      // Auto-detect SIM card from SMS content
      const detectedSim = value.toLowerCase().includes('business') || 
                         value.toLowerCase().includes('paybill') ? 'SIM1' : 'SIM2';
      setSimCard(detectedSim);
      
      // Auto-process after short delay
      setTimeout(() => {
        if (value.trim()) {
          processSms.mutate({ smsText: value.trim(), simCard: detectedSim });
        }
      }, 1000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsText.trim()) return;
    processSms.mutate({ smsText: smsText.trim(), simCard });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-process"
            checked={autoProcess}
            onCheckedChange={setAutoProcess}
          />
          <Label htmlFor="auto-process" className="text-sm font-medium">
            Auto-process when pasted
          </Label>
        </div>
        <Badge variant={autoProcess ? "default" : "secondary"}>
          {autoProcess ? "Auto Mode" : "Manual Mode"}
        </Badge>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quick-sms">Paste M-Pesa SMS Here</Label>
          <Textarea
            id="quick-sms"
            placeholder="Paste your M-Pesa SMS message here. In auto mode, it will be processed automatically..."
            value={smsText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={4}
            className="font-mono text-sm"
            data-testid="textarea-quick-sms"
          />
          <p className="text-xs text-gray-500">
            {autoProcess ? "SMS will be processed automatically when pasted" : "Click 'Process SMS' to manually process"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="quick-sim">SIM Card</Label>
            <Select value={simCard} onValueChange={setSimCard}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM1">SIM 1 (Business)</SelectItem>
                <SelectItem value="SIM2">SIM 2 (Personal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!autoProcess && (
            <Button 
              type="submit" 
              disabled={!smsText.trim() || processSms.isPending}
              data-testid="button-quick-process"
            >
              {processSms.isPending ? "Processing..." : "Process SMS"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// SMS templates for quick testing
function SmsTemplates({ onTemplateSelect }: { onTemplateSelect: (template: string) => void }) {
  const templates = [
    {
      name: "Food Supplier Payment",
      sms: "QE52HJ61MN Confirmed. Ksh2,500.00 sent to FRESH VEGETABLES SUPPLIER 0712345678 on 12/3/24 at 2:15 PM. M-PESA balance is Ksh45,200.00.",
      category: "Business"
    },
    {
      name: "Utility Bill Payment", 
      sms: "QF62KL71NP Confirmed. Ksh8,500.00 sent to KENYA POWER 0711223344 on 12/3/24 at 3:30 PM. M-PESA balance is Ksh36,700.00.",
      category: "Business"
    },
    {
      name: "Personal Transfer",
      sms: "QG72MN82OQ Confirmed. Ksh1,200.00 sent to JANE DOE 0733445566 on 12/3/24 at 4:45 PM. M-PESA balance is Ksh35,500.00.",
      category: "Personal"
    }
  ];

  const processSms = useMutation({
    mutationFn: async (data: { smsText: string; simCard: string }) => {
      return await apiRequest('POST', '/api/sms-transactions', {
        smsText: data.smsText,
        senderNumber: 'M-PESA',
        simCard: data.simCard,
      });
    },
    onSuccess: () => {
      onTemplateSelect("processed");
    },
  });

  const handleTemplateClick = (template: typeof templates[0]) => {
    const simCard = template.category === "Business" ? "SIM1" : "SIM2";
    processSms.mutate({ smsText: template.sms, simCard });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {templates.map((template, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto p-3 flex flex-col items-start text-left"
          onClick={() => handleTemplateClick(template)}
          disabled={processSms.isPending}
        >
          <div className="font-medium text-sm">{template.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            {template.category} • Ksh{template.sms.match(/Ksh([\d,\.]+)/)?.[1]}
          </div>
        </Button>
      ))}
    </div>
  );
}