export interface Queue {
  id: string;
  name: string;
  color: string;
  greetingMessage: string | null;
  outOfOfficeHoursMessage: string | null;
  promptIds: string[];
  integrationId: string | null;
  isActive: boolean;
  priority: number;
  schedules: Schedule[];
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  connections?: string[];
}

export interface QueueCreate {
  name: string;
  color?: string;
  greetingMessage?: string;
  outOfOfficeHoursMessage?: string;
  promptIds?: string[];
  integrationId?: string | null;
  isActive?: boolean;
  priority?: number;
  schedules?: Schedule[];
  companyId: string;
  connections?: string[];
}

export interface Schedule {
  weekday: string;
  startTime: string;
  endTime: string;
  weekdayEn: string;
}
