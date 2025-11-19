import { 
  Building2, 
  Heart, 
  GraduationCap, 
  Hammer, 
  Users, 
  Palette, 
  Shield, 
  Sprout, 
  AlertTriangle, 
  UserCheck,
  Settings,
  Leaf,
  Phone,
  DollarSign,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SecretariaCardProps {
  nome: string;
  onClick: () => void;
}

const getIcon = (secretaria: string) => {
  switch (secretaria) {
    case "Secretaria Municipal de Planejamento e Finanças":
      return DollarSign;
    case "Secretaria Municipal de Saúde":
      return Heart;
    case "Secretaria Municipal de Obras, Viação e Urbanismo":
      return Hammer;
    case "Secretaria Municipal de Educação":
      return GraduationCap;
    case "Secretaria Municipal de Cidadania e Inclusão Social":
      return Users;
    case "Secretaria Municipal de Cultura, Esporte, Turismo e Lazer":
      return Palette;
    case "Controladoria Interna":
      return Shield;
    case "Secretaria Municipal de Agricultura e Agronegócio":
      return Sprout;
    case "Coordenadoria de Proteção e Defesa Civil":
      return AlertTriangle;
    case "Gabinete do Prefeito":
      return UserCheck;
    case "Secretaria Municipal de Administração":
      return User;
    case "Secretaria Municipal de Meio Ambiente":
      return Leaf;
    case "Secretaria de Comunicação":
      return Phone;
    default:
      return Building2;
  }
};

const SecretariaCard = ({ nome, onClick }: SecretariaCardProps) => {
  const Icon = getIcon(nome);

  return (
    <Card 
      className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-primary/30 rounded-2xl shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/30 cursor-pointer transition-all duration-500 hover:scale-105 hover:border-primary/60 group overflow-hidden relative"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardContent className="p-6 text-center space-y-4 relative z-10">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary-light to-primary rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/50">
          <Icon className="h-10 w-10 text-black" strokeWidth={2.5} />
        </div>
        <h3 className="font-semibold font-rajdhani text-base text-foreground group-hover:text-primary transition-colors duration-300 tracking-wide">
          {nome}
        </h3>
      </CardContent>
    </Card>
  );
};

export default SecretariaCard;