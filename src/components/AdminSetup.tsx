import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, CheckCircle } from "lucide-react";

export const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .limit(1);

      setAdminExists(data && data.length > 0);
    } catch (error) {
      console.error("Error checking admin:", error);
    } finally {
      setChecking(false);
    }
  };

  const createFirstAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-first-admin");

      if (error) throw error;

      toast.success("Conta administrativa criada com sucesso!");
      setAdminExists(true);
    } catch (error: any) {
      console.error("Error creating admin:", error);
      if (error.message?.includes("already exists")) {
        toast.error("Já existe uma conta administrativa");
        setAdminExists(true);
      } else {
        toast.error("Erro ao criar conta administrativa");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (adminExists) {
    return (
      <Card className="shadow-card max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
          </div>
          <CardTitle>Sistema Configurado</CardTitle>
          <CardDescription>
            O administrador já foi criado. Use as credenciais para fazer login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm font-medium">Credenciais de Acesso:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Email:</strong> adm1@sistema.com</p>
              <p><strong>Senha:</strong> adm111</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>Configuração Inicial</CardTitle>
        <CardDescription>
          Crie a conta do administrador para começar a usar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <p className="text-sm font-medium">Conta que será criada:</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Email:</strong> adm1@sistema.com</p>
            <p><strong>Senha:</strong> adm111</p>
          </div>
        </div>

        <Button
          onClick={createFirstAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Criar Conta Administrativa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
