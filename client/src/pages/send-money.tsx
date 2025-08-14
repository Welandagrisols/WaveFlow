import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SendMoneyForm from "@/components/financial/send-money-form";
import { useQuery } from "@tanstack/react-query";
import { User, Building, ArrowRight } from "lucide-react";

export default function SendMoney() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  // Get recent recipients from outgoing transactions
  const recentRecipients = transactions
    .filter(t => t.direction === 'OUT' && t.payeePhone)
    .reduce((acc, transaction) => {
      const existing = acc.find(r => r.phone === transaction.payeePhone);
      if (!existing) {
        acc.push({
          name: transaction.description,
          phone: transaction.payeePhone!,
          lastTransaction: transaction.transactionDate,
        });
      }
      return acc;
    }, [] as Array<{ name: string; phone: string; lastTransaction: string }>)
    .sort((a, b) => new Date(b.lastTransaction).getTime() - new Date(a.lastTransaction).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse max-w-2xl mx-auto">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
          <div className="h-96 bg-slate-200 rounded-xl mb-6" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 yasinga-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Send Money Form */}
        <Card className="yasinga-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Send Money</CardTitle>
          </CardHeader>
          <CardContent>
            <SendMoneyForm />
          </CardContent>
        </Card>

        {/* Recent Recipients */}
        {recentRecipients.length > 0 && (
          <Card className="yasinga-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRecipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    data-testid={`recipient-${recipient.phone}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yasinga-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        {recipient.name.toLowerCase().includes('ltd') || recipient.name.toLowerCase().includes('limited') ? (
                          <Building className="w-5 h-5 text-yasinga-primary" />
                        ) : (
                          <User className="w-5 h-5 text-yasinga-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{recipient.name}</p>
                        <p className="text-sm text-slate-500">{recipient.phone}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="yasinga-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-yasinga-primary bg-opacity-5 border border-yasinga-primary border-opacity-20 rounded-lg hover:bg-yasinga-primary hover:bg-opacity-10 transition-colors" data-testid="button-pay-bills">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yasinga-primary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Building className="w-6 h-6 text-yasinga-primary" />
                  </div>
                  <p className="font-medium text-slate-800">Pay Bills</p>
                  <p className="text-xs text-slate-500">Electricity, Water, etc.</p>
                </div>
              </button>
              
              <button className="p-4 bg-yasinga-secondary bg-opacity-5 border border-yasinga-secondary border-opacity-20 rounded-lg hover:bg-yasinga-secondary hover:bg-opacity-10 transition-colors" data-testid="button-buy-airtime">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yasinga-secondary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <User className="w-6 h-6 text-yasinga-secondary" />
                  </div>
                  <p className="font-medium text-slate-800">Buy Airtime</p>
                  <p className="text-xs text-slate-500">For self or others</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
