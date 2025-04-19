import { isSameDay } from "date-fns";

export const isToday = (date: Date | string | number): boolean => {
  return isSameDay(new Date(date), new Date());
};

export const getCurrentDate = () => new Date();
