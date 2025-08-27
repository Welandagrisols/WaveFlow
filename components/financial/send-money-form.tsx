import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NotebookTabs } from "lucide-react";

const sendMoneySchema = z.object({
  recipientPhone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  categoryId: z.string().optional(),
  notes: z.string().max(60, "Notes must be 60 characters or less").optional(),
});

type SendMoneyData = z.infer<typeof sendMoneySchema>;

export default function SendMoneyForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculatedFee, setCalculatedFee] = useState(0);

  const form = useForm<SendMoneyData>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      recipientPhone: "",
      amount: "",
      categoryId: "",
      notes: "",
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const sendMoneyMutation = useMutation({
    mutationFn: async (data: SendMoneyData) => {
      const transactionData = {
        amount: data.amount,
        direction: 'OUT',
        description: `Money sent to ${data.recipientPhone}`,
        payeePhone: data.recipientPhone,
        categoryId: data.categoryId || null,
        transactionType: 'MPESA',
        notes: data.notes,
        status: 'COMPLETED',
      };
      
      await apiRequest("POST", "/api/transactions", transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/summary"] });
      toast({
        title: "Success",
        description: "Money sent successfully!",
      });
      form.reset();
      setCalculatedFee(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send money. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SendMoneyData) => {
    sendMoneyMutation.mutate(data);
  };

  // Calculate fee based on amount (mock calculation)
  const amount = form.watch("amount");
  const numericAmount = Number(amount) || 0;
  const fee = numericAmount > 0 ? Math.min(Math.max(numericAmount * 0.01, 5), 50) : 0;
  const total = numericAmount + fee;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="recipientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Phone Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="254XXXXXXXXX"
                    {...field}
                    className="yasinga-input pr-10"
                    data-testid="input-recipient-phone"
                  />
                  <NotebookTabs className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 cursor-pointer" />
                </div>
              </FormControl>
              <p className="text-xs text-slate-500">Format: 254XXXXXXXXX</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 font-medium">
                    KES
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    className="yasinga-input pl-14"
                    data-testid="input-amount"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="yasinga-input" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a note..."
                  maxLength={60}
                  {...field}
                  className="yasinga-input resize-none"
                  data-testid="textarea-notes"
                />
              </FormControl>
              <p className="text-xs text-slate-500">Maximum 60 characters</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Summary */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Amount</span>
            <span className="text-sm font-medium" data-testid="summary-amount">
              KES {numericAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Transaction Fee</span>
            <span className="text-sm font-medium" data-testid="summary-fee">
              KES {fee.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800">Total</span>
              <span className="font-bold text-slate-800" data-testid="summary-total">
                KES {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={sendMoneyMutation.isPending || !form.formState.isValid}
          className="w-full yasinga-btn-primary"
          data-testid="button-send-money"
        >
          {sendMoneyMutation.isPending ? "Sending..." : "Send Money"}
        </Button>
      </form>
    </Form>
  );
}
