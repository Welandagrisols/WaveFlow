
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Smartphone, Copy, CheckCircle, ArrowRight } from "lucide-react";

export default function SmsGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SMS Processing Guide</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to quickly process M-Pesa SMS messages with Yasinga
        </p>
      </div>

      {/* Quick Workflow */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Quick SMS Workflow (3 Steps)
          </CardTitle>
          <CardDescription>
            Process your M-Pesa transactions in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
                <Copy className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Copy SMS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Long-press your M-Pesa SMS and select "Copy"
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Open Yasinga</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open the app and go to "Confirm SMS"
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Auto-Process</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste SMS and it's automatically processed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Native App Information */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200">
            📱 About Native App Development
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800 dark:text-amber-200">
          <p className="mb-4">
            While Yasinga currently runs as a PWA (web app), creating a native mobile app that 
            automatically reads SMS requires different technology and platform-specific development.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Why SMS Auto-Detection Requires Native Apps:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Web browsers cannot access SMS for security reasons</li>
              <li>Native apps need special SMS read permissions</li>
              <li>Background processing requires native mobile development</li>
            </ul>
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <p className="text-sm">
              <strong>Current Solution:</strong> Our PWA offers the fastest manual workflow possible. 
              The auto-processing feature makes SMS entry nearly instant once copied.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
