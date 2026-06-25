import { z } from "zod";

export interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resourceId: string;
    order: number;
    details?: { notes?: string; service?: string; image?: string; [key: string]: unknown };
}

export const updateAppointmentSchema = z.object({
    title: z.string().min(1,{message:"Title is required"}).max(50,{message:"Title is too long"}),
    start: z.date(),
    end: z.date(),
    details: z.record(z.unknown()).optional(),
})
.refine((data) => data.end.getTime() >= data.start.getTime(), {
    message: "End date must be after start date",
    path: ["end"],
});
 

export const createAppointmentSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(50, { message: "Title is too long" }),
    start: z.date(),
    end: z.date(),
    resourceId: z.string()
        .min(1, { message: "Resource is required" }),
    order: z.number().optional(),
    details: z.record(z.unknown()).optional(),
})
.refine((data) => data.end.getTime() >= data.start.getTime(), {
    message: "End date must be after start date",
    path: ["end"], // This helps to focus the error message on the end date field
});
