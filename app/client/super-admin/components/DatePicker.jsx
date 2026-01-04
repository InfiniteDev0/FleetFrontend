"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Calendar24({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const initialDate = value
    ? typeof value === "string"
      ? new Date(value)
      : value instanceof Date
      ? value
      : null
    : null;
  const [date, setDate] = React.useState(initialDate || null);
  const [time, setTime] = React.useState(() => {
    if (initialDate) return initialDate.toTimeString().split(" ")[0];
    return "10:30:00";
  });

  React.useEffect(() => {
    if (value) {
      const v = typeof value === "string" ? new Date(value) : value;
      setDate(v);
      setTime(v.toTimeString().split(" ")[0]);
    }
  }, [value]);

  const combineAndEmit = (d, t) => {
    if (!d) return;
    const parts = (t || time || "00:00:00").split(":");
    const combined = new Date(d);
    combined.setHours(
      Number(parts[0] || 0),
      Number(parts[1] || 0),
      Number(parts[2] || 0),
      0
    );
    if (onChange) onChange(combined);
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(d) => {
                setDate(d);
                combineAndEmit(d, time);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => {
            const newTime = e.target.value;
            setTime(newTime);
            if (date) combineAndEmit(date, newTime);
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
