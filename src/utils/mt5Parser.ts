import Tesseract from 'tesseract.js';

export interface MT5ExtractedData {
  symbol?: string;
  direction?: 'long' | 'short';
  lotSize?: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryDate?: string;
}

// Common forex pairs and instruments
const KNOWN_SYMBOLS = [
  'GBPUSD', 'EURUSD', 'USDCAD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCHF',
  'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY',
  'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD', 'US30', 'US500', 'USTEC',
  'GER40', 'UK100', 'FRA40', 'JPN225',
];

/**
 * Extract trade data from MT5 screenshot using OCR
 */
export async function extractFromMT5Screenshot(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<MT5ExtractedData> {
  try {
    // Run OCR on the image
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const text = result.data.text;
    console.log('OCR Raw Text:', text);

    return parseMT5Text(text);
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse MT5 text output and extract trade data
 * 
 * Example MT5 format:
 * "GBPUSD sell 1.1"
 * "1.35119 → 1.35131"
 * "S/L: 1.35346"
 * "T/P: 1.34535"
 * "2025.12.24 09:33:32"
 */
export function parseMT5Text(text: string): MT5ExtractedData {
  const data: MT5ExtractedData = {};
  
  // Normalize text: replace common OCR mistakes
  const normalizedText = text
    .replace(/[|l]/g, '1')  // l and | often misread as 1
    .replace(/,/g, '.')     // comma to decimal point
    .toUpperCase();

  const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = normalizedText;

  console.log('=== MT5 OCR Debug ===');
  console.log('Raw text:', text);
  console.log('Normalized:', normalizedText);
  console.log('Lines:', lines);

  // 1. Extract Symbol, Direction, and Lot Size
  // Pattern: "GBPUSD sell 1.1" or "EURUSD buy 0.5"
  for (const symbol of KNOWN_SYMBOLS) {
    const symbolPattern = new RegExp(
      `(${symbol})\\s*(SELL|BUY|S)\\s*([0-9]+\\.?[0-9]*)`,
      'i'
    );
    const match = fullText.match(symbolPattern);
    if (match) {
      data.symbol = match[1].toUpperCase();
      const directionStr = match[2].toUpperCase();
      data.direction = (directionStr === 'BUY' || directionStr === 'B') ? 'long' : 'short';
      data.lotSize = parseFloat(match[3]);
      break;
    }
  }

  // Alternative: Just find symbol if above didn't match
  if (!data.symbol) {
    for (const symbol of KNOWN_SYMBOLS) {
      if (fullText.includes(symbol)) {
        data.symbol = symbol;
        break;
      }
    }
  }

  // Find direction if not found yet
  if (!data.direction) {
    if (/\bSELL\b/i.test(fullText)) {
      data.direction = 'short';
    } else if (/\bBUY\b/i.test(fullText)) {
      data.direction = 'long';
    }
  }

  // 2. Extract Entry Price
  // Pattern: "1.35119 → 1.35131" or "1.35119 -> 1.35131" - first number is entry
  // OCR might read arrow as various characters: →, -, >, ~, etc.
  const entryPatterns = [
    /([0-9]+\.[0-9]{3,5})\s*[→\-\->~»>]+\s*[0-9]+\.[0-9]{3,5}/,  // With arrow
    /([0-9]+\.[0-9]{3,5})\s+[0-9]+\.[0-9]{3,5}/,  // Just two prices with space
    /([0-9]+\.[0-9]{5})/,  // Single 5-digit decimal (forex price like 1.35119)
  ];
  
  for (const pattern of entryPatterns) {
    const entryMatch = fullText.match(pattern);
    if (entryMatch) {
      data.entryPrice = parseFloat(entryMatch[1]);
      break;
    }
  }

  // 3. Extract Stop Loss
  // Pattern: "S/L: 1.35346" or "SL: 1.35346" or "SL 1.35346"
  const slPattern = /S\/?L[:\s]+([0-9]+\.[0-9]{3,5})/i;
  const slMatch = fullText.match(slPattern);
  if (slMatch) {
    data.stopLoss = parseFloat(slMatch[1]);
  }

  // 4. Extract Take Profit
  // Pattern: "T/P: 1.34535" or "TP: 1.34535" or "TP 1.34535"
  const tpPattern = /T\/?P[:\s]+([0-9]+\.[0-9]{3,5})/i;
  const tpMatch = fullText.match(tpPattern);
  if (tpMatch) {
    data.takeProfit = parseFloat(tpMatch[1]);
  }

  // 5. Extract Date and Time
  // Pattern: "2025.12.24 09:33:32" or "2025/12/24 09:33:32" or "2025-12-24 09:33:32"
  const datePattern = /(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})\s+(\d{1,2}):(\d{2}):?(\d{2})?/;
  const dateMatch = fullText.match(datePattern);
  if (dateMatch) {
    const [_, year, month, day, hour, minute, second = '00'] = dateMatch;
    // Format as datetime-local input value: "YYYY-MM-DDTHH:mm"
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    data.entryDate = formattedDate;
  }

  // 6. Try to extract lot size if not found yet
  if (!data.lotSize) {
    // Look for standalone decimal number that could be lot size (0.01 - 100)
    const lotPatterns = [
      /\b([0-9]+\.[0-9]{1,2})\s*(?:LOT|LOTS)?\b/i,
      /(?:SELL|BUY)\s+([0-9]+\.?[0-9]*)/i,
    ];
    for (const pattern of lotPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        // Lot sizes are typically between 0.01 and 100
        if (value >= 0.01 && value <= 100) {
          data.lotSize = value;
          break;
        }
      }
    }
  }

  console.log('Parsed data:', data);
  return data;
}

/**
 * Create a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
