"use client";

import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import type { Appointment as AppointmentType } from "@/models/Appointment";
import { updateAppointmentSchema } from "@/models/Appointment";
import { useData } from "@/contexts/PlannerDataContext";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, EllipsisVertical } from "lucide-react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { TimePicker } from "../ui/time-picker";

interface AppointmentProps {
  appointment: AppointmentType;
  resourceId: string;
  columnIndex: number;
}

const Appointment: React.FC<AppointmentProps> = ({
  appointment,
  resourceId,
  columnIndex,
}) => {
  const { updateAppointment } = useData();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return draggable({
      element,
      getInitialData: () => ({
        appointmentId: appointment.id,
        columnIndex: columnIndex,
        resourceId: resourceId,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [appointment.id, columnIndex, resourceId]);

  const form = useForm<z.infer<typeof updateAppointmentSchema>>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      title: appointment.title,
      start: new Date(appointment.start),
      end: new Date(appointment.end),
    },
  });

  // Keep the form in sync with the appointment after drag-and-drop moves it
  // to a new slot (its start/end change) or after any other external update.
  // `defaultValues` is only applied on mount, so without this the popover form
  // would keep showing the old times after a drop.
  useEffect(() => {
    form.reset({
      title: appointment.title,
      start: new Date(appointment.start),
      end: new Date(appointment.end),
    });
    // `form.reset` identity is stable; we intentionally re-sync on the
    // appointment's mutable fields, not the form instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment.id, appointment.start, appointment.end, appointment.title]);

  function onSubmit(values: z.infer<typeof updateAppointmentSchema>) {
    // `details` is optional in the edit form; never overwrite the existing
    // payload with `undefined`, otherwise the card crashes on the next render
    // when it reads `appointment.details.service`.
    updateAppointment({
      ...appointment,
      ...values,
      details: values.details ?? appointment.details,
    });
  }

  return (
    <Card ref={ref} className="hover:cursor-grab   ">
      <CardHeader className="flex flex-row items-center justify-between p-1">
        <Badge variant={"outline"} className="  truncate pl-2 text-xs">
          {appointment.details?.service}
        </Badge>
        <Popover>
          <PopoverTrigger>
            <div className=" text-xs">
              <EllipsisVertical className="h-4 w-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-fit">
            <Card className="border-none p-0 shadow-none w-fit">
              <CardHeader className="p-0">
                <CardTitle className="text-xs">{appointment.title}</CardTitle>
                <CardDescription className="text-xs">
                  {format(new Date(appointment.start), "MMM dd yyyy HH:mm")} -{" "}
                  {format(new Date(appointment.end), "MMM dd yyyy HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="w-fit">
                <Form {...form} >
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="start"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-left">Start</FormLabel>
                          <Popover>
                            <FormControl>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP HH:mm:ss")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                            </FormControl>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                              <div className="border-t border-border p-3">
                                <TimePicker
                                  setDate={field.onChange}
                                  date={field.value}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-left">End</FormLabel>
                          <Popover>
                            <FormControl>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP HH:mm:ss")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                            </FormControl>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                              <div className="border-t border-border p-3">
                                <TimePicker
                                  setDate={field.onChange}
                                  date={field.value}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent
        className={cn("px-2 py-2", {
          "cursor-grabbing bg-muted opacity-50": isDragging,
        })}
      >
        <div className="flex flex-col items-center gap-2 text-xs">
          <div>{appointment.title}</div>
          <div>
            {format(new Date(appointment.start), "kk:mm")} -{" "}
            {format(new Date(appointment.end), "kk:mm")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default Appointment;
