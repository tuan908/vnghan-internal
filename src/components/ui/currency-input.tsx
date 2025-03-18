"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";

interface VndCurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  control?: any;
  onValueChange?: (value: string) => void;
  initialValue?: string;
  className?: string;
  allowDecimals?: boolean;
}

const VndCurrencyInput = forwardRef<HTMLInputElement, VndCurrencyInputProps>(
  ({ name, control, onValueChange, initialValue = "", className, allowDecimals = true, ...props }, ref) => {
    const formatValue = (value: string) => {
      if (!value) return "";
      const cleanedValue = allowDecimals
        ? value.replace(/[^0-9.]/g, "") // Allow numbers and a decimal
        : value.replace(/[^\d]/g, ""); // Only allow numbers

      // Ensure there's at most one decimal point
      const parts = cleanedValue.split(".");
      const formatted =
        parts.length > 2
          ? parts[0] + "." + parts.slice(1).join("") // Remove extra decimals
          : cleanedValue;

      // Convert to a number and format
      const numberValue = parseFloat(formatted);
      if (isNaN(numberValue)) return "";

      return new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: allowDecimals ? 2 : 0,
        maximumFractionDigits: allowDecimals ? 2 : 0,
      }).format(numberValue);
    };

    return control ? (
      <Controller
        name={name}
        control={control}
        defaultValue={initialValue}
        render={({ field: { onChange, value, ref } }) => {
          const rawValue = value?.replace(/[^0-9.]/g, "") || "";

          return (
            <div className="relative flex items-center">
              <Input
                ref={ref}
                type="text"
                inputMode="decimal"
                value={formatValue(rawValue)}
                onChange={(e) => {
                  const newValue = e.target.value.replace(/[^0-9.]/g, "");
                  onChange(newValue);
                  onValueChange?.(newValue);
                }}
                onFocus={(e) => {
                  e.target.value = rawValue;
                  e.target.select();
                }}
                onBlur={(e) => {
                  e.target.value = formatValue(rawValue);
                }}
                className={cn("pr-16", className)}
                {...props}
              />
              <div className="absolute right-3 text-gray-500 pointer-events-none">VND</div>
            </div>
          );
        }}
      />
    ) : (
      <div className="relative flex items-center">
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          defaultValue={formatValue(initialValue)}
          onChange={(e) => {
            const newValue = e.target.value.replace(/[^0-9.]/g, "");
            onValueChange?.(newValue);
          }}
          onFocus={(e) => {
            e.target.value = initialValue.replace(/[^0-9.]/g, "");
            e.target.select();
          }}
          onBlur={(e) => {
            e.target.value = formatValue(initialValue);
          }}
          className={cn("pr-16", className)}
          {...props}
        />
        <div className="absolute right-3 text-gray-500 pointer-events-none">VND</div>
      </div>
    );
  }
);

VndCurrencyInput.displayName = "VndCurrencyInput";

export { VndCurrencyInput };
