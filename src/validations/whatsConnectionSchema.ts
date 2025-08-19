import { z } from "zod";

export const connectionSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  isDefault: z.boolean(),

  greetingMessage: z.string().optional(),
  conclusionMessage: z.string().optional(),
  outOfOfficeHoursMessage: z.string().optional(),
  reviewMessage: z.string().optional(),

  token: z.string().optional(),
  queueId: z.string().optional(),
  promptId: z.string().optional(),

  transferQueueId: z.string().optional(),
  timeToTransfer: z.string().optional(),
  expiresInactiveMessage: z.string().optional(),
});

export type ConnectionFormData = z.infer<typeof connectionSchema>;
