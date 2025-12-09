import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle, Loader2, User, Mail, Building2, Zap, Accessibility, MessageSquare } from "lucide-react";
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

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<InscricaoFormData>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      nomeCompleto: "",
      emailCorporativo: "",
      departamento: "",
      nivelAutomacao: "",
      acessibilidade: false,
      detalheAcessibilidade: "",
      observacoes: "",
    },
  });

  const watchAcessibilidade = form.watch("acessibilidade");

  const onSubmit = async (data: InscricaoFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("inscricoes").insert({
        nome_completo: data.nomeCompleto,
        email_corporativo: data.emailCorporativo,
        departamento: data.departamento,
        nivel_automacao: data.nivelAutomacao,
        acessibilidade: data.acessibilidade,
        detalhe_acessibilidade: data.acessibilidade ? data.detalheAcessibilidade : null,
        dia_participacao: format(data.diaParticipacao, "yyyy-MM-dd"),
        observacoes: data.observacoes || null,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Inscrição enviada com sucesso!",
        description: "Você receberá mais informações por e-mail.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erro ao enviar inscrição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Inscrição enviada com sucesso!
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Obrigado por se inscrever. Você receberá mais informações sobre o evento
          no seu e-mail corporativo.
        </p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setIsSuccess(false);
            form.reset();
          }}
        >
          Fazer nova inscrição
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nomeCompleto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite seu nome completo"
                  {...field}
                />
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
              <FormLabel className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail Corporativo
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu.email@empresa.com"
                  {...field}
                />
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
              <FormLabel className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Departamento/Área
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu departamento" />
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
              <FormLabel className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Nível de Familiaridade com Automação
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6"
                >
                  {NIVEIS_AUTOMACAO.map((nivel) => (
                    <div key={nivel.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={nivel.value} id={nivel.value} />
                      <Label htmlFor={nivel.value} className="cursor-pointer">
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-base">
                  <Accessibility className="w-4 h-4" />
                  Precisa de Acessibilidade Especial?
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watchAcessibilidade && (
          <FormField
            control={form.control}
            name="detalheAcessibilidade"
            render={({ field }) => (
              <FormItem className="animate-slide-up">
                <FormLabel>Descreva sua necessidade de acessibilidade</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva aqui suas necessidades específicas..."
                    className="resize-none"
                    {...field}
                  />
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
              <FormLabel className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Dia que irá participar
              </FormLabel>
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
              <p className="text-xs text-muted-foreground">
                Datas disponíveis: 15 a 20 de janeiro de 2025
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Observações/Dúvidas (opcional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alguma observação ou dúvida sobre o evento?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Realizar Inscrição"
          )}
        </Button>
      </form>
    </Form>
  );
}
