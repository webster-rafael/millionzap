export interface Queue {
  id: string;
  name: string;
  color: string;
  greetingMessage: string | null;
  outOfOfficeHoursMessage: string | null;
  promptId: string | null;
  integrationId: string | null;
  isActive: boolean;
  priority: number;
  schedules: Schedule[];
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
}

export interface QueueCreate {
  name: string;
  color?: string;
  greetingMessage?: string;
  outOfOfficeHoursMessage?: string;
  promptId?: string;
  integrationId?: string;
  isActive?: boolean;
  priority?: number;
  schedules?: Schedule[];
  companyId: string;
}

export interface Schedule {
  weekday: string;
  startTime: string;
  endTime: string;
  weekdayEn: string;
}
