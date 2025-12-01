"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/core/components/ui/button";
import { Calendar } from "@/core/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/core/components/ui/popover";
import { DATE_FORMAT_DD_MM_YYYY_WITH_SLASH } from "@/core/constants";
import { cn } from "@/core/utils";
import dayjs from "dayjs";

interface DayPickerProps {
	date: Date;
	onChange: (date?: Date) => void;
}

export function DatePicker({ date, onChange }: DayPickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"justify-start text-left font-normal border-none outline-none leading-none p-0",
						!date && "text-muted-foreground",
					)}
				>
					<CalendarIcon />
					{date ? (
						dayjs(date).format(DATE_FORMAT_DD_MM_YYYY_WITH_SLASH)
					) : (
						<span>Chọn ngày</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					className="rounded-md border shadow"
					mode="single"
					selected={date}
					onSelect={onChange}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
