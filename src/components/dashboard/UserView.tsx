import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Clock, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserViewProps {
  user: User;
}

interface OvertimeRecord {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  had_lunch: boolean;
  total_hours: number;
  total_value: number;
}

export const UserView = ({ user }: UserViewProps) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from("overtime_records")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (error) {
        console.error("Error fetching records:", error);
        toast.error("Erro ao carregar registros");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data?.full_name) {
          const firstName = data.full_name.split(" ")[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchRecords();
    fetchUserProfile();
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    toast.success("Logout realizado com sucesso!");
  };

  const totalHours = records.reduce((sum, record) => sum + Number(record.total_hours), 0);
  const totalValue = records.reduce((sum, record) => sum + Number(record.total_value), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {userName ? `Olá, ${userName}` : "Minhas Horas Extras"}
              </h1>
              <p className="text-sm text-muted-foreground">Visualize seus registros</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Registros
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{records.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Horas
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {totalHours.toFixed(2)}h
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                R$ {totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Histórico de Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : records.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum registro encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Almoço</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{record.start_time}</TableCell>
                      <TableCell>{record.end_time}</TableCell>
                      <TableCell>{record.had_lunch ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(record.total_hours).toFixed(2)}h
                      </TableCell>
                      <TableCell className="text-right font-medium text-accent">
                        R$ {Number(record.total_value).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
