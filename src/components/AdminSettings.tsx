import { useState } from "react";
import { Clock, MessageSquare, Save, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getAdminSettings, saveAdminSettings, type AdminSettings } from "@/utils/adminSettings";

interface AdminSettingsProps {
  onClose: () => void;
}

const AdminSettings = ({ onClose }: AdminSettingsProps) => {
  const [settings, setSettings] = useState<AdminSettings>(() => getAdminSettings());

  const { toast } = useToast();

  const handleSave = () => {
    saveAdminSettings(settings);
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
    onClose();
  };

  const updateSetting = (path: string, value: any) => {
    setSettings((prev: any) => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>Configurações do Sistema</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Horário de Funcionamento */}
          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-white">
                <Clock className="mr-2 h-5 w-5" />
                Horário de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.workingHours.enabled}
                  onCheckedChange={(checked) => updateSetting('workingHours.enabled', checked)}
                />
                <Label className="text-white">Ativar controle de horário</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Início do expediente</Label>
                  <Input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => updateSetting('workingHours.start', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Fim do expediente</Label>
                  <Input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => updateSetting('workingHours.end', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dias de Funcionamento */}
          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-white">
                <Calendar className="mr-2 h-5 w-5" />
                Dias de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries({
                  monday: 'Segunda-feira',
                  tuesday: 'Terça-feira', 
                  wednesday: 'Quarta-feira',
                  thursday: 'Quinta-feira',
                  friday: 'Sexta-feira',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.workingDays[key as keyof typeof settings.workingDays]}
                      onCheckedChange={(checked) => 
                        updateSetting(`workingDays.${key}`, checked)
                      }
                    />
                    <Label className="text-white">{label}</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label className="text-white">Mensagem para dias não funcionais</Label>
                <Textarea
                  value={settings.nonWorkingDayMessage}
                  onChange={(e) => updateSetting('nonWorkingDayMessage', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mensagens Automáticas */}
          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-white">
                <MessageSquare className="mr-2 h-5 w-5" />
                Mensagens Automáticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Mensagem fora do horário</Label>
                <Textarea
                  value={settings.afterHoursMessage}
                  onChange={(e) => updateSetting('afterHoursMessage', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-white">Mensagem de finais de semana</Label>
                <Textarea
                  value={settings.weekendMessage}
                  onChange={(e) => updateSetting('weekendMessage', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Modo Manutenção */}
          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Modo Manutenção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
                <Label className="text-white">Ativar modo manutenção</Label>
              </div>
              
              <div>
                <Label className="text-white">Mensagem de manutenção</Label>
                <Textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white">
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;