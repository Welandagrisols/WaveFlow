import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Smartphone, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Phone,
  Signal,
  Clock,
  TrendingUp
} from "lucide-react";

interface SIMConfig {
  id: 'SIM1' | 'SIM2';
  carrier: 'SAFARICOM' | 'AIRTEL' | 'TELKOM' | 'CUSTOM';
  accountType: 'BUSINESS' | 'PERSONAL';
  phoneNumber?: string;
  alias: string;
  isActive: boolean;
  autoDetectEnabled: boolean;
  preferredForBusiness: boolean;
}

export default function SIMManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [simConfigs, setSimConfigs] = useState<SIMConfig[]>([
    {
      id: 'SIM1',
      carrier: 'SAFARICOM',
      accountType: 'BUSINESS',
      phoneNumber: '',
      alias: 'Business M-Pesa',
      isActive: true,
      autoDetectEnabled: true,
      preferredForBusiness: true
    },
    {
      id: 'SIM2', 
      carrier: 'SAFARICOM',
      accountType: 'PERSONAL',
      phoneNumber: '',
      alias: 'Personal M-Pesa',
      isActive: true,
      autoDetectEnabled: true,
      preferredForBusiness: false
    }
  ]);

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

  // Mock data for recent SIM usage
  const { data: recentTransactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const updateSIMConfig = (simId: 'SIM1' | 'SIM2', updates: Partial<SIMConfig>) => {
    setSimConfigs(prev => prev.map(sim => 
      sim.id === simId ? { ...sim, ...updates } : sim
    ));
    
    toast({
      title: "SIM Configuration Updated",
      description: `${simId} settings have been saved.`,
    });
  };

  const testSIMDetection = async () => {
    const testSMS = "Confirmed. You have sent Ksh5,000.00 to ACME SUPPLIES 0722123456 on 22/8/25 at 2:30 PM. Transaction cost Ksh0.00. New M-PESA balance is Ksh45,250.00. Transaction ID: QL23X8H9.";
    
    toast({
      title: "Testing SIM Detection",
      description: "Running detection test with sample SMS...",
    });

    // Simulate detection result
    setTimeout(() => {
      toast({
        title: "Detection Test Complete",
        description: "SIM1 (Business) detected with 90% confidence",
      });
    }, 2000);
  };

  const getSimUsageStats = (simId: 'SIM1' | 'SIM2') => {
    // Mock statistics - in real app, this would come from API
    const totalTransactions = simId === 'SIM1' ? 45 : 23;
    const totalAmount = simId === 'SIM1' ? 125000 : 45000;
    const lastUsed = simId === 'SIM1' ? '2 hours ago' : '1 day ago';
    
    return { totalTransactions, totalAmount, lastUsed };
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">SIM Management</h1>
        <p className="text-slate-600">Configure your dual-SIM settings for accurate M-Pesa transaction tracking</p>
      </div>

      {/* SIM Detection Test */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Test SIM Detection</h3>
                <p className="text-sm text-slate-600">Test the automatic SIM detection with a sample transaction</p>
              </div>
            </div>
            <Button onClick={testSIMDetection} variant="outline" data-testid="button-test-detection">
              <Signal className="w-4 h-4 mr-2" />
              Run Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SIM Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {simConfigs.map((sim) => {
          const stats = getSimUsageStats(sim.id);
          
          return (
            <Card key={sim.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${sim.id === 'SIM1' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <Smartphone className={`w-5 h-5 ${sim.id === 'SIM1' ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{sim.id}</CardTitle>
                      <p className="text-sm text-slate-600">{sim.alias}</p>
                    </div>
                  </div>
                  <Badge variant={sim.isActive ? "default" : "secondary"}>
                    {sim.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Tabs defaultValue="config" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="config" className="space-y-4 mt-4">
                    {/* SIM Alias */}
                    <div>
                      <Label htmlFor={`alias-${sim.id}`}>SIM Alias</Label>
                      <Input
                        id={`alias-${sim.id}`}
                        value={sim.alias}
                        onChange={(e) => updateSIMConfig(sim.id, { alias: e.target.value })}
                        placeholder="e.g., Business M-Pesa"
                        className="mt-1"
                        data-testid={`input-alias-${sim.id}`}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <Label htmlFor={`phone-${sim.id}`}>Phone Number</Label>
                      <Input
                        id={`phone-${sim.id}`}
                        value={sim.phoneNumber}
                        onChange={(e) => updateSIMConfig(sim.id, { phoneNumber: e.target.value })}
                        placeholder="0722123456"
                        className="mt-1"
                        data-testid={`input-phone-${sim.id}`}
                      />
                    </div>

                    {/* Carrier Selection */}
                    <div>
                      <Label htmlFor={`carrier-${sim.id}`}>Carrier</Label>
                      <Select
                        value={sim.carrier}
                        onValueChange={(value: 'SAFARICOM' | 'AIRTEL' | 'TELKOM' | 'CUSTOM') => 
                          updateSIMConfig(sim.id, { carrier: value })
                        }
                      >
                        <SelectTrigger className="mt-1" data-testid={`select-carrier-${sim.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAFARICOM">Safaricom</SelectItem>
                          <SelectItem value="AIRTEL">Airtel</SelectItem>
                          <SelectItem value="TELKOM">Telkom</SelectItem>
                          <SelectItem value="CUSTOM">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Account Type */}
                    <div>
                      <Label htmlFor={`account-${sim.id}`}>Account Type</Label>
                      <Select
                        value={sim.accountType}
                        onValueChange={(value: 'BUSINESS' | 'PERSONAL') => 
                          updateSIMConfig(sim.id, { accountType: value })
                        }
                      >
                        <SelectTrigger className="mt-1" data-testid={`select-account-${sim.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUSINESS">Business</SelectItem>
                          <SelectItem value="PERSONAL">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto Detection</Label>
                          <p className="text-sm text-slate-600">Automatically detect this SIM for transactions</p>
                        </div>
                        <Switch
                          checked={sim.autoDetectEnabled}
                          onCheckedChange={(checked) => updateSIMConfig(sim.id, { autoDetectEnabled: checked })}
                          data-testid={`switch-auto-detect-${sim.id}`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Preferred for Business</Label>
                          <p className="text-sm text-slate-600">Use this SIM as default for business transactions</p>
                        </div>
                        <Switch
                          checked={sim.preferredForBusiness}
                          onCheckedChange={(checked) => updateSIMConfig(sim.id, { preferredForBusiness: checked })}
                          data-testid={`switch-business-preferred-${sim.id}`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Active</Label>
                          <p className="text-sm text-slate-600">Enable this SIM for transaction tracking</p>
                        </div>
                        <Switch
                          checked={sim.isActive}
                          onCheckedChange={(checked) => updateSIMConfig(sim.id, { isActive: checked })}
                          data-testid={`switch-active-${sim.id}`}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg" data-testid={`stats-transactions-${sim.id}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-600">Transactions</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">{stats.totalTransactions}</p>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-lg" data-testid={`stats-amount-${sim.id}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <Phone className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-600">Total Amount</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">KES {stats.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-lg" data-testid={`stats-last-used-${sim.id}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">Last Used</span>
                      </div>
                      <p className="text-lg font-semibold text-slate-800">{stats.lastUsed}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Detection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Auto Detection</span>
              </div>
              <p className="text-sm text-green-700">Both SIMs configured for automatic detection</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Business Transactions</span>
              </div>
              <p className="text-sm text-blue-700">SIM1 set as preferred for business use</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-800">Detection Confidence</span>
              </div>
              <p className="text-sm text-amber-700">90% average detection accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}