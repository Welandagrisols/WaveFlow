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

    return {
      amount,
      recipientPhone,
      recipientName,
      transactionCode,
      balance,
      isValid: amount > 0 && !!transactionCode,
      transactionType: 'SENT'
    };
  }

  private static parseReceivedTransaction(match: RegExpMatchArray, originalText: string): ParsedSmsTransaction {
    const transactionCode = this.extractTransactionCode(originalText);
    const amount = this.parseAmount(match[2] || match[1]);
    const recipientPhone = this.extractPhone(match);
    const recipientName = this.extractSenderName(match);
    const balance = this.extractBalance(match);

    return {
      amount,
      recipientPhone,
      recipientName,
      transactionCode,
      balance,
      isValid: amount > 0 && !!transactionCode,
      transactionType: 'RECEIVED'
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
}