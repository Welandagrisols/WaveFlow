// M-Pesa SMS Parser
// Handles parsing of M-Pesa transaction SMS messages

export interface ParsedSmsTransaction {
  amount: number;
  recipientPhone?: string;
  recipientName?: string;
  transactionCode: string;
  balance?: number;
  isValid: boolean;
  transactionType: 'SENT' | 'RECEIVED' | 'WITHDRAWN' | 'DEPOSITED' | 'UNKNOWN';
  suggestedPurpose?: string;
  suggestedCategory?: string;
}

export class MpesaSmsParser {
  // Common M-Pesa SMS patterns
  private static readonly SENT_PATTERNS = [
    /(?:(\w+)\s+)?sent\s+to\s+(\d{10})\s+(\w+\s*\w*)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+\w+)\s+new\s+m-pesa\s+balance\s+is\s+ksh([\d,\.]+)/i,
    /ksh([\d,\.]+)\s+sent\s+to\s+(\d{10})\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+\w+)\s+transaction\s+cost\s+ksh([\d,\.]+)\s+new\s+m-pesa\s+balance\s+is\s+ksh([\d,\.]+)/i,
    /(\w+)\s+confirmed\.\s+ksh([\d,\.]+)\s+sent\s+to\s+(\d{10})\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+\w+)/i
  ];

  private static readonly RECEIVED_PATTERNS = [
    /(\w+)\s+confirmed\.\s+you\s+have\s+received\s+ksh([\d,\.]+)\s+from\s+(.+?)\s+(\d{10})\s+on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+\w+)/i,
    /ksh([\d,\.]+)\s+received\s+from\s+(\d{10})\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+\w+)\s+new\s+m-pesa\s+balance\s+is\s+ksh([\d,\.]+)/i
  ];

  public static parseSms(smsText: string): ParsedSmsTransaction {
    const cleanedText = smsText.trim().toLowerCase();
    
    // Try to parse as sent transaction
    for (const pattern of this.SENT_PATTERNS) {
      const match = cleanedText.match(pattern);
      if (match) {
        return this.parseSentTransaction(match, smsText);
      }
    }

    // Try to parse as received transaction
    for (const pattern of this.RECEIVED_PATTERNS) {
      const match = cleanedText.match(pattern);
      if (match) {
        return this.parseReceivedTransaction(match, smsText);
      }
    }

    // Fallback: Try to extract basic amount info
    return this.parseBasicTransaction(cleanedText);
  }

  private static parseSentTransaction(match: RegExpMatchArray, originalText: string): ParsedSmsTransaction {
    const transactionCode = this.extractTransactionCode(originalText);
    const amount = this.parseAmount(match[2] || match[1]);
    const recipientPhone = this.extractPhone(match);
    const recipientName = this.extractRecipientName(match);
    const balance = this.extractBalance(match);

    const suggestedPurpose = this.suggestPurpose(recipientName || '', originalText, amount);
    const suggestedCategory = this.suggestCategory(recipientName || '', suggestedPurpose, amount);

    return {
      amount,
      recipientPhone,
      recipientName,
      transactionCode,
      balance,
      isValid: amount > 0 && !!transactionCode,
      transactionType: 'SENT',
      suggestedPurpose,
      suggestedCategory
    };
  }

  private static parseReceivedTransaction(match: RegExpMatchArray, originalText: string): ParsedSmsTransaction {
    const transactionCode = this.extractTransactionCode(originalText);
    const amount = this.parseAmount(match[2] || match[1]);
    const recipientPhone = this.extractPhone(match);
    const recipientName = this.extractSenderName(match);
    const balance = this.extractBalance(match);

    const suggestedPurpose = this.suggestPurpose(recipientName || '', originalText, amount);
    const suggestedCategory = this.suggestCategory(recipientName || '', suggestedPurpose, amount);

    return {
      amount,
      recipientPhone,
      recipientName,
      transactionCode,
      balance,
      isValid: amount > 0 && !!transactionCode,
      transactionType: 'RECEIVED',
      suggestedPurpose,
      suggestedCategory
    };
  }

  private static parseBasicTransaction(smsText: string): ParsedSmsTransaction {
    // Extract amount using various patterns
    const amountPatterns = [
      /ksh\s*([\d,\.]+)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/
    ];

    let amount = 0;
    for (const pattern of amountPatterns) {
      const match = smsText.match(pattern);
      if (match) {
        amount = this.parseAmount(match[1]);
        break;
      }
    }

    const transactionCode = this.extractTransactionCode(smsText);
    const phone = this.extractPhoneNumber(smsText);

    return {
      amount,
      recipientPhone: phone,
      transactionCode: transactionCode || 'UNKNOWN',
      isValid: amount > 0,
      transactionType: 'UNKNOWN'
    };
  }

  private static parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    // Remove commas and convert to number
    return parseFloat(amountStr.replace(/,/g, '')) || 0;
  }

  private static extractTransactionCode(text: string): string {
    // M-Pesa transaction codes are typically 10 characters alphanumeric
    const codePattern = /(?:transaction|code|ref(?:erence)?)\s*[:.]?\s*([A-Z0-9]{8,12})/i;
    const match = text.match(codePattern);
    if (match) return match[1];

    // Fallback: Look for any 8-12 character alphanumeric code
    const fallbackPattern = /\b([A-Z0-9]{8,12})\b/i;
    const fallbackMatch = text.match(fallbackPattern);
    return fallbackMatch ? fallbackMatch[1] : '';
  }

  private static extractPhone(match: RegExpMatchArray): string | undefined {
    // Look for phone numbers in various positions
    for (let i = 0; i < match.length; i++) {
      const part = match[i];
      if (part && /^\d{10}$/.test(part)) {
        return part;
      }
    }
    return undefined;
  }

  private static extractPhoneNumber(text: string): string | undefined {
    const phonePattern = /\b(\d{10})\b/;
    const match = text.match(phonePattern);
    return match ? match[1] : undefined;
  }

  private static extractRecipientName(match: RegExpMatchArray): string | undefined {
    // Look for recipient name patterns
    for (let i = 0; i < match.length; i++) {
      const part = match[i];
      if (part && !/^\d+$/.test(part) && !/ksh/i.test(part) && !/^\d+\/\d+\/\d+$/.test(part)) {
        return part.trim();
      }
    }
    return undefined;
  }

  private static extractSenderName(match: RegExpMatchArray): string | undefined {
    return this.extractRecipientName(match);
  }

  private static extractBalance(match: RegExpMatchArray): number | undefined {
    // Look for balance in the last numeric match that could be a balance
    const balancePattern = /balance\s+is\s+ksh\s*([\d,\.]+)/i;
    const fullText = match.input || '';
    const balanceMatch = fullText.match(balancePattern);
    if (balanceMatch) {
      return this.parseAmount(balanceMatch[1]);
    }
    return undefined;
  }

  // Detect SIM card from sender number or SMS content
  public static detectSimCard(senderNumber: string, smsText: string): 'SIM1' | 'SIM2' {
    // This would be enhanced based on actual device SMS metadata
    // For now, we'll use a simple heuristic or default to SIM1
    // In a real implementation, this would come from Android SMS metadata
    return 'SIM1'; // Default - would be determined by actual SMS metadata
  }

  // Determine if transaction is likely business or personal based on patterns
  public static classifyAccountType(recipientName?: string, amount?: number): 'business' | 'personal' {
    if (!recipientName && !amount) return 'business'; // Default to business
    
    // Business indicators
    const businessKeywords = [
      'supplier', 'vendor', 'wholesale', 'ltd', 'limited', 'company', 'shop', 
      'store', 'market', 'traders', 'distributors', 'services'
    ];
    
    const recipientLower = recipientName?.toLowerCase() || '';
    const hasBusinessKeyword = businessKeywords.some(keyword => recipientLower.includes(keyword));
    
    // Large amounts often indicate business transactions
    const isLargeAmount = amount && amount > 5000;
    
    return hasBusinessKeyword || isLargeAmount ? 'business' : 'personal';
  }

  // Suggest purpose/item based on recipient name and transaction context
  private static suggestPurpose(recipientName: string, smsText: string, amount: number): string {
    const recipient = recipientName.toLowerCase();
    const text = smsText.toLowerCase();
    
    // Hotel-specific suppliers and common purposes
    const supplierPatterns = [
      // Food & Beverage suppliers
      { keywords: ['fresh', 'vegetables', 'market', 'groceries', 'fruits'], purpose: 'Fresh vegetables and fruits' },
      { keywords: ['meat', 'butchery', 'chicken', 'fish'], purpose: 'Meat and poultry supplies' },
      { keywords: ['dairy', 'milk', 'cheese'], purpose: 'Dairy products' },
      { keywords: ['bakery', 'bread', 'flour'], purpose: 'Bakery items and supplies' },
      { keywords: ['spices', 'seasoning'], purpose: 'Spices and seasonings' },
      
      // Utilities and services
      { keywords: ['kenya power', 'kplc', 'power', 'electricity'], purpose: 'Electricity bill payment' },
      { keywords: ['nairobi water', 'water', 'sewerage'], purpose: 'Water and sewerage bill' },
      { keywords: ['safaricom', 'airtel', 'telkom'], purpose: 'Internet and communication services' },
      
      // Maintenance and supplies  
      { keywords: ['hardware', 'paint', 'cement', 'iron'], purpose: 'Maintenance and repair supplies' },
      { keywords: ['cleaning', 'detergent', 'soap'], purpose: 'Cleaning supplies' },
      { keywords: ['linen', 'towel', 'bedding'], purpose: 'Bed linen and towels' },
      
      // Staff and services
      { keywords: ['salary', 'wage', 'staff', 'employee'], purpose: 'Staff wages and salaries' },
      { keywords: ['transport', 'fuel', 'petrol'], purpose: 'Transportation and fuel' },
      
      // Equipment and furniture
      { keywords: ['furniture', 'table', 'chair', 'bed'], purpose: 'Furniture and equipment' },
      { keywords: ['electronics', 'tv', 'fridge'], purpose: 'Electronic equipment' },
    ];
    
    // Check recipient name and SMS text for patterns
    for (const pattern of supplierPatterns) {
      if (pattern.keywords.some(keyword => recipient.includes(keyword) || text.includes(keyword))) {
        return pattern.purpose;
      }
    }
    
    // Amount-based suggestions
    if (amount > 50000) return 'Major equipment or monthly expenses';
    if (amount > 20000) return 'Weekly supplies or services';
    if (amount > 5000) return 'Daily supplies or utilities';
    if (amount < 1000) return 'Small supplies or miscellaneous';
    
    return 'General hotel supplies';
  }

  // Suggest category based on purpose and recipient
  private static suggestCategory(recipientName: string, purpose: string, amount: number): string {
    const recipient = recipientName.toLowerCase();
    const purposeLower = purpose.toLowerCase();
    
    // Category mapping based on keywords
    const categoryMappings = [
      { keywords: ['vegetables', 'fruits', 'meat', 'dairy', 'food', 'kitchen'], category: 'Food & Beverages' },
      { keywords: ['supplies', 'ingredients', 'spices', 'bakery'], category: 'Kitchen Supplies' },
      { keywords: ['cleaning', 'detergent', 'housekeeping'], category: 'Housekeeping' },
      { keywords: ['linen', 'towel', 'bedding'], category: 'Linens & Towels' },
      { keywords: ['maintenance', 'repair', 'paint', 'hardware'], category: 'Maintenance & Repairs' },
      { keywords: ['electricity', 'power', 'water', 'internet', 'bill'], category: 'Utilities & Bills' },
      { keywords: ['salary', 'wage', 'staff', 'employee'], category: 'Staff Wages' },
      { keywords: ['amenities', 'guest', 'toiletries'], category: 'Guest Amenities' },
      { keywords: ['furniture', 'equipment', 'electronics'], category: 'Equipment & Furniture' },
      { keywords: ['transport', 'fuel', 'petrol'], category: 'Transportation' },
      { keywords: ['marketing', 'event', 'promotion'], category: 'Marketing & Events' },
      { keywords: ['security', 'safety', 'guard'], category: 'Security & Safety' },
    ];
    
    // Check purpose and recipient name for category indicators
    for (const mapping of categoryMappings) {
      if (mapping.keywords.some(keyword => 
        purposeLower.includes(keyword) || recipient.includes(keyword)
      )) {
        return mapping.category;
      }
    }
    
    // Default to Food & Beverages for hotel business
    return 'Food & Beverages';
  }
}