import { cn } from "@/shared/utils";
import { useCallback, useEffect, useState } from "react";

type DebouncedInputProps = {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

const DebouncedInput: React.FC<DebouncedInputProps> = ({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}) => {
	const [value, setValue] = useState(initialValue);

	// Update local state when initialValue changes
	useEffect(() => {
		if (value !== initialValue) {
			setValue(initialValue);
		}
	}, [initialValue]);

	// Debounced effect
	useEffect(() => {
		const timeout = setTimeout(() => onChange(value), debounce);
		return () => clearTimeout(timeout);
	}, [value, debounce, onChange]);

	// Optimized input handler
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
		[],
	);

	return (
		<input
			{...props}
			value={value}
			onChange={handleChange}
			className={cn(
				"border rounded-md focus:outline-blue-400 px-4 py-2",
				props.className,
			)}
		/>
	);
};

export default DebouncedInput;
