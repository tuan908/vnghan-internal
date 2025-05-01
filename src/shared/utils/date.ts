import dayjs from "dayjs";

export const isToday = async (date: Date | string | number) => {
	return dayjs(date).isSame(dayjs(new Date()));
};

export const getCurrentDate = () => new Date();
