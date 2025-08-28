
import { supabase } from './supabase';

const API_BASE = '/api';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Transactions
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transaction: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: any) {
    return this.request(`/transactions?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // SMS Processing
  async processSms(message: string, phoneNumber?: string) {
    return this.request('/process-sms', {
      method: 'POST',
      body: JSON.stringify({ message, phoneNumber }),
    });
  }

  // Transaction summaries
  async getTransactionSummary() {
    return this.request('/transactions/summary');
  }

  async getTransactionsByCategory(period: string = 'month') {
    return this.request(`/transactions/by-category?period=${period}`);
  }

  async getUnconfirmedSmsTransactions() {
    return this.request('/sms-transactions/unconfirmed');
  }
}

export const api = new ApiClient();
