import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 caracteres")
    .regex(/^\d+$/, "Telefone deve conter apenas números"),
  email: z.email("E-mail inválido").optional().or(z.literal("")),
  companyId: z.string(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
