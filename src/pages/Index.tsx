import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="text-center max-w-2xl mx-auto space-y-8">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elevated">
            <Clock className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Sistema de Horas Extras
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Gerencie e acompanhe suas horas extras de forma simples e eficiente
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity h-12 px-8"
          >
            Acessar Sistema
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Controle Preciso</h3>
            <p className="text-sm text-muted-foreground">
              Registre data e horário exato de suas horas extras
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Cálculo Automático</h3>
            <p className="text-sm text-muted-foreground">
              R$ 15,57 por hora com desconto automático de almoço
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-elevated transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Dashboard Completo</h3>
            <p className="text-sm text-muted-foreground">
              Visualize totais e histórico de forma clara
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
