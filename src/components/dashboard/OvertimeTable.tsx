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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, FileText } from "lucide-react";
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

interface OvertimeRecord {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  had_lunch: boolean;
  total_hours: number;
  total_value: number;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
}

interface OvertimeTableProps {
  records: OvertimeRecord[];
  loading: boolean;
  onUpdate: () => void;
}

export const OvertimeTable = ({ records, loading, onUpdate }: OvertimeTableProps) => {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("overtime_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Registro excluído com sucesso!");
      onUpdate();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Erro ao excluir registro");
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Todos os Registros
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : records.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum registro encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Almoço</TableHead>
                  <TableHead className="text-right">Horas</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.profiles?.full_name || "N/A"}
                    </TableCell>
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
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(record.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
