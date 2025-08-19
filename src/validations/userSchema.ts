import { z } from "zod";
const UserRole = z.enum(["ADMIN", "USER"]);

export const userSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.email("Formato de e-mail inválido."),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .or(z.literal("")),
  role: UserRole,
  queueIds: z.array(z.string()).optional(),
  companyId: z.string(),
  connectionId: z.string(),
});

export type UserFormData = z.infer<typeof userSchema>;
