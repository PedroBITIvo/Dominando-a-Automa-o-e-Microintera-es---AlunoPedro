import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DEPARTAMENTOS, NIVEIS_AUTOMACAO } from "@/lib/constants";

interface Inscricao {
  id: string;
  departamento: string;
  nivel_automacao: string;
  acessibilidade: boolean;
  dia_participacao: string;
}

interface DashboardChartsProps {
  inscricoes: Inscricao[];
}

const COLORS = ["hsl(217, 91%, 50%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(280, 65%, 60%)", "hsl(340, 75%, 55%)", "hsl(200, 70%, 50%)"];

export function DashboardCharts({ inscricoes }: DashboardChartsProps) {
  const departamentoData = useMemo(() => {
    return DEPARTAMENTOS.map((dept) => ({
      name: dept,
      total: inscricoes.filter((i) => i.departamento === dept).length,
    })).filter((d) => d.total > 0);
  }, [inscricoes]);

  const nivelData = useMemo(() => {
    return NIVEIS_AUTOMACAO.map((nivel) => ({
      name: nivel.label,
      value: inscricoes.filter((i) => i.nivel_automacao === nivel.value).length,
    })).filter((n) => n.value > 0);
  }, [inscricoes]);

  const diaData = useMemo(() => {
    const dias: Record<string, number> = {};
    inscricoes.forEach((i) => {
      const dia = i.dia_participacao;
      dias[dia] = (dias[dia] || 0) + 1;
    });
    return Object.entries(dias)
      .map(([dia, total]) => ({
        name: new Date(dia + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inscricoes]);

  if (inscricoes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Inscrições por Departamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Inscrições por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departamentoData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="total" fill="hsl(217, 91%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Nível de Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Nível de Familiaridade com Automação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nivelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {nivelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Inscrições por Dia */}
      {diaData.length > 1 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Inscrições por Dia de Participação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diaData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
