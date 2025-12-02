"use client";

import { cn } from "@/core/utils/cn";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import * as React from "react";
import { Input } from "../input";

export type AutocompleteOption<T = unknown> = {
	value: string;
	label: string;
	disabled?: boolean;
	data?: T;
};

type AutocompleteProps<T = unknown> = {
	options: AutocompleteOption<T>[];
	value?: AutocompleteOption<T> | null;
	onChange?: (option: AutocompleteOption<T> | null) => void;
	placeholder?: string;
	disabled?: boolean;
	loading?: boolean;
	clearable?: boolean;
	noOptionsText?: string;
	loadingText?: string;
	className?: string;
	groupBy?: (option: AutocompleteOption<T>) => string;
};

export function Autocomplete<T = unknown>({
	options,
	value = null,
	onChange,
	placeholder = "Search...",
	disabled = false,
	loading = false,
	clearable = true,
	noOptionsText = "No options",
	loadingText = "Loading...",
	className,
	groupBy,
}: AutocompleteProps<T>) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const listboxRef = React.useRef<HTMLUListElement>(null);

	const [isOpen, setIsOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");
	const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
	const [isFocused, setIsFocused] = React.useState(false);

	// Sync input with value (simple, one-way)
	React.useEffect(() => {
		if (!isOpen) {
			setInputValue(value?.label ?? "");
		}
	}, [value, isOpen]);

	// Filter options
	const filteredOptions = React.useMemo(() => {
		const search = inputValue.toLowerCase().trim();
		if (!search || search === value?.label.toLowerCase()) return options;
		return options.filter((opt) => opt.label.toLowerCase().includes(search));
	}, [options, inputValue]);

	// Reset highlight when options change
	React.useEffect(() => {
		if (isOpen && filteredOptions.length > 0) {
			setHighlightedIndex(0);
		} else {
			setHighlightedIndex(-1);
		}
	}, [filteredOptions, isOpen]);

	// Click outside to close
	React.useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				setIsOpen(false);
				setInputValue(value?.label ?? "");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, value]);

	// Scroll highlighted into view
	React.useEffect(() => {
		if (highlightedIndex < 0 || !listboxRef.current) return;
		const el = listboxRef.current.querySelector(
			`[data-index="${highlightedIndex}"]`,
		);
		el?.scrollIntoView({ block: "nearest" });
	}, [highlightedIndex]);

	const handleSelect = (option: AutocompleteOption<T>) => {
		if (option.disabled) return;
		onChange?.(option);
		setInputValue(option.label);
		setIsOpen(false);
		setIsFocused(false)
		inputRef.current?.blur();
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange?.(null);
		setInputValue("");
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen) {
			if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
				setIsOpen(true);
			}
			return;
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) => {
					let next = prev + 1;
					if (next >= filteredOptions.length) next = 0;
					// Skip disabled
					while (
						filteredOptions[next]?.disabled &&
						next < filteredOptions.length
					) {
						next++;
						if (next >= filteredOptions.length) next = 0;
					}
					return next;
				});
				break;

			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) => {
					let next = prev - 1;
					if (next < 0) next = filteredOptions.length - 1;
					// Skip disabled
					while (filteredOptions[next]?.disabled && next >= 0) {
						next--;
						if (next < 0) next = filteredOptions.length - 1;
					}
					return next;
				});
				break;

			case "Enter":
				e.preventDefault();
				if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
					handleSelect(filteredOptions[highlightedIndex]);
				}
				break;

			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				setInputValue(value?.label ?? "");
				inputRef.current?.blur();
				break;

			case "Tab":
				setIsOpen(false);
				setInputValue(value?.label ?? "");
				break;
		}
	};

	// Group options if needed
	const groupedOptions = React.useMemo(() => {
		if (!groupBy) return null;
		const groups: Record<string, AutocompleteOption<T>[]> = {};
		filteredOptions.forEach((option) => {
			const group = groupBy(option);
			(groups[group] ??= []).push(option);
		});
		return groups;
	}, [filteredOptions, groupBy]);

	const renderOptions = () => {
		if (loading) {
			return (
				<div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{loadingText}
				</div>
			);
		}

		if (filteredOptions.length === 0) {
			return (
				<div className="py-6 text-center text-sm text-muted-foreground">
					{noOptionsText}
				</div>
			);
		}

		const renderItem = (option: AutocompleteOption<T>, globalIndex: number) => {
			const selected = value?.value === option.value;
			const highlighted = globalIndex === highlightedIndex;

			return (
				<li
					key={option.value}
					data-index={globalIndex}
					role="option"
					aria-selected={selected}
					aria-disabled={option.disabled}
					className={cn(
						"relative flex cursor-pointer select-none items-center px-3 py-2 text-sm",
						highlighted && "bg-accent text-accent-foreground",
						selected && !highlighted && "bg-accent/50",
						option.disabled && "pointer-events-none opacity-50",
					)}
					onClick={() => handleSelect(option)}
					onMouseEnter={() => setHighlightedIndex(globalIndex)}
				>
					<span className="flex-1 truncate">{option.label}</span>
					{selected && <Check className="ml-2 h-4 w-4 shrink-0" />}
				</li>
			);
		};

		if (groupedOptions) {
			let globalIndex = 0;
			return Object.entries(groupedOptions).map(([group, opts]) => (
				<div key={group}>
					<div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
						{group}
					</div>
					{opts.map((option) => renderItem(option, globalIndex++))}
				</div>
			));
		}

		return filteredOptions.map((option, i) => renderItem(option, i));
	};

	const showClear = clearable && value && !disabled && isFocused;

	return (
		<div
			ref={containerRef}
			className={cn("relative w-full", className)}
			onFocus={() => setIsFocused(true)}
			onBlur={() => setIsFocused(false)}
			tabIndex={-1}
		>
			<div className="relative">
				<Input
					ref={inputRef}
					type="text"
					role="combobox"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					autoComplete="off"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
						if (!isOpen) setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					className="pr-16"
				/>

				<div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
					{showClear && (
						<button
							type="button"
							tabIndex={-1}
							onClick={handleClear}
							onMouseDown={(e) => e.preventDefault()}
							className="p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground"
							aria-label="Clear"
						>
							<X className="h-4 w-4" />
						</button>
					)}

					{loading && (
						<div className="p-1">
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						</div>
					)}

					<button
						type="button"
						tabIndex={-1}
						onClick={() => setIsOpen(!isOpen)}
						disabled={disabled}
						className={cn(
							"p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground",
							disabled && "pointer-events-none opacity-50",
						)}
						aria-label="Toggle dropdown"
					>
						<ChevronDown
							className={cn(
								"h-4 w-4 transition-transform",
								isOpen && "rotate-180",
							)}
						/>
					</button>
				</div>
			</div>

			{isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
					<ul
						ref={listboxRef}
						role="listbox"
						className="max-h-60 overflow-auto py-1"
					>
						{renderOptions()}
					</ul>
				</div>
			)}
		</div>
	);
}
