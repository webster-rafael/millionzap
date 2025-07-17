import { useState } from "react";
import { cn } from "@/lib/utils";
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
  Settings,
  ChevronDown,
  ChevronRight,
  Megaphone,
  List,
  FileText,
  Bot,
  Puzzle,
  LinkIcon,
  Archive,
  UsersIcon,
  DollarSign,
  Cog,
  Info,
} from "lucide-react";
import { useLocation } from "react-router-dom";

export function Sidebar() {
  const { pathname } = useLocation();
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  const [isCampanhasOpen, setIsCampanhasOpen] = useState(false);

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
          name: "Listas de Contatos",
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

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fc7800]">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <img src="/logo.png" alt="Logo do millionzap" className="w-40" />
            {/* <p className="text-xs text-gray-500">ERP Dashboard</p> */}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {mainItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </a>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-2 px-3">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Settings className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">Administração</span>
              {isAdminOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {isAdminOpen && (
            <div className="space-y-1 px-3">
              {adminItems.map((item) => (
                <div key={item.name}>
                  {item.isCollapsible ? (
                    <>
                      <button
                        onClick={item.onToggle}
                        className="flex w-full items-center rounded-md px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {item.isOpen && item.subItems && (
                        <div className="mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              className={cn(
                                "flex items-center rounded-md px-9 py-2 text-sm font-medium transition-colors",
                                pathname === subItem.href
                                  ? "bg-primary text-white"
                                  : "text-gray-600 hover:bg-gray-100",
                              )}
                            >
                              <subItem.icon className="mr-3 h-3 w-3" />
                              {subItem.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md px-6 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <p className="text-center text-xs text-gray-500">Versão: 5.2.1</p>
      </div>
    </div>
  );
}
