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

  // Enhanced SIM detection patterns for Kenyan carriers
  private static readonly SIM_DETECTION_PATTERNS = {
    SAFARICOM_BUSINESS: [
      /from.*MPESA/i,
      /from.*M-PESA/i,
      /safaricom.*business/i,
      /254722|254733|254734|254735|254736|254737|254738|254739/
    ],
    SAFARICOM_PERSONAL: [
      /from.*254700|254701|254702|254703|254704|254705|254706|254707|254708|254709/,
      /personal.*safaricom/i
    ],
    AIRTEL: [
      /airtel/i,
      /airtel money/i,
      /254730|254731|254732|254733|254734|254735|254736|254737|254738|254739/
    ],
    TELKOM: [
      /telkom/i,
      /t-kash/i,
      /tkash/i,
      /254777/
    ]
  };

  // Enhanced SIM card detection with carrier and account type identification
  public static detectSimCard(senderNumber: string, smsText: string): 'SIM1' | 'SIM2' {
    // Check for business patterns (typically SIM1 for business)
    const hasBusinessPattern = this.SIM_DETECTION_PATTERNS.SAFARICOM_BUSINESS.some(pattern => 
      pattern.test(senderNumber) || pattern.test(smsText)
    );
    
    // Check for personal patterns (typically SIM2 for personal)
    const hasPersonalPattern = this.SIM_DETECTION_PATTERNS.SAFARICOM_PERSONAL.some(pattern => 
      pattern.test(senderNumber) || pattern.test(smsText)
    );
    
    // Advanced heuristics based on time and transaction amount
    const now = new Date();
    const isBusinessHours = now.getHours() >= 8 && now.getHours() <= 18;
    
    // Extract amount for business/personal classification
    const amountMatch = smsText.match(/ksh\s*([\d,\.]+)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    const isLargeAmount = amount > 5000;
    
    // Decision logic
    if (hasBusinessPattern || (isBusinessHours && isLargeAmount)) {
      return 'SIM1'; // Business SIM
    } else if (hasPersonalPattern || (!isBusinessHours && amount < 2000)) {
      return 'SIM2'; // Personal SIM
    }
    
    // Default to SIM1 for M-Pesa transactions during business hours
    return isBusinessHours ? 'SIM1' : 'SIM2';
  }

  // Get carrier information from SIM detection
  public static getCarrierInfo(senderNumber: string, smsText: string): {
    carrier: 'SAFARICOM' | 'AIRTEL' | 'TELKOM' | 'UNKNOWN';
    accountType: 'BUSINESS' | 'PERSONAL';
    confidence: number;
  } {
    let carrier: 'SAFARICOM' | 'AIRTEL' | 'TELKOM' | 'UNKNOWN' = 'UNKNOWN';
    let accountType: 'BUSINESS' | 'PERSONAL' = 'BUSINESS';
    let confidence = 0.5;

    // Detect carrier
    if (this.SIM_DETECTION_PATTERNS.SAFARICOM_BUSINESS.some(p => p.test(senderNumber) || p.test(smsText))) {
      carrier = 'SAFARICOM';
      accountType = 'BUSINESS';
      confidence = 0.9;
    } else if (this.SIM_DETECTION_PATTERNS.SAFARICOM_PERSONAL.some(p => p.test(senderNumber) || p.test(smsText))) {
      carrier = 'SAFARICOM';
      accountType = 'PERSONAL';
      confidence = 0.8;
    } else if (this.SIM_DETECTION_PATTERNS.AIRTEL.some(p => p.test(senderNumber) || p.test(smsText))) {
      carrier = 'AIRTEL';
      confidence = 0.7;
    } else if (this.SIM_DETECTION_PATTERNS.TELKOM.some(p => p.test(senderNumber) || p.test(smsText))) {
      carrier = 'TELKOM';
      confidence = 0.7;
    }

    return { carrier, accountType, confidence };
  }

  // Enhanced business/personal classification with multiple factors
  public static classifyAccountType(recipientName?: string, amount?: number): 'business' | 'personal' {
    if (!recipientName && !amount) return 'business'; // Default to business
    
    // Business indicators - expanded list
    const businessKeywords = [
      // Formal business
      'supplier', 'vendor', 'wholesale', 'ltd', 'limited', 'company', 'corp', 'corporation',
      'shop', 'store', 'market', 'traders', 'distributors', 'services', 'enterprise',
      
      // Hotel-specific suppliers
      'catering', 'supplies', 'laundry', 'maintenance', 'security', 'transport',
      'hospitality', 'equipment', 'furniture', 'fixtures', 'uniforms',
      
      // Utilities and services
      'kenya power', 'kplc', 'nairobi water', 'safaricom', 'airtel', 'telkom',
      'internet', 'communication', 'insurance', 'legal', 'accounting',
      
      // Construction and maintenance
      'hardware', 'construction', 'plumbing', 'electrical', 'painting', 'roofing'
    ];
    
    // Personal indicators - expanded list
    const personalKeywords = [
      'personal', 'family', 'friend', 'loan', 'borrow', 'gift', 'pocket', 'allowance',
      'school', 'medical', 'health', 'entertainment', 'shopping', 'groceries', 'food',
      'rent', 'house', 'home', 'children', 'kids', 'spouse', 'parent', 'relative',
      'birthday', 'wedding', 'celebration', 'emergency', 'doctor', 'hospital'
    ];
    
    const recipientLower = recipientName?.toLowerCase() || '';
    const hasBusinessKeyword = businessKeywords.some(keyword => recipientLower.includes(keyword));
    const hasPersonalKeyword = personalKeywords.some(keyword => recipientLower.includes(keyword));
    
    // Amount-based classification (refined thresholds)
    const isLargeAmount = amount && amount > 10000; // Raised threshold for business
    const isSmallPersonalAmount = amount && amount < 2000; // Small amounts likely personal
    
    // Time-based heuristics
    const now = new Date();
    const isBusinessHours = now.getHours() >= 8 && now.getHours() <= 18;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    // Decision logic with weighted factors
    let businessScore = 0;
    let personalScore = 0;
    
    if (hasBusinessKeyword) businessScore += 3;
    if (hasPersonalKeyword) personalScore += 3;
    if (isLargeAmount) businessScore += 2;
    if (isSmallPersonalAmount) personalScore += 1;
    if (isBusinessHours && !isWeekend) businessScore += 1;
    if (!isBusinessHours || isWeekend) personalScore += 1;
    
    return businessScore >= personalScore ? 'business' : 'personal';
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