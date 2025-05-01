"use client";

import { cn } from "@/shared/utils";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

interface TimePickerDropdownProps {
	value?: Date;
	onChange: (date: Date) => void;
	className?: string;
}

export function TimePicker({
	value,
	onChange,
	className,
}: TimePickerDropdownProps) {
	const [hour, setHour] = useState("00");
	const [minute, setMinute] = useState("00");

	useEffect(() => {
		if (value) {
			setHour(String(value.getHours()).padStart(2, "0"));
			setMinute(String(value.getMinutes()).padStart(2, "0"));
		}
	}, [value]);

	const updateDate = (newHour: string, newMinute: string) => {
		const date = value ? new Date(value) : new Date();
		date.setHours(Number(newHour));
		date.setMinutes(Number(newMinute));
		date.setSeconds(0);
		onChange(date);
	};

	const hourOptions = Array.from({ length: 24 }, (_, i) =>
		String(i).padStart(2, "0"),
	);
	const minuteOptions = Array.from({ length: 60 }, (_, i) =>
		String(i).padStart(2, "0"),
	);

	return (
		<div
			className={cn(
				"flex gap-x-4 w-full items-center justify-center",
				className,
			)}
		>
			<div className="flex gap-x-2 items-center">
				<p className="text-xs mb-1 text-muted-foreground">Giờ</p>
				<Select
					value={hour}
					onValueChange={(val) => {
						setHour(val);
						updateDate(val, minute);
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Giờ" />
					</SelectTrigger>
					<SelectContent>
						{hourOptions.map((h) => (
							<SelectItem key={h} value={h}>
								{h}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-x-2 items-center">
				<p className="text-xs mb-1 text-muted-foreground">Phút</p>
				<Select
					value={minute}
					onValueChange={(val) => {
						setMinute(val);
						updateDate(hour, val);
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Phút" />
					</SelectTrigger>
					<SelectContent>
						{minuteOptions.map((m) => (
							<SelectItem key={m} value={m}>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
