export const DEPARTAMENTOS = [
  "RH",
  "TI",
  "Vendas",
  "Operações",
  "Financeiro",
  "Marketing",
] as const;

export const NIVEIS_AUTOMACAO = [
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
] as const;

export const EVENT_DATE_START = new Date(2025, 0, 15); // 15 de janeiro de 2025
export const EVENT_DATE_END = new Date(2025, 0, 20); // 20 de janeiro de 2025

export type Departamento = typeof DEPARTAMENTOS[number];
export type NivelAutomacao = typeof NIVEIS_AUTOMACAO[number]["value"];
