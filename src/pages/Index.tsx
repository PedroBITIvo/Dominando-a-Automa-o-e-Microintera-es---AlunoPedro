import { Link } from "react-router-dom";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CalendarDays } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Workshop de Automação</h1>
              <p className="text-xs text-muted-foreground">15 a 20 de Janeiro de 2025</p>
            </div>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="w-4 h-4" />
              Área RH
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-xl mx-auto">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                Inscrição para o Evento
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha o formulário abaixo para confirmar sua participação no
                Workshop de Automação Corporativa.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <RegistrationForm />
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao se inscrever, você concorda com os termos de uso e política de privacidade.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
