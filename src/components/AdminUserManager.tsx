import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, UserPlus } from "lucide-react";

const AdminUserManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha usuário e senha.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(
        'https://tfpeumpslrrnsmcwblvm.supabase.co/rest/v1/rpc/create_admin_user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcGV1bXBzbHJybnNtY3dibHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTAyMTEsImV4cCI6MjA3NDY4NjIxMX0._heKewzUEhEJUxc4Q1-I6iozzjsQw51XcMwFI_wNk0g'
          },
          body: JSON.stringify({
            p_username: newUsername.trim(),
            p_password: newPassword
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      toast({
        title: 'Usuário criado',
        description: 'Usuário administrativo criado com sucesso.',
      });

      setNewUsername('');
      setNewPassword('');
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o usuário.',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (id: string, isMaster: boolean) => {
    if (isMaster) {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível excluir o usuário master.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Usuário removido',
        description: 'Usuário removido com sucesso.',
      });

      loadUsers();
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o usuário.',
        variant: 'destructive'
      });
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_credentials')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });

      loadUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Gerenciar Usuários Administrativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário para adicionar usuário */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Usuário</Label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nome de usuário"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Senha"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addUser}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </div>
          </div>

          {/* Tabela de usuários */}
          {loading ? (
            <div className="text-center text-white">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Usuário</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Último Login</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-white">{user.username}</TableCell>
                    <TableCell>
                      {user.is_master ? (
                        <span className="text-yellow-400 font-bold">Master</span>
                      ) : (
                        <span className="text-blue-400">Admin</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.active ? "default" : "secondary"}
                        onClick={() => toggleUserStatus(user.id, user.active)}
                        className={user.active ? "bg-green-600" : "bg-gray-600"}
                      >
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-white">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(user.id, user.is_master)}
                        disabled={user.is_master}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManager;