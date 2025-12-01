// components/ui/autocomplete.tsx
"use client";

import { cn } from "@/core/utils/cn";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import * as React from "react";
import { Input } from "../ui/input";

// ============================================
// Types
// ============================================

export type AutocompleteOption<T = unknown> = {
	value: string;
	label: string;
	disabled?: boolean;
	data?: T;
};

type AutocompleteProps<T = unknown> = {
	options: AutocompleteOption<T>[];
	value?: AutocompleteOption<T> | null;
	inputValue?: string;
	onChange?: (option: AutocompleteOption<T> | null) => void;
	onInputChange?: (value: string, reason: "input" | "reset" | "clear") => void;
	placeholder?: string;
	disabled?: boolean;
	loading?: boolean;
	clearable?: boolean;
	freeSolo?: boolean; // Allow custom values like MUI
	autoSelect?: boolean; // Auto select on blur if there's a match
	autoHighlight?: boolean; // Highlight first option
	openOnFocus?: boolean;
	blurOnSelect?: boolean;
	filterOptions?: (
		options: AutocompleteOption<T>[],
		inputValue: string,
	) => AutocompleteOption<T>[];
	getOptionLabel?: (option: AutocompleteOption<T>) => string;
	isOptionEqualToValue?: (
		option: AutocompleteOption<T>,
		value: AutocompleteOption<T>,
	) => boolean;
	noOptionsText?: string;
	loadingText?: string;
	className?: string;
	inputClassName?: string;
	renderOption?: (
		option: AutocompleteOption<T>,
		state: { selected: boolean; highlighted: boolean },
	) => React.ReactNode;
	groupBy?: (option: AutocompleteOption<T>) => string;
	onOpen?: () => void;
	onClose?: () => void;
};

// ============================================
// Default filter function (MUI-like)
// ============================================

function defaultFilterOptions<T>(
	options: AutocompleteOption<T>[],
	inputValue: string,
): AutocompleteOption<T>[] {
	const searchValue = inputValue.toLowerCase().trim();
	if (!searchValue) return options;

	return options.filter((option) =>
		option.label.toLowerCase().includes(searchValue),
	);
}

// ============================================
// Component
// ============================================

export function Autocomplete<T = unknown>({
	options,
	value = null,
	inputValue: controlledInputValue,
	onChange,
	onInputChange,
	placeholder = "Search...",
	disabled = false,
	loading = false,
	clearable = true,
	freeSolo = false,
	autoSelect = false,
	autoHighlight = true,
	openOnFocus = true,
	blurOnSelect = true,
	filterOptions = defaultFilterOptions,
	getOptionLabel = (option) => option.label,
	isOptionEqualToValue = (option, val) => option.value === val.value,
	noOptionsText = "No options",
	loadingText = "Loading...",
	className,
	inputClassName,
	renderOption,
	groupBy,
	onOpen,
	onClose,
}: AutocompleteProps<T>) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const listboxRef = React.useRef<HTMLUListElement>(null);

	const [isOpen, setIsOpen] = React.useState(false);
	const [internalInputValue, setInternalInputValue] = React.useState("");
	const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
	const [isFocused, setIsFocused] = React.useState(false);

	// Controlled or uncontrolled input value
	const inputValue =
		controlledInputValue !== undefined
			? controlledInputValue
			: internalInputValue;

	// Sync input value with selected value when value changes externally
	React.useEffect(() => {
		if (value && !isFocused) {
			const label = getOptionLabel(value);
			if (controlledInputValue === undefined) {
				setInternalInputValue(label);
			}
		}
	}, [value, isFocused, getOptionLabel, controlledInputValue]);

	// Filter options
	const filteredOptions = React.useMemo(() => {
		return filterOptions(options, inputValue);
	}, [options, inputValue, filterOptions]);

	// Group options if groupBy is provided
	const groupedOptions = React.useMemo(() => {
		if (!groupBy) return null;

		const groups: Record<string, AutocompleteOption<T>[]> = {};
		filteredOptions.forEach((option) => {
			const group = groupBy(option);
			if (!groups[group]) {
				groups[group] = [];
			}
			groups[group].push(option);
		});
		return groups;
	}, [filteredOptions, groupBy]);

	// Flat list for keyboard navigation
	const flatOptions = filteredOptions;

	// Handle open/close
	const handleOpen = () => {
		if (disabled) return;
		setIsOpen(true);
		if (autoHighlight && flatOptions.length > 0) {
			setHighlightedIndex(0);
		}
		onOpen?.();
	};

	const handleClose = () => {
		setIsOpen(false);
		setHighlightedIndex(-1);
		onClose?.();
	};

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		if (controlledInputValue === undefined) {
			setInternalInputValue(newValue);
		}
		onInputChange?.(newValue, "input");

		if (!isOpen) {
			handleOpen();
		}

		// Reset highlighted index when input changes
		if (autoHighlight && flatOptions.length > 0) {
			setHighlightedIndex(0);
		} else {
			setHighlightedIndex(-1);
		}
	};

	// Handle option selection
	const handleSelectOption = (option: AutocompleteOption<T>) => {
		if (option.disabled) return;

		onChange?.(option);

		const label = getOptionLabel(option);
		if (controlledInputValue === undefined) {
			setInternalInputValue(label);
		}
		onInputChange?.(label, "reset");

		if (blurOnSelect) {
			inputRef.current?.blur();
		}
		handleClose();
	};

	// Handle clear
	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();

		onChange?.(null);

		if (controlledInputValue === undefined) {
			setInternalInputValue("");
		}
		onInputChange?.("", "clear");

		inputRef.current?.focus();
	};

	// Handle focus
	const handleFocus = () => {
		setIsFocused(true);
		if (openOnFocus) {
			handleOpen();
		}
		// Select all text on focus like MUI
		inputRef.current?.select();
	};

	// Handle blur
	const handleBlur = (e: React.FocusEvent) => {
		// Don't close if clicking inside the dropdown
		if (containerRef.current?.contains(e.relatedTarget as Node)) {
			return;
		}

		setIsFocused(false);

		// Auto select on blur
		if (autoSelect && highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
			handleSelectOption(flatOptions[highlightedIndex]);
		} else if (!freeSolo && value) {
			// Reset input to selected value if not freeSolo
			const label = getOptionLabel(value);
			if (controlledInputValue === undefined) {
				setInternalInputValue(label);
			}
			onInputChange?.(label, "reset");
		} else if (!freeSolo && !value) {
			// Clear input if no value selected
			if (controlledInputValue === undefined) {
				setInternalInputValue("");
			}
			onInputChange?.("", "reset");
		}

		handleClose();
	};

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
			handleOpen();
			return;
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) => {
					const next = prev + 1;
					return next >= flatOptions.length ? 0 : next;
				});
				break;

			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) => {
					const next = prev - 1;
					return next < 0 ? flatOptions.length - 1 : next;
				});
				break;

			case "Enter":
				e.preventDefault();
				if (isOpen && highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
					handleSelectOption(flatOptions[highlightedIndex]);
				} else if (freeSolo && inputValue) {
					// Create custom option in freeSolo mode
					const customOption: AutocompleteOption<T> = {
						value: inputValue,
						label: inputValue,
					};
					onChange?.(customOption);
					handleClose();
				}
				break;

			case "Escape":
				e.preventDefault();
				handleClose();
				inputRef.current?.blur();
				break;

			case "Tab":
				handleClose();
				break;
		}
	};

	// Scroll highlighted option into view
	React.useEffect(() => {
		if (highlightedIndex >= 0 && listboxRef.current) {
			const highlightedElement = listboxRef.current.querySelector(
				`[data-index="${highlightedIndex}"]`,
			);
			highlightedElement?.scrollIntoView({ block: "nearest" });
		}
	}, [highlightedIndex]);

	// Click outside to close
	React.useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				handleClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Check if current value is selected
	const isSelected = (option: AutocompleteOption<T>) => {
		if (!value) return false;
		return isOptionEqualToValue(option, value);
	};

	// Render option item
	const renderOptionItem = (
		option: AutocompleteOption<T>,
		index: number,
		globalIndex: number,
	) => {
		const selected = isSelected(option);
		const highlighted = globalIndex === highlightedIndex;

		return (
			<li
				key={option.value}
				data-index={globalIndex}
				role="option"
				aria-selected={selected}
				aria-disabled={option.disabled}
				className={cn(
					"relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none transition-colors",
					highlighted && "bg-accent text-accent-foreground",
					selected && !highlighted && "bg-accent/50",
					option.disabled && "pointer-events-none opacity-50",
				)}
				onClick={() => handleSelectOption(option)}
				onMouseEnter={() => setHighlightedIndex(globalIndex)}
			>
				{renderOption ? (
					renderOption(option, { selected, highlighted })
				) : (
					<>
						<span className="flex-1 truncate">{option.label}</span>
						{selected && <Check className="ml-2 h-4 w-4 shrink-0" />}
					</>
				)}
			</li>
		);
	};

	// Render dropdown content
	const renderDropdownContent = () => {
		if (loading) {
			return (
				<div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{loadingText}
				</div>
			);
		}

		if (flatOptions.length === 0) {
			return (
				<div className="py-6 text-center text-sm text-muted-foreground">
					{noOptionsText}
				</div>
			);
		}

		if (groupedOptions) {
			let globalIndex = 0;
			return Object.entries(groupedOptions).map(([group, groupOptions]) => (
				<div key={group}>
					<div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
						{group}
					</div>
					{groupOptions.map((option, index) => {
						const item = renderOptionItem(option, index, globalIndex);
						globalIndex++;
						return item;
					})}
				</div>
			));
		}

		return flatOptions.map((option, index) =>
			renderOptionItem(option, index, index),
		);
	};

	const showClearButton = clearable && (value || inputValue) && !disabled;

	return (
		<div ref={containerRef} className={cn("relative w-full", className)}>
			{/* Input Container */}
			<div className="relative">
				<Input
					ref={inputRef}
					type="text"
					role="combobox"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					aria-autocomplete="list"
					aria-controls="autocomplete-listbox"
					autoComplete="off"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					className={cn("pr-16", inputClassName)}
				/>

				{/* End Adornment */}
				<div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
					{/* Clear Button */}
					{showClearButton && (
						<button
							type="button"
							tabIndex={-1}
							onClick={handleClear}
							className="p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Clear"
						>
							<X className="h-4 w-4" />
						</button>
					)}

					{/* Loading Spinner */}
					{loading && (
						<div className="p-1">
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						</div>
					)}

					{/* Dropdown Arrow */}
					<button
						type="button"
						tabIndex={-1}
						onClick={() => (isOpen ? handleClose() : handleOpen())}
						disabled={disabled}
						className={cn(
							"p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
							disabled && "pointer-events-none opacity-50",
						)}
						aria-label="Toggle dropdown"
					>
						<ChevronDown
							className={cn(
								"h-4 w-4 transition-transform duration-200",
								isOpen && "rotate-180",
							)}
						/>
					</button>
				</div>
			</div>

			{/* Dropdown */}
			{isOpen && (
				<div
					className={cn(
						"absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg",
						"animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
					)}
				>
					<ul
						ref={listboxRef}
						id="autocomplete-listbox"
						role="listbox"
						className="max-h-60 overflow-auto py-1"
					>
						{renderDropdownContent()}
					</ul>
				</div>
			)}
		</div>
	);
}
