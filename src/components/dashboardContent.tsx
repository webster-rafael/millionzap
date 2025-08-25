import {
  CalendarIcon,
  Phone,
  Clock,
  CheckCircle,
  UserPlus,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversation";

const chartData = [
  { hour: "01:00", value: 0 },
  { hour: "02:00", value: 0 },
  { hour: "03:00", value: 0 },
  { hour: "04:00", value: 0 },
  { hour: "05:00", value: 0 },
  { hour: "06:00", value: 0 },
  { hour: "07:00", value: 0 },
  { hour: "08:00", value: 0 },
  { hour: "09:00", value: 0 },
  { hour: "10:00", value: 1 },
  { hour: "11:00", value: 0 },
  { hour: "12:00", value: 0 },
  { hour: "13:00", value: 1 },
  { hour: "14:00", value: 0 },
  { hour: "15:00", value: 0 },
  { hour: "16:00", value: 0 },
  { hour: "17:00", value: 0 },
  { hour: "18:00", value: 0 },
  { hour: "19:00", value: 0 },
  { hour: "20:00", value: 0 },
  { hour: "21:00", value: 0 },
  { hour: "22:00", value: 0 },
  { hour: "23:00", value: 0 },
  { hour: "00:00", value: 0 },
];

const userData = [
  { name: "Admin", rating: 3, avgTime: "00h 00m", status: "online" },
  { name: "Webster", rating: 3, avgTime: "00h 00m", status: "offline" },
];

export function DashboardContent() {
  const { user } = useAuth();
  const { conversations } = useConversations();
  // const [startDate, setStartDate] = useState("01/07/2025");
  // const [endDate, setEndDate] = useState("03/07/2025");

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
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hoje
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="hidden lg:block">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo de Filtro
              </label>
              <Select defaultValue="data">
                <SelectTrigger>
                  <SelectValue placeholder="Filtro por Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Filtro por Data</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Selecione o período desejado
              </p>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data Inicial
              </label>
              <Input type="date" value="2025-07-01" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data Final
              </label>
              <Input type="date" value="2025-07-03" />
            </div>
            <Button className="mt-6 bg-[#00183E] hover:bg-[#00183E]/90">
              FILTRAR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Atd. Pendentes</p>
                <p className="text-3xl font-bold">
                  {user?.role === "ADMIN"
                    ? conversations.filter((c) => c.status === "WAITING").length
                    : conversations.filter(
                        (c) =>
                          c.status === "WAITING" &&
                          user?.queues
                            .map((q) => q.queue.id)
                            .includes(c.queueId || ""),
                      ).length}
                </p>
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
                <p className="text-3xl font-bold">
                  {user?.role === "ADMIN"
                    ? conversations.filter((c) => c.status === "SERVING").length
                    : conversations.filter(
                        (c) =>
                          c.status === "SERVING" &&
                          user?.queues
                            .map((q) => q.queue.id)
                            .includes(c.queueId || ""),
                      ).length}
                </p>
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
                <p className="text-3xl font-bold">
                  {conversations.filter((c) => c.status === "RESOLVED").length}
                </p>
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
                <p className="text-3xl font-bold">9</p>
              </div>
              <UserPlus className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">T.M. de Atendimento</p>
                <p className="text-3xl font-bold">00h 00m</p>
              </div>
              <Clock className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#00183E] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">T.M. de Espera</p>
                <p className="text-3xl font-bold">00h 00m</p>
              </div>
              <Clock className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Atendimentos Abertos Hoje: 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 4]}
                />
                <Bar dataKey="value" fill="#00183E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Second Filter Section */}
      <Card className="hidden lg:block">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo de Filtro
              </label>
              <Select defaultValue="data">
                <SelectTrigger>
                  <SelectValue placeholder="Filtro por Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Filtro por Data</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Selecione o período desejado
              </p>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data Inicial
              </label>
              <Input type="date" value="2025-07-01" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data Final
              </label>
              <Input type="date" value="2025-07-03" />
            </div>
            <Button className="mt-6 bg-[#00183E] hover:bg-[#00183E]/90">
              FILTRAR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Performance Table */}
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Avaliações</TableHead>
                <TableHead>T.M de Atendimento</TableHead>
                <TableHead>Status (Atual)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-4 w-4 rounded-full ${
                            i < user.rating ? "bg-yellow-400" : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{user.avgTime}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "online" ? "default" : "destructive"
                      }
                      className={
                        user.status === "online"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {user.status === "online" ? "●" : "●"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
