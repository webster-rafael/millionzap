export interface Configuration {
  id: string;
  companyId: string;
  followupTimeInHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConfiguration {
  companyId: string;
  followupTimeInHours: number;
}
