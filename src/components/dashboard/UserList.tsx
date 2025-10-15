import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Pencil, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  full_name: string;
  user_roles: {
    role: string;
  }[];
}

export const UserList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          user_roles (
            role
          )
        `)
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.full_name || "");
    setEditRole(user.user_roles[0]?.role as "user" | "admin" || "user");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);

    try {
      // Update profile name
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: editName })
        .eq("id", editingUser.id);

      if (profileError) throw profileError;

      // Update role
      const currentRole = editingUser.user_roles[0]?.role;
      if (currentRole !== editRole) {
        // Delete old role
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editingUser.id);

        if (deleteError) throw deleteError;

        // Insert new role
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({
            user_id: editingUser.id,
            role: editRole,
          });

        if (insertError) throw insertError;
      }

      toast.success("Usuário atualizado com sucesso!");
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Gerenciar Usuários
        </CardTitle>
        <CardDescription>Visualize e edite os usuários do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    <Badge variant={user.user_roles[0]?.role === "admin" ? "default" : "secondary"}>
                      {user.user_roles[0]?.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={dialogOpen && editingUser?.id === user.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                          <DialogDescription>
                            Atualize as informações do usuário
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome Completo</Label>
                            <Input
                              id="edit-name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={saving}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-role">Perfil</Label>
                            <Select
                              value={editRole}
                              onValueChange={(value) => setEditRole(value as "user" | "admin")}
                              disabled={saving}
                            >
                              <SelectTrigger id="edit-role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuário Normal</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={handleSave}
                            className="w-full"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              "Salvar Alterações"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
