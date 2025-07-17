import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Edit, Users } from "lucide-react";
import { useState } from "react";

export function FinanceiroContent() {
  const [subscriptionPlan, setSubscriptionPlan] = useState([
    {
      id: "1",
      name: "Plano Básico",
      description: "Plano básico para usuários iniciantes.",
      price: "R$ 19,99",
      createdAt: "2023-01-01",
      status: "Ativo",
    },
    {
      id: "2",
      name: "Plano Padrão",
      description: "Plano padrão para usuários avançados.",
      price: "R$ 39,99",
      createdAt: "2023-02-01",
      status: "Pendente",
    },
  ]);

  return (
    <div className="h-dvh rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionPlan.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{plan.price}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{plan.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <Badge
                            variant={
                              plan.status === "Ativo" ? "default" : "secondary"
                            }
                          >
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{plan.createdAt}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {subscriptionPlan.length === 0 && (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Nenhum usuário encontrado
                </h3>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
