import React, { createContext, useContext, useMemo, useState } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { getLabelsForView } from "@/lib/utils";

export type ViewMode = "day" | "week" | "month" | "year";

interface PlannerContextType {
  viewMode: ViewMode;
  timeLabels: string[];
  dateRange: DateRange;
  currentDateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(
  undefined,
);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const viewMode = useMemo<ViewMode>(() => {
    if (!dateRange.from || !dateRange.to) return "week";
    const days =
      (dateRange.to.getTime() - dateRange.from.getTime()) /
      (1000 * 3600 * 24);
    if (days < 1) return "day";
    if (days <= 7) return "week";
    if (days <= 31) return "month";
    return "year";
  }, [dateRange]);

  const timeLabels = useMemo(() => {
    return getLabelsForView(viewMode, {
      start: dateRange.from ?? startOfDay(new Date()),
      end: dateRange.to ?? endOfDay(new Date()),
    });
  }, [viewMode, dateRange]);

  const value = useMemo<PlannerContextType>(
    () => ({
      viewMode,
      timeLabels,
      dateRange,
      currentDateRange: dateRange,
      setDateRange,
    }),
    [viewMode, timeLabels, dateRange],
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("useCalendar must be used within a PlannerProvider");
  }
  return context;
};
