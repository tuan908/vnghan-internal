"use client";

import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
	type FieldPath,
	type FieldValues,
	useController,
} from "react-hook-form";

import { Button } from "./button";
import { Calendar } from "./calendar";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./form";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TimePicker } from "./time-picker"; // ✅ import your custom TimePicker

type DateTimePickerProps<T extends FieldValues> = {
	control: T extends object ? any : never;
	name: FieldPath<T>;
	label?: string;
	disabled?: boolean;
};

export function DateTimePicker<T extends FieldValues>({
	control,
	name,
	label,
	disabled,
}: DateTimePickerProps<T>) {
	const {
		field: { value, onChange },
	} = useController({ control, name });

	const [open, setOpen] = useState(false);
	const selected = value ? new Date(value) : new Date();
	const hours = selected.getHours();
	const minutes = selected.getMinutes();

	const handleDateChange = (date: Date | undefined) => {
		if (!date) return;
		const newDate = new Date(date);
		newDate.setHours(hours);
		newDate.setMinutes(minutes);
		onChange(newDate);
	};

	const handleTimeChange = (updated: Date) => {
		const newDate = new Date(selected);
		newDate.setHours(updated.getHours());
		newDate.setMinutes(updated.getMinutes());
		onChange(newDate);
	};

	return (
		<FormField
			name={name}
			control={control}
			render={() => (
				<FormItem className="flex flex-col">
					<FormLabel>{label}</FormLabel>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant="outline"
									className="w-full justify-between"
									disabled={disabled}
								>
									{value ? (
										<span className="font-normal">
											{dayjs(value).format("DD/MM/YYYY HH:mm")}
										</span>
									) : (
										"Chọn ngày và giờ"
									)}
									<CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>

						<PopoverContent className="w-auto p-0" align="start">
							<div className="flex flex-col sm:flex-row">
								{/* 📅 Date Picker */}
								<div className="p-2">
									<Calendar
										mode="single"
										selected={value}
										onSelect={handleDateChange}
										initialFocus
									/>

									{/* ⏰ Time Picker */}
									<div className="m-auto">
										<TimePicker value={selected} onChange={handleTimeChange} />
									</div>
									<div className="pt-4 pb-2">
										<Button className="w-full" onClick={() => setOpen(false)}>
											Xác nhận
										</Button>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
