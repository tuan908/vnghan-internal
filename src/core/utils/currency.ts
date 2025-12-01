import currency from "currency.js";

// ============================================
// Types
// ============================================

type CurrencyCode = "VND" | "USD" | "EUR" | "JPY" | "GBP" | "CNY";

type CurrencyConfig = {
	symbol: string;
	precision: number;
	locale: string;
	thousandSeparator: string;
	decimalSeparator: string;
};

type FormatOptions = {
	locale?: string;
	forceDecimals?: boolean; // Force decimal display even for VND
};

// ============================================
// Currency Configuration
// ============================================

const currencyConfig: Record<CurrencyCode, CurrencyConfig> = {
	VND: {
		symbol: "₫",
		precision: 2, // Changed to 2 to support decimals like 1.000,53
		locale: "vi-VN",
		thousandSeparator: ".",
		decimalSeparator: ",",
	},
	USD: {
		symbol: "$",
		precision: 2,
		locale: "en-US",
		thousandSeparator: ",",
		decimalSeparator: ".",
	},
	EUR: {
		symbol: "€",
		precision: 2,
		locale: "de-DE",
		thousandSeparator: ".",
		decimalSeparator: ",",
	},
	JPY: {
		symbol: "¥",
		precision: 0,
		locale: "ja-JP",
		thousandSeparator: ",",
		decimalSeparator: ".",
	},
	GBP: {
		symbol: "£",
		precision: 2,
		locale: "en-GB",
		thousandSeparator: ",",
		decimalSeparator: ".",
	},
	CNY: {
		symbol: "¥",
		precision: 2,
		locale: "zh-CN",
		thousandSeparator: ",",
		decimalSeparator: ".",
	},
};

// ============================================
// Add/Update Currency
// ============================================

export function registerCurrency(code: string, config: CurrencyConfig): void {
	(currencyConfig as Record<string, CurrencyConfig>)[code] = config;
	formatterCache.clear(); // Clear cache when config changes
}

export function updateCurrency(
	code: CurrencyCode,
	updates: Partial<CurrencyConfig>,
): void {
	if (!currencyConfig[code]) {
		throw new Error(`Currency ${code} not found`);
	}
	currencyConfig[code] = { ...currencyConfig[code], ...updates };
	formatterCache.clear();
}

// ============================================
// Formatter Cache
// ============================================

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(
	locale: string,
	currencyCode: CurrencyCode,
	precision: number,
): Intl.NumberFormat {
	const key = `${locale}-${currencyCode}-${precision}`;

	if (!formatterCache.has(key)) {
		formatterCache.set(
			key,
			new Intl.NumberFormat(locale, {
				style: "decimal",
				minimumFractionDigits: precision,
				maximumFractionDigits: precision,
			}),
		);
	}

	return formatterCache.get(key)!;
}

// ============================================
// Money Factory
// ============================================

export function money(amount: number | string, currencyCode: CurrencyCode) {
	const config = currencyConfig[currencyCode];

	return currency(amount, {
		symbol: config.symbol,
		precision: config.precision,
		separator: config.thousandSeparator,
		decimal: config.decimalSeparator,
		errorOnInvalid: true,
	});
}

// ============================================
// Format Currency
// ============================================

export function formatCurrency(
	amount: number | string,
	currencyCode: CurrencyCode = "VND",
	options: FormatOptions = {},
): string {
	const config = currencyConfig[currencyCode];
	const locale = options.locale ?? config.locale;

	const moneyValue = money(amount, currencyCode);

	// Determine precision
	let precision = config.precision;

	// For VND: show decimals only if they exist and forceDecimals is true
	if (currencyCode === "VND" && !options.forceDecimals) {
		const hasDecimals = moneyValue.value % 1 !== 0;
		precision = hasDecimals ? 2 : 0;
	}

	return getFormatter(locale, currencyCode, precision).format(moneyValue.value);
}

// ============================================
// Parse Currency (handles various input formats)
// ============================================

export function parseCurrency(
	input: string,
	currencyCode: CurrencyCode,
): number {
	const config = currencyConfig[currencyCode];

	// Remove currency symbols and whitespace
	let cleaned = input.replace(/[₫$€¥£\s]/g, "").trim();

	// Detect format: European (1.000,53) vs US (1,000.53)
	const europeanFormat = /^\d{1,3}(\.\d{3})*(,\d+)?$/;
	const usFormat = /^\d{1,3}(,\d{3})*(\.\d+)?$/;
	const plainNumber = /^\d+([.,]\d+)?$/;

	if (europeanFormat.test(cleaned)) {
		// European: 1.000,53 -> 1000.53
		cleaned = cleaned.replace(/\./g, "").replace(",", ".");
	} else if (usFormat.test(cleaned)) {
		// US: 1,000.53 -> 1000.53
		cleaned = cleaned.replace(/,/g, "");
	} else if (plainNumber.test(cleaned)) {
		// Handle ambiguous cases based on currency config
		if (config.decimalSeparator === ",") {
			cleaned = cleaned.replace(",", ".");
		}
	}

	const parsed = parseFloat(cleaned);

	if (isNaN(parsed)) {
		throw new Error(`Invalid currency input: ${input}`);
	}

	return currency(parsed, { precision: config.precision }).value;
}

// ============================================
// Utility: Convert Between Currencies
// ============================================

type ExchangeRates = Partial<Record<CurrencyCode, number>>;

export function convertCurrency(
	amount: number,
	from: CurrencyCode,
	to: CurrencyCode,
	rates: ExchangeRates,
): number {
	const fromRate = rates[from];
	const toRate = rates[to];

	if (!fromRate || !toRate) {
		throw new Error(`Exchange rate not found for ${from} or ${to}`);
	}

	// Convert to base (USD typically), then to target
	const baseAmount = amount / fromRate;
	const converted = baseAmount * toRate;

	return money(converted, to).value;
}
