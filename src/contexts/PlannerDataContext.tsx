import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode, FC } from "react";
import { AppointmentService, ResourceService } from "../services";
import type { Appointment, Resource } from "../models";

interface DataContextType {
  appointments: Appointment[];
  resources: Resource[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  removeResource: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const PlannerDataContextProvider: FC<{
  children: ReactNode;
  initialAppointments: Appointment[];
  initialResources: Resource[];
}> = ({ children, initialAppointments, initialResources }) => {
  // The services act as the single source of truth for the data, while a
  // version counter forces consumers to re-render whenever the data mutates.
  // Using a monotonically increasing counter (instead of toggling a boolean)
  // avoids the race where two updates in the same batch cancel each other out
  // and no re-render is triggered.
  const [appointmentService] = useState(
    () => new AppointmentService(initialAppointments),
  );
  const [resourceService] = useState(
    () => new ResourceService(initialResources),
  );
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const addAppointment = useCallback(
    (appointment: Appointment) => {
      appointmentService.createAppointment(appointment);
      bump();
    },
    [appointmentService, bump],
  );
  const updateAppointment = useCallback(
    (appointment: Appointment) => {
      appointmentService.updateAppointment(appointment);
      bump();
    },
    [appointmentService, bump],
  );
  const removeAppointment = useCallback(
    (id: string) => {
      appointmentService.deleteAppointment(id);
      bump();
    },
    [appointmentService, bump],
  );
  const addResource = useCallback(
    (resource: Resource) => {
      resourceService.addResource(resource);
      bump();
    },
    [resourceService, bump],
  );
  const updateResource = useCallback(
    (resource: Resource) => {
      resourceService.updateResource(resource);
      bump();
    },
    [resourceService, bump],
  );
  const removeResource = useCallback(
    (id: string) => {
      resourceService.removeResource(id);
      bump();
    },
    [resourceService, bump],
  );

  // `version` is read here only to recompute the snapshots when data changes.
  const contextValue = useMemo<DataContextType>(
    () => ({
      appointments: appointmentService.getAppointments(),
      resources: resourceService.getResources(),
      addAppointment,
      updateAppointment,
      removeAppointment,
      addResource,
      updateResource,
      removeResource,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      version,
      addAppointment,
      updateAppointment,
      removeAppointment,
      addResource,
      updateResource,
      removeResource,
    ],
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a PlannerDataContextProvider");
  }
  return context;
};
