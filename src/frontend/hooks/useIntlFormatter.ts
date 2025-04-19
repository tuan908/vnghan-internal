// hooks/useIntlFormatter.ts
import { useMemo } from "react";

type FormatterOptions = {
  locale?: string;
};

export function useIntlFormatter({ locale }: FormatterOptions = {}) {
  const resolvedLocale = useMemo(() => locale || getDefaultLocale(), [locale]);

  function formatByTemplate(
    value: string,
    template: string = "#,###,###",
  ): string {
    let result = "";
    let index = 0;

    for (const char of template) {
      if (char === "#") {
        if (index < value.length) {
          result += value[index++];
        }
      } else {
        result += char;
      }
    }

    return result;
  }

  function formatCurrency(amount: string, decimals = 2) {
    const amountInNumber = Number(amount);

    if (typeof amountInNumber !== "number" || isNaN(amountInNumber)) {
      return "";
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInNumber);
  }

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(resolvedLocale).format(value);

  const formatPercent = (value: number) =>
    new Intl.NumberFormat(resolvedLocale, {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(value);

  return {
    locale: resolvedLocale,
    formatByTemplate,
    formatCurrency,
    formatNumber,
    formatPercent,
  };
}

function getDefaultLocale() {
  if (typeof window !== "undefined") {
    return navigator.language || "en-US";
  }
  return "en-US"; // fallback for SSR
}
