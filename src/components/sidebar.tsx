import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Zap,
  CheckSquare,
  Users,
  // Calendar,
  Tag,
  MessageCircle,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Megaphone,
  List,
  // FileText,
  Bot,
  // Puzzle,
  LinkIcon,
  Archive,
  UsersIcon,
  DollarSign,
  // Cog,
  // Info,
  MessageSquareText,
  AlertTriangle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";

type AdminItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  isCollapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  subItems?: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[];
  showAlert?: boolean;
  paymentStatus?: "FAILED" | "PENDING" | "OVERDUE" | "PAID";
};

export function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  const [isCampanhasOpen, setIsCampanhasOpen] = useState(false);
  const [connectionStatus, setCurrentConnectionStatus] = useState("");

  const { connections } = useWhatsAppConnections();

  const userConnection = connections.find(
    (conn) => conn.companyId === user?.companyId,
  );

  useEffect(() => {
    setCurrentConnectionStatus(userConnection?.status || "CLOSED");
  }, [userConnection?.status, connectionStatus]);

  const subscriptions = user?.company?.subscriptions;
  const paymentStatus = subscriptions?.[0]?.paymentStatus;

  // 🔹 Definir se deve mostrar alerta
  const showPaymentAlert =
    paymentStatus === "FAILED" ||
    paymentStatus === "PENDING" ||
    paymentStatus === "OVERDUE";

  const mainItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Atendimentos", href: "/atendimentos", icon: MessageSquare },
    { name: "Kanban", href: "/kanban", icon: Kanban },
    { name: "Respostas Rápidas", href: "/respostas-rapidas", icon: Zap },
    { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
    { name: "Contatos", href: "/contatos", icon: Users },
    // { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
    { name: "Tags", href: "/tags", icon: Tag },
    // { name: "Chat Interno", href: "/chat-interno", icon: MessageCircle },
    { name: "Ajuda", href: "/ajuda", icon: HelpCircle },
  ];

  const adminItems: AdminItem[] = [
    {
      name: "Campanhas",
      icon: Megaphone,
      isCollapsible: true,
      isOpen: isCampanhasOpen,
      onToggle: () => setIsCampanhasOpen(!isCampanhasOpen),
      subItems: [
        { name: "Listagem", href: "/campanhas", icon: List },
        {
          name: "Disparos",
          href: "/campanhas/disparos",
          icon: MessageSquareText,
        },
        // {
        //   name: "Configurações",
        //   href: "/campanhas/configuracoes",
        //   icon: Settings,
        // },
        // {
        //   name: "Resumos",
        //   href: "/campanhas/informativos",
        //   icon: FileText,
        // },
      ],
    },
    // { name: "Informativos", href: "/informativos", icon: Info },
    { name: "Open AI", href: "/open-ai", icon: Bot },
    // { name: "Integrações", href: "/integracoes", icon: Puzzle },
    { name: "Conexões", href: "/conexoes", icon: LinkIcon },
    { name: "Lista de arquivos", href: "/lista-de-arquivos", icon: Archive },
    { name: "Filas & Chatbot", href: "/filas-chatbot", icon: MessageCircle },
    { name: "Usuários", href: "/usuarios", icon: UsersIcon },
    // { name: "API", href: "/api", icon: Cog },
    {
      name: "Assinatura",
      href: "/planos",
      icon: DollarSign,
      showAlert: showPaymentAlert,
      paymentStatus,
    },
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
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {mainItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </button>
          ))}
        </div>

        {(user?.role === "ADMIN" || user?.role === "OWNER") && (
          <div className="mt-6">
            <div className="mb-2 px-3">
              <button
                onClick={() =>
                  setIsAdminOpen(
                    user?.role !== "ADMIN" && user?.role !== "OWNER",
                  )
                }
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

            <div className="space-y-1 px-3">
              {adminItems.map((item) => {
                const isConnectionButton = item.name === "Conexões";
                const isClosed =
                  isConnectionButton && connectionStatus === "CLOSED";
                const isPending =
                  isConnectionButton && connectionStatus === "PENDING";

                return (
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
                              <button
                                key={subItem.name}
                                onClick={() => navigate(subItem.href)}
                                className={cn(
                                  "flex w-full items-center rounded-md px-9 py-2 text-sm font-medium transition-colors",
                                  pathname === subItem.href
                                    ? "bg-primary w-full text-white"
                                    : "text-gray-600 hover:bg-gray-100",
                                )}
                              >
                                <subItem.icon className="mr-3 h-3 w-3" />
                                {subItem.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(item.href || "")}
                        className={cn(
                          "flex w-full items-center rounded-md px-6 py-2 text-sm font-medium transition-colors",
                          isClosed
                            ? "animate-pulse bg-red-400 text-white hover:bg-red-600"
                            : isPending
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : pathname === item.href
                                ? "bg-primary text-white"
                                : "text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                        {item.name === "Assinatura" && item.showAlert && (
                          <AlertTriangle
                            className={cn(
                              "ml-auto h-5 w-5 animate-pulse",
                              item.paymentStatus === "FAILED"
                                ? "fill-red-500 text-white"
                                : item.paymentStatus === "OVERDUE"
                                  ? "fill-orange-500 text-white"
                                  : "fill-yellow-500 text-white",
                            )}
                          />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <p className="text-center text-xs text-gray-500">Versão: 2.1.2</p>
      </div>
    </div>
  );
}
