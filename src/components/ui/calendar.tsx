import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold text-foreground tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-muted-foreground/60 rounded-md w-9 font-bold text-[0.7rem] uppercase tracking-widest",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative transition-all [&:has([aria-selected].day-range-end)]:rounded-r-xl [&:has([aria-selected].day-outside)]:bg-accent/30 [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-semibold aria-selected:opacity-100 rounded-xl transition-all hover:bg-primary/10 hover:text-primary"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-white hover:bg-primary shadow-soft hover:shadow-soft-lg focus:bg-primary focus:text-white rounded-xl",
        day_today: "bg-secondary text-primary font-black border border-primary/20",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-primary/5 aria-selected:text-muted-foreground/60 aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/20 opacity-30",
        day_range_middle: "aria-selected:bg-primary/5 aria-selected:text-primary font-bold",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
