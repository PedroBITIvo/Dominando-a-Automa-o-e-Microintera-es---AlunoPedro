import { z } from "zod";

export const inscricaoSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  emailCorporativo: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" }),
  departamento: z
    .string()
    .min(1, { message: "Selecione um departamento" }),
  nivelAutomacao: z
    .string()
    .min(1, { message: "Selecione o nível de familiaridade" }),
  acessibilidade: z.boolean(),
  detalheAcessibilidade: z
    .string()
    .trim()
    .max(500, { message: "Descrição deve ter no máximo 500 caracteres" })
    .optional(),
  diaParticipacao: z.date({
    required_error: "Selecione o dia de participação",
  }),
  observacoes: z
    .string()
    .trim()
    .max(1000, { message: "Observações devem ter no máximo 1000 caracteres" })
    .optional(),
}).refine(
  (data) => {
    if (data.acessibilidade && (!data.detalheAcessibilidade || data.detalheAcessibilidade.trim() === "")) {
      return false;
    }
    return true;
  },
  {
    message: "Descreva sua necessidade de acessibilidade",
    path: ["detalheAcessibilidade"],
  }
);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
    .max(100, { message: "Senha deve ter no máximo 100 caracteres" }),
});

export const signupSchema = loginSchema.extend({
  confirmPassword: z
    .string()
    .min(6, { message: "Confirmação de senha é obrigatória" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type InscricaoFormData = z.infer<typeof inscricaoSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
