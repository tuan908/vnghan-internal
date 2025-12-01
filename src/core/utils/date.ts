import dayjs from "dayjs";

export const isToday = async (date: Date | string | number) => {
	return dayjs(date).isSame(dayjs(new Date()));
};

export const getCurrentDate = () => new Date();

export function isValidDate(dateString: string): boolean {
	// Optional: Add type check if needed
	if (typeof dateString !== "string") {
		return false;
	}

	return dayjs(dateString).isValid();
}
