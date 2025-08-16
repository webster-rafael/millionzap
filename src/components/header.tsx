import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Zap,
  CheckSquare,
  Users,
  Calendar,
  Tag,
  MessageCircle,
  HelpCircle,
  Megaphone,
  List,
  Settings,
  FileText,
  Info,
  Bot,
  Puzzle,
  LinkIcon,
  Archive,
  UsersIcon,
  Cog,
  DollarSign,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const { user, logoutUser } = useAuth();
  const [isCampanhasOpen, setIsCampanhasOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const mainItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Atendimentos", href: "/atendimentos", icon: MessageSquare },
    { name: "Kanban", href: "/kanban", icon: Kanban },
    { name: "Respostas Rápidas", href: "/respostas-rapidas", icon: Zap },
    { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
    { name: "Contatos", href: "/contatos", icon: Users },
    { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
    { name: "Tags", href: "/tags", icon: Tag },
    { name: "Chat Interno", href: "/chat-interno", icon: MessageCircle },
    { name: "Ajuda", href: "/ajuda", icon: HelpCircle },
  ];

  const adminItems = [
    {
      name: "Campanhas",
      icon: Megaphone,
      isCollapsible: true,
      isOpen: isCampanhasOpen,
      onToggle: () => setIsCampanhasOpen(!isCampanhasOpen),
      subItems: [
        { name: "Listagem", href: "/campanhas", icon: List },
        {
          name: "Contatos",
          href: "/campanhas/listas-de-contatos",
          icon: Users,
        },
        {
          name: "Configurações",
          href: "/campanhas/configuracoes",
          icon: Settings,
        },
        {
          name: "Informativos",
          href: "/campanhas/informativos",
          icon: FileText,
        },
      ],
    },
    { name: "Informativos", href: "/informativos", icon: Info },
    { name: "Open AI", href: "/open-ai", icon: Bot },
    { name: "Integrações", href: "/integracoes", icon: Puzzle },
    { name: "Conexões", href: "/conexoes", icon: LinkIcon },
    { name: "Lista de arquivos", href: "/lista-de-arquivos", icon: Archive },
    { name: "Filas & Chatbot", href: "/filas-chatbot", icon: MessageCircle },
    { name: "Usuários", href: "/usuarios", icon: UsersIcon },
    { name: "API", href: "/api", icon: Cog },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  const handleOpenMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
  };

  return (
    <>
      <header className="fixed z-30 flex h-20 w-full items-center justify-between border-b bg-zinc-100 px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fc7800]">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <img src="/logo.png" alt="Logo do millionzap" className="w-40" />
          </div>
        </div>
        <Menu
          onClick={handleOpenMenu}
          className="text-primary h-8 w-8 rounded-md bg-zinc-200 p-1"
        />
      </header>
      {isOpen && (
        <div className="absolute z-20 h-dvh w-full space-y-4 overflow-y-hidden bg-zinc-100 p-4 pt-24">
          <nav className="flex flex-col gap-2">
            {mainItems.map((item) => (
              <Link
                className="border-b pb-2"
                to={item.href}
                onClick={handleOpenMenu}
                key={item.name}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}

            {user?.role === "ADMIN" && (
              <>
                {adminItems.map((item) => (
                  <Link
                    className="border-b pb-2"
                    to={item.href || "/"}
                    onClick={handleOpenMenu}
                    key={item.name}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </nav>
          <Button
            onClick={handleLogout}
            className="bg-secondary-million h-12 w-full"
          >
            Sair <LogOut className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}
