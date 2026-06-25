import React, { FC, useEffect } from "react";
import CalendarToolbar from "./PlannerToolbar";
import Appointment from "./Appointment";
import { Appointment as AppointmentType, Resource } from "@/models";
import {
  PlannerDataContextProvider,
  useData,
} from "@/contexts/PlannerDataContext";
import { PlannerProvider, useCalendar } from "@/contexts/PlannerContext";
import { Timeline } from "./Timeline";
import { Table, TableBody, TableRow } from "../ui/table";
import ResourceTableCell from "./ResourceTableCell";
import { calculateNewDates, filterAppointments } from "@/lib/utils";
import DropTableCell from "./DropTableCell";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

export interface PlannerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialResources: Resource[];
  initialAppointments: AppointmentType[]; 
}

const Planner: React.FC<PlannerProps> = ({
  initialResources,
  initialAppointments,
  ...props
}) => {
  return (
    <PlannerDataContextProvider
      initialAppointments={initialAppointments}
      initialResources={initialResources}
    >
      <PlannerProvider>
        <PlannerMainComponent {...props} />
      </PlannerProvider>
    </PlannerDataContextProvider>
  );
};

export interface PlannerMainComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PlannerMainComponent: FC<PlannerMainComponentProps> = ({ ...props }) => {
  return (
    <div className="flex flex-col gap-2  ">
      <CalendarToolbar />
      <CalendarContent {...props} />
    </div>
  );
};

interface CalendarContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const CalendarContent: React.FC<CalendarContentProps> = ({ ...props }) => {
  const { viewMode, dateRange, timeLabels } = useCalendar();
  const { resources, appointments, updateAppointment } = useData();

  const appointmentsRef = React.useRef(appointments);
  const resourcesRef = React.useRef(resources);
  useEffect(() => {
    appointmentsRef.current = appointments;
    resourcesRef.current = resources;
  }, [appointments, resources]);

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0]?.data;
        const sourceData = source.data;

        if (!destination || !sourceData) return;

        const appointment = appointmentsRef.current.find(
          (appt) => appt.id === sourceData.appointmentId,
        );
        if (!appointment) return;

        const newResource = resourcesRef.current.find(
          (res) => res.id === destination.resourceId,
        );
        if (!newResource) return;

        const newDates = calculateNewDates(
          viewMode,
          Number(destination.columnIndex),
          Number(sourceData.columnIndex),
          {
            from: appointment.start,
            to: appointment.end,
          },
        );

        updateAppointment({
          ...appointment,
          start: newDates.start as Date,
          end: newDates.end as Date,
          resourceId: newResource.id,
        });
      },
    });
  }, [viewMode, updateAppointment]);

  const groupedAppointments = React.useMemo(() => {
    const map = new Map<string, Map<number, AppointmentType[]>>();
    for (const appt of appointments) {
      if (!map.has(appt.resourceId)) {
        map.set(appt.resourceId, new Map());
      }
      const resMap = map.get(appt.resourceId)!;
      for (let i = 0; i < (timeLabels?.length || 0); i++) {
        if (filterAppointments(appt, i, dateRange, viewMode)) {
          if (!resMap.has(i)) {
            resMap.set(i, []);
          }
          resMap.get(i)!.push(appt);
        }
      }
    }
    
    for (const resMap of map.values()) {
      for (const list of resMap.values()) {
        list.sort((a, b) => a.start.getTime() - b.start.getTime());
      }
    }
    return map;
  }, [appointments, timeLabels, dateRange, viewMode]);

  return (
    <div className="flex max-h-[calc(80vh_-_theme(spacing.16))] flex-col  ">
      <div className="calendar-scroll flex-grow overflow-auto">
        <Table>
          <Timeline />
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <ResourceTableCell resourceItem={resource} />
                {timeLabels?.map((label, index) => {
                  const cellAppointments = groupedAppointments.get(resource.id)?.get(index) || [];
                  return (
                    <DropTableCell
                      resourceId={resource.id}
                      columnIndex={index}
                      key={index}
                    >
                      {cellAppointments.map((appt) => (
                        <Appointment
                          appointment={appt}
                          columnIndex={index}
                          resourceId={resource.id}
                          key={appt.id}
                        />
                      ))}
                    </DropTableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Planner;
