import { useMemo } from "react";
import {
  Calendar,
  Phone,
  CheckCircle,
  UserPlus,
  Timer,
  LogOut,
  Users,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversation";
import { useContacts } from "@/hooks/useContacts";

export function DashboardContent() {
  const { user, logoutUser } = useAuth();
  const { conversations } = useConversations();
  const { contacts } = useContacts();

  // Filtra conversas baseado no role do usuário
  const filteredConversations = useMemo(() => {
    if (user?.role === "ADMIN") {
      return conversations;
    }
    const userQueueIds = user?.queues.map((q) => q.queue.id) || [];
    return conversations.filter(
      (c) => c.queueId && userQueueIds.includes(c.queueId),
    );
  }, [conversations, user]);

  const metrics = useMemo(() => {
    const waiting = filteredConversations.filter(
      (c) => c.status === "WAITING",
    ).length;
    const serving = filteredConversations.filter(
      (c) => c.status === "SERVING",
    ).length;
    const resolved = filteredConversations.filter(
      (c) => c.status === "RESOLVED",
    ).length;

    return { waiting, serving, resolved };
  }, [filteredConversations]);

  const leadsChartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leadContacts = contacts.filter((contact) =>
      contact.tags?.includes("LEADS"),
    );

    const todayLeadConversations = conversations.filter((conv) => {
      const convDate = new Date(conv.createdAt);
      convDate.setHours(0, 0, 0, 0);

      const isLeadContact = leadContacts.some(
        (lead) =>
          lead.phone === conv.contact?.phone || lead.id === conv.contactId,
      );

      return convDate.getTime() === today.getTime() && isLeadContact;
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      leads: 0,
      total: 0,
    }));

    todayLeadConversations.forEach((conv) => {
      const hour = new Date(conv.createdAt).getHours();
      hourlyData[hour].leads += 1;
    });

    const todayAllConversations = conversations.filter((conv) => {
      const convDate = new Date(conv.createdAt);
      convDate.setHours(0, 0, 0, 0);
      return convDate.getTime() === today.getTime();
    });

    todayAllConversations.forEach((conv) => {
      const hour = new Date(conv.createdAt).getHours();
      hourlyData[hour].total += 1;
    });

    return hourlyData;
  }, [contacts, conversations]);

  const contactMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newContactsToday = contacts.filter((contact) => {
      const contactDate = new Date(contact.createdAt);
      contactDate.setHours(0, 0, 0, 0);
      return contactDate.getTime() === today.getTime();
    }).length;

    const totalLeads = contacts.filter((contact) =>
      contact.tags?.includes("LEADS"),
    );

    const convertedCustomers = totalLeads.filter(
      (lead) => lead.isCustomer === true,
    ).length;

    return {
      newContactsToday,
      totalLeads: totalLeads.length,
      customers: convertedCustomers,
    };
  }, [contacts]);

  const totalLeadsToday = leadsChartData.reduce(
    (sum, item) => sum + item.leads,
    0,
  );

  return (
    <main className="space-y-6 p-6 pt-24 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-600 lg:text-base">
            Olá {user?.role === "USER" ? user?.name : "ADMIN"}, Bem vindo à{" "}
            {user?.companyName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Hoje
          </Button>
          <Button
            onClick={() => logoutUser()}
            className="bg-secondary-million"
            size="sm"
          >
            Sair
            <LogOut className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas de Conversas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Atd. Pendentes</p>
                <p className="text-3xl font-bold">{metrics.waiting}</p>
              </div>
              <Phone className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Atd. Acontecendo</p>
                <p className="text-3xl font-bold">{metrics.serving}</p>
              </div>
              <Timer className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Finalizados</p>
                <p className="text-3xl font-bold">{metrics.resolved}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Novos Contatos</p>
                <p className="text-3xl font-bold">
                  {contactMetrics.newContactsToday}
                </p>
              </div>
              <UserPlus className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Total de Leads</p>
                <p className="text-3xl font-bold">
                  {contactMetrics.totalLeads}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Clientes</p>
                <p className="text-3xl font-bold">{contactMetrics.customers}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            <div className="flex items-center justify-between">
              <span>Mensagens de Leads Hoje: {totalLeadsToday}</span>
              <Badge variant="outline" className="ml-2">
                <MessageSquare className="mr-1 h-3 w-3" />
                Atualizado em tempo real
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="leads"
                  fill="#00183E"
                  radius={[4, 4, 0, 0]}
                  name="Leads"
                />
                <Bar
                  dataKey="total"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                  name="Total"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Contatos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de Contatos</span>
                <span className="text-2xl font-bold">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Leads</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {contactMetrics.totalLeads}
                  </span>
                  <Badge className="bg-blue-500">
                    {(
                      (contactMetrics.totalLeads / contacts.length) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clientes</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {contactMetrics.customers}
                  </span>
                  <Badge className="bg-green-500">
                    {(
                      (contactMetrics.customers / contacts.length) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const rawRate =
                contactMetrics.totalLeads > 0
                  ? (contactMetrics.customers / contactMetrics.totalLeads) * 100
                  : 0;

              const cappedRate = Math.min(rawRate, 100);

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Leads → Clientes
                    </span>
                    <span className="text-2xl font-bold">
                      {cappedRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                      style={{
                        width: `${cappedRate}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {contactMetrics.customers} de {contactMetrics.totalLeads}{" "}
                    leads convertidos
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
