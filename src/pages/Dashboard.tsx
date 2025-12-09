import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogOut, Download, Users, Building2, Accessibility, Filter, Pencil, Trash2, Loader2, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTAMENTOS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { EditInscricaoDialog } from "@/components/EditInscricaoDialog";
import { DashboardCharts } from "@/components/DashboardCharts";
import { cn } from "@/lib/utils";

interface Inscricao {
  id: string;
  nome_completo: string;
  email_corporativo: string;
  departamento: string;
  nivel_automacao: string;
  acessibilidade: boolean;
  detalhe_acessibilidade: string | null;
  dia_participacao: string;
  observacoes: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [filteredInscricoes, setFilteredInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDepartamento, setFilterDepartamento] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [editingInscricao, setEditingInscricao] = useState<Inscricao | null>(null);

  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchInscricoes();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    let filtered = [...inscricoes];

    if (filterDepartamento && filterDepartamento !== "all") {
      filtered = filtered.filter((i) => i.departamento === filterDepartamento);
    }

    if (filterDate) {
      const dateStr = format(filterDate, "yyyy-MM-dd");
      filtered = filtered.filter((i) => i.dia_participacao === dateStr);
    }

    setFilteredInscricoes(filtered);
  }, [inscricoes, filterDepartamento, filterDate]);

  const fetchInscricoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inscricoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInscricoes(data || []);
    } catch (error) {
      console.error("Error fetching inscricoes:", error);
      toast({
        title: "Erro ao carregar inscrições",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("inscricoes").delete().eq("id", id);
      if (error) throw error;

      setInscricoes((prev) => prev.filter((i) => i.id !== id));
      toast({
        title: "Inscrição excluída",
        description: "A inscrição foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting inscricao:", error);
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const exportToCSV = () => {
    const headers = [
      "Nome Completo",
      "E-mail",
      "Departamento",
      "Nível Automação",
      "Acessibilidade",
      "Detalhe Acessibilidade",
      "Dia Participação",
      "Observações",
      "Data Criação",
    ];

    const rows = filteredInscricoes.map((i) => [
      i.nome_completo,
      i.email_corporativo,
      i.departamento,
      i.nivel_automacao,
      i.acessibilidade ? "Sim" : "Não",
      i.detalhe_acessibilidade || "",
      format(parseISO(i.dia_participacao), "dd/MM/yyyy"),
      i.observacoes || "",
      format(parseISO(i.created_at), "dd/MM/yyyy HH:mm"),
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inscricoes_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterDepartamento("all");
    setFilterDate(undefined);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalInscricoes = inscricoes.length;
  const inscricoesPorDepartamento = DEPARTAMENTOS.map((dept) => ({
    name: dept,
    value: inscricoes.filter((i) => i.departamento === dept).length,
  }));
  const inscricoesComAcessibilidade = inscricoes.filter((i) => i.acessibilidade).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Dashboard RH</h1>
              <p className="text-xs text-muted-foreground">Gerenciamento de Inscrições</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Inscritos
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalInscricoes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Departamentos
              </CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {inscricoesPorDepartamento.filter((d) => d.value > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">com inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Acessibilidade
              </CardTitle>
              <Accessibility className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {inscricoesComAcessibilidade}
              </div>
              <p className="text-xs text-muted-foreground">precisam de acessibilidade</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <DashboardCharts inscricoes={inscricoes} />

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold">Lista de Inscritos</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {DEPARTAMENTOS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {filterDate ? format(filterDate, "dd/MM/yyyy") : "Data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterDate}
                      onSelect={setFilterDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {(filterDepartamento !== "all" || filterDate) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}

                <Button onClick={exportToCSV} size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Acessibilidade</TableHead>
                    <TableHead>Dia</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInscricoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma inscrição encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInscricoes.map((inscricao) => (
                      <TableRow key={inscricao.id}>
                        <TableCell className="font-medium">{inscricao.nome_completo}</TableCell>
                        <TableCell>{inscricao.email_corporativo}</TableCell>
                        <TableCell>{inscricao.departamento}</TableCell>
                        <TableCell className="capitalize">{inscricao.nivel_automacao}</TableCell>
                        <TableCell>
                          {inscricao.acessibilidade ? (
                            <span className="text-primary font-medium">Sim</span>
                          ) : (
                            <span className="text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(inscricao.dia_participacao), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(inscricao.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingInscricao(inscricao)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a inscrição de{" "}
                                    <strong>{inscricao.nome_completo}</strong>? Esta ação não pode
                                    ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(inscricao.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredInscricoes.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Exibindo {filteredInscricoes.length} de {totalInscricoes} inscrições
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      {editingInscricao && (
        <EditInscricaoDialog
          inscricao={editingInscricao}
          open={!!editingInscricao}
          onOpenChange={(open) => !open && setEditingInscricao(null)}
          onSave={() => {
            fetchInscricoes();
            setEditingInscricao(null);
          }}
        />
      )}
    </div>
  );
}
