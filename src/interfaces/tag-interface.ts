export interface Tags {
  id: string;
  title: string;
  color: string;
  order: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTags {
  title: string;
  color: string;
  order: number;
  description?: string;
}
