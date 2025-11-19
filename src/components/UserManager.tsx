import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'operator';
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

const UserManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operator' as 'admin' | 'operator'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers).map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined
      }));
      setUsers(parsed);
    } else {
      // Usuário padrão
      const defaultUser: AdminUser = {
        id: '1',
        username: 'neto.meireles',
        password: 'suporte@280115',
        name: 'Neto Meireles',
        role: 'admin',
        active: true,
        createdAt: new Date(),
      };
      setUsers([defaultUser]);
      localStorage.setItem('adminUsers', JSON.stringify([defaultUser]));
    }
  };

  const saveUsers = (updatedUsers: AdminUser[]) => {
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Editar usuário existente
      const updatedUsers = users.map(u =>
        u.id === editingUser.id
          ? { ...u, ...formData }
          : u
      );
      saveUsers(updatedUsers);
      toast({
        title: "Usuário atualizado",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
    } else {
      // Criar novo usuário
      const newUser: AdminUser = {
        id: Date.now().toString(),
        ...formData,
        active: true,
        createdAt: new Date()
      };
      
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      toast({
        title: "Usuário criado",
        description: `${formData.name} foi criado com sucesso.`,
      });
    }

    setFormData({ username: '', password: '', name: '', role: 'operator' });
    setShowCreateDialog(false);
    setEditingUser(null);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (userId: string) => {
    if (users.length === 1) {
      toast({
        title: "Erro",
        description: "Não é possível excluir o último usuário do sistema.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
    toast({
      title: "Usuário removido",
      description: "Usuário foi removido com sucesso.",
    });
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u =>
      u.id === userId
        ? { ...u, active: !u.active }
        : u
    );
    saveUsers(updatedUsers);
    
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.active ? "Usuário desativado" : "Usuário ativado",
      description: `${user?.name} foi ${user?.active ? 'desativado' : 'ativado'}.`,
    });
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', role: 'operator' });
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Gerenciar Usuários
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Usuário</label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ex: joao.silva"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Senha</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Senha segura"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nível de Acesso</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'operator' })}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="operator">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="gradient-primary flex-1">
                    {editingUser ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Operador'}
                        </Badge>
                        <Badge variant={user.active ? 'default' : 'destructive'}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={user.active ? "destructive" : "default"}
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    {users.length > 1 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Criado em: {user.createdAt.toLocaleDateString('pt-BR')}</p>
                  {user.lastLogin && (
                    <p>Último acesso: {user.lastLogin.toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserManager;