import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Clock, CheckCircle, AlertTriangle, Lightbulb, Droplets, Wifi, User } from "lucide-react";
import { format } from "date-fns";

export default function TrackPayments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: paymentReminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/payment-reminders"],
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/payment-reminders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-reminders"] });
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const getPaymentIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('water')) return Droplets;
    if (titleLower.includes('electric') || titleLower.includes('power')) return Lightbulb;
    if (titleLower.includes('internet') || titleLower.includes('wifi')) return Wifi;
    return User;
  };

  const getStatusColor = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = now > due && status === 'PENDING';
    
    if (status === 'COMPLETED') return 'bg-yasinga-success/10 text-yasinga-success';
    if (isOverdue) return 'bg-yasinga-error/10 text-yasinga-error';
    if (status === 'PENDING') return 'bg-yasinga-warning/10 text-yasinga-warning';
    return 'bg-slate-100 text-slate-600';
  };

  const getStatusText = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = now > due && status === 'PENDING';
    
    if (isOverdue) return 'Overdue';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const pendingPayments = paymentReminders.filter(p => p.status === 'PENDING');
  const completedPayments = paymentReminders.filter(p => p.status === 'COMPLETED');
  const upcomingPayments = paymentReminders.filter(p => {
    const now = new Date();
    const due = new Date(p.dueDate);
    return p.status === 'PENDING' && due > now;
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 yasinga-fade-in">
      <Card className="yasinga-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Payment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Pending Payments */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yasinga-warning" />
                Pending Payments ({pendingPayments.length})
              </h4>
              {remindersLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse border border-slate-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                          <div>
                            <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-24" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                          <div className="h-6 bg-slate-200 rounded w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingPayments.length > 0 ? (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => {
                    const IconComponent = getPaymentIcon(payment.title);
                    const now = new Date();
                    const due = new Date(payment.dueDate);
                    const isOverdue = now > due;
                    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={payment.id}
                        className={`border p-4 rounded-lg ${isOverdue ? 'border-yasinga-error/20 bg-yasinga-error/5' : 'border-yasinga-warning/20 bg-yasinga-warning/5'}`}
                        data-testid={`payment-${payment.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${isOverdue ? 'bg-yasinga-error/20' : 'bg-yasinga-warning/20'} rounded-lg flex items-center justify-center`}>
                              <IconComponent className={`w-5 h-5 ${isOverdue ? 'text-yasinga-error' : 'text-yasinga-warning'}`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{payment.title}</p>
                              <p className="text-sm text-slate-500">
                                {isOverdue 
                                  ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                                  : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-3">
                            <div>
                              <p className="font-semibold text-slate-800">
                                KES {Number(payment.amount).toLocaleString()}
                              </p>
                              <Badge className={getStatusColor(payment.status, payment.dueDate)}>
                                {getStatusText(payment.status, payment.dueDate)}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: payment.id, status: 'COMPLETED' })}
                              disabled={updateStatusMutation.isPending}
                              className="text-yasinga-success border-yasinga-success hover:bg-yasinga-success hover:text-white"
                              data-testid={`button-mark-paid-${payment.id}`}
                            >
                              Mark Paid
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg" data-testid="text-no-pending-payments">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No pending payments</p>
                </div>
              )}
            </div>

            {/* Recently Completed */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-yasinga-success" />
                Recently Completed
              </h4>
              {completedPayments.length > 0 ? (
                <div className="space-y-4">
                  {completedPayments.slice(0, 3).map((payment) => {
                    const IconComponent = getPaymentIcon(payment.title);
                    
                    return (
                      <div
                        key={payment.id}
                        className="border border-yasinga-success/20 bg-yasinga-success/5 p-4 rounded-lg"
                        data-testid={`completed-payment-${payment.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yasinga-success/20 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-yasinga-success" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{payment.title}</p>
                              <p className="text-sm text-slate-500">
                                Completed {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">
                              KES {Number(payment.amount).toLocaleString()}
                            </p>
                            <Badge className="bg-yasinga-success/10 text-yasinga-success">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg" data-testid="text-no-completed-payments">
                  <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No completed payments</p>
                </div>
              )}
            </div>

            {/* Upcoming Reminders */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-slate-600" />
                Upcoming Reminders
              </h4>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.slice(0, 3).map((payment) => {
                    const IconComponent = getPaymentIcon(payment.title);
                    const daysUntilDue = Math.ceil((new Date(payment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={payment.id}
                        className="border border-slate-200 p-4 rounded-lg"
                        data-testid={`upcoming-payment-${payment.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{payment.title}</p>
                              <p className="text-sm text-slate-500">
                                Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">
                              KES {Number(payment.amount).toLocaleString()}
                            </p>
                            <Badge className="bg-slate-100 text-slate-600">
                              Upcoming
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg" data-testid="text-no-upcoming-payments">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No upcoming payment reminders</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
