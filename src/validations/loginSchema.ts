import z from "zod";

const CreateCompanyFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome da empresa deve ter pelo menos 3 caracteres" })
    .max(100, { message: "O nome da empresa é muito longo" }),

  phone: z
    .string()
    .min(9, { message: "Número de telefone muito curto" })
    .max(15, { message: "Número de telefone muito longo" })
    .regex(/^\+?\d{9,15}$/, {
      message: "Número de telefone inválido",
    }),

  email: z.email({ message: "E-mail inválido" }),

  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" })
    .regex(/[a-z]/, {
      message: "A senha deve conter pelo menos uma letra minúscula",
    })
    .regex(/[A-Z]/, {
      message: "A senha deve conter pelo menos uma letra maiúscula",
    })
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "A senha deve conter pelo menos um caractere especial",
    })
});

export const loginSchema = z.object({
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha não pode estar em branco." }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export { CreateCompanyFormSchema };
