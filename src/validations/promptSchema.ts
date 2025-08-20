import { z } from "zod";

export const promptSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório e deve conter pelo menos 1 caractere."),
  prompt: z.string().min(1, "O campo de prompt é obrigatório."),

  maxTokens: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number()
      .min(10, "O número mínimo de tokens é 10.")
      .max(1000, "O número máximo de tokens permitido é 1000.")
      .default(500),
  ),

  maxMessages: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(1, "O número mínimo de mensagens é 1.").default(500),
  ),

  temperature: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number()
      .min(0, "A temperatura não pode ser menor que 0.")
      .max(2, "A temperatura não pode ser maior que 2.")
      .default(0.8),
  ),

  description: z.string().optional(),

  companyResume: z.string().min(1, "O resumo da empresa é obrigatório."),
  queueId: z.string().optional(),
});
