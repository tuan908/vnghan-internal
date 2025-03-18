"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  control?: any;
  onValueChange?: (value: string) => void;
  initialValue?: string;
  className?: string;
  allowDecimals?: boolean;
  decimalPrecision?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      name,
      control,
      onValueChange,
      initialValue = "",
      className,
      allowDecimals = true,
      decimalPrecision = 2,
      ...props
    },
    ref
  ) => {
    // Remove unwanted characters, allow at most one decimal point,
    // remove leading zeros, and limit decimals to the specified precision.
    const cleanValue = (value: string) => {
      if (allowDecimals) {
        // Allow only digits and dots
        const cleaned = value.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");
        // Process integer part: remove leading zeros (except if the result is empty, then use "0")
        let integerPart = parts[0] ? parts[0].replace(/^0+(?!$)/, "") : "0";
        // Process decimal part: if available, limit to decimalPrecision digits
        let decimalPart = parts[1] ? parts[1].slice(0, decimalPrecision) : "";
        return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
      } else {
        let cleaned = value.replace(/[^\d]/g, "");
        cleaned = cleaned.replace(/^0+(?!$)/, "");
        return cleaned || "0";
      }
    };

    if (control) {
      return (
        <Controller
          name={name}
          control={control}
          defaultValue={initialValue}
          render={({ field: { onChange, value, ref: fieldRef } }) => {
            const rawValue = value ? cleanValue(value) : "";
            return (
              <Input
                ref={fieldRef}
                type="text"
                inputMode="decimal"
                value={rawValue}
                onChange={(e) => {
                  const newValue = cleanValue(e.target.value);
                  onChange(newValue);
                  onValueChange?.(newValue);
                }}
                onFocus={(e) => {
                  // Show raw unformatted value on focus for easier editing
                  e.target.value = rawValue;
                  e.target.select();
                }}
                onBlur={(e) => {
                  // Clean the value on blur to ensure it meets the constraints
                  e.target.value = cleanValue(e.target.value);
                }}
                className={cn(className)}
                {...props}
              />
            );
          }}
        />
      );
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        defaultValue={cleanValue(initialValue)}
        onChange={(e) => {
          const newValue = cleanValue(e.target.value);
          onValueChange?.(newValue);
        }}
        onFocus={(e) => {
          e.target.value = cleanValue(initialValue);
          e.target.select();
        }}
        onBlur={(e) => {
          e.target.value = cleanValue(e.target.value);
        }}
        className={cn(className)}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };

