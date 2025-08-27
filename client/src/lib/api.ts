
import { supabase, isSupabaseConfigured } from './supabase';

async function getAuthHeaders(): Promise<HeadersInit> {
  if (!isSupabaseConfigured) {
    return { 'Content-Type': 'application/json' };
  }
  
  const { data: { session } } = await supabase!.auth.getSession();
  
  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }
  
  return { 'Content-Type': 'application/json' };
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  
  return fetch(endpoint, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}

// Supabase query functions
export const supabaseApi = {
  // Get transactions
  getTransactions: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('transactions')
      .select(`
        *,
        categories(name, color)
      `)
      .order('transactionDate', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get transaction summary
  getTransactionSummary: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('transactions')
      .select('amount, direction');

    if (error) throw error;

    const summary = data?.reduce((acc: any, transaction: any) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.direction === 'IN') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      acc.transactionCount++;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, transactionCount: 0 });

    return summary || { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };
  },

  // Get categories
  getCategories: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('categories')
      .select(`
        *,
        transactions(amount)
      `);

    if (error) throw error;

    return data?.map((category: any) => ({
      ...category,
      count: category.transactions?.length || 0,
      amount: category.transactions?.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0
    })) || [];
  },

  // Create transaction
  createTransaction: async (transaction: any) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase!
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get SMS transactions
  getSmsTransactions: async () => {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await supabase!
      .from('sms_transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Helper for common API calls
export const api = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  patch: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};
