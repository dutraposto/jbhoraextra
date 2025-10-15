import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OvertimeFormProps {
  onSuccess: () => void;
}

interface UserProfile {
  id: string;
  full_name: string;
}

export const OvertimeForm = ({ onSuccess }: OvertimeFormProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hadLunch, setHadLunch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const loadUsers = async () => {
    if (usersLoaded) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
      setUsersLoaded(true);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Erro ao carregar usuários");
    }
  };

  const calculateHoursAndValue = (start: string, end: string, lunch: boolean) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    let totalMinutes = endMinutes - startMinutes;
    if (lunch) {
      totalMinutes -= 60; // Desconta 1 hora de almoço
    }

    const totalHours = totalMinutes / 60;
    const totalValue = totalHours * 15.57;

    return {
      totalHours: Math.max(0, totalHours),
      totalValue: Math.max(0, totalValue),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }

    setLoading(true);

    try {
      const { totalHours, totalValue } = calculateHoursAndValue(
        startTime,
        endTime,
        hadLunch
      );

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;

      if (!currentUserId) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase.from("overtime_records").insert({
        user_id: selectedUserId,
        date,
        start_time: startTime,
        end_time: endTime,
        had_lunch: hadLunch,
        total_hours: totalHours,
        total_value: totalValue,
        created_by: currentUserId,
      });

      if (error) throw error;

      toast.success("Hora extra registrada com sucesso!");
      setSelectedUserId("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setHadLunch(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving overtime:", error);
      toast.error("Erro ao registrar hora extra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Adicionar Hora Extra
        </CardTitle>
        <CardDescription>Registre uma nova hora extra para um usuário</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuário</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              onOpenChange={(open) => open && loadUsers()}
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || "Sem nome"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Início</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Fim</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="lunch"
              checked={hadLunch}
              onCheckedChange={(checked) => setHadLunch(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="lunch"
              className="text-sm font-normal cursor-pointer"
            >
              Teve horário de almoço (desconta 1 hora)
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Registrar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
