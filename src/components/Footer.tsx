import { Mail, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full mt-16 relative z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border border-gray-800/50 backdrop-blur-md p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            {/* CNPJ */}
            <div className="text-center md:text-left">
              <p className="text-sm font-rajdhani">
                <span className="font-orbitron font-bold text-primary">MICRONET SOLUÇÕES EM INFORMÁTICA</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">CNPJ: 52.026.347/0001-07</p>
            </div>

            {/* Cidade */}
            <div className="text-center">
              <p className="text-sm font-rajdhani text-gray-300">Feijó - Acre</p>
            </div>

            {/* Contatos */}
            <div className="flex items-center gap-6">
              {/* Email */}
              <a 
                href="mailto:micronetinfo.suporte@gmail.com"
                className="flex items-center gap-2 text-sm font-rajdhani hover:text-primary transition-colors duration-300 group"
              >
                <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">micronetinfo.suporte@gmail.com</span>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/micronet.ac/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-rajdhani hover:text-primary transition-colors duration-300 group"
              >
                <Instagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">@micronet.ac</span>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-4 pt-4 border-t border-gray-800/50 text-center">
            <p className="text-xs text-gray-500 font-rajdhani">
              © {new Date().getFullYear()} Micronet Soluções em Informática. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;