export interface ToDo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  responsibleId?: string | null;
  createdById: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateToDo {
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  responsibleId?: string | null;
  dueDate?: string | null;
}

export type UpdateToDo = Partial<CreateToDo> & {
  completed?: boolean;
};
