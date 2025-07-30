import { z } from "zod";

export const tagSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter no mínimo 3 caracteres." }),
  description: z.string().optional(),
  color: z.string().min(1, { message: "Por favor, selecione uma cor." }),
});
