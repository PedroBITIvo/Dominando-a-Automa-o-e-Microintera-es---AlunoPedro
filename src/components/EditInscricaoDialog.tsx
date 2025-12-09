import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { inscricaoSchema, InscricaoFormData } from "@/lib/validations";
import { DEPARTAMENTOS, NIVEIS_AUTOMACAO, EVENT_DATE_START, EVENT_DATE_END } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

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
}

interface EditInscricaoDialogProps {
  inscricao: Inscricao;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EditInscricaoDialog({
  inscricao,
  open,
  onOpenChange,
  onSave,
}: EditInscricaoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InscricaoFormData>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      nomeCompleto: inscricao.nome_completo,
      emailCorporativo: inscricao.email_corporativo,
      departamento: inscricao.departamento,
      nivelAutomacao: inscricao.nivel_automacao,
      acessibilidade: inscricao.acessibilidade,
      detalheAcessibilidade: inscricao.detalhe_acessibilidade || "",
      diaParticipacao: parseISO(inscricao.dia_participacao),
      observacoes: inscricao.observacoes || "",
    },
  });

  const watchAcessibilidade = form.watch("acessibilidade");

  const onSubmit = async (data: InscricaoFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("inscricoes")
        .update({
          nome_completo: data.nomeCompleto,
          email_corporativo: data.emailCorporativo,
          departamento: data.departamento,
          nivel_automacao: data.nivelAutomacao,
          acessibilidade: data.acessibilidade,
          detalhe_acessibilidade: data.acessibilidade ? data.detalheAcessibilidade : null,
          dia_participacao: format(data.diaParticipacao, "yyyy-MM-dd"),
          observacoes: data.observacoes || null,
        })
        .eq("id", inscricao.id);

      if (error) throw error;

      toast({
        title: "Inscrição atualizada",
        description: "Os dados foram salvos com sucesso.",
      });
      onSave();
    } catch (error) {
      console.error("Error updating inscricao:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Inscrição</DialogTitle>
          <DialogDescription>
            Altere os dados da inscrição abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailCorporativo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Corporativo</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTAMENTOS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivelAutomacao"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Nível de Familiaridade com Automação</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6"
                    >
                      {NIVEIS_AUTOMACAO.map((nivel) => (
                        <div key={nivel.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={nivel.value} id={`edit-${nivel.value}`} />
                          <Label htmlFor={`edit-${nivel.value}`} className="cursor-pointer">
                            {nivel.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acessibilidade"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="text-sm">Precisa de Acessibilidade?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchAcessibilidade && (
              <FormField
                control={form.control}
                name="detalheAcessibilidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhe da Acessibilidade</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="diaParticipacao"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dia de Participação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < EVENT_DATE_START || date > EVENT_DATE_END
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
