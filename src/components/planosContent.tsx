import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, CreditCard, Gem, Loader2, Rocket } from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";

export function PlanosContent() {
  const { plans, isLoadingPlans } = useSubscriptionPlans();
  const { user, isLoadingUser } = useAuth();

  const currentSubscription = user?.company?.subscriptions?.[0];
  const currentPlanId = currentSubscription?.plan?.id;
  const startDate = currentSubscription?.startDate
    ? new Date(currentSubscription.startDate)
    : null;

  const endDate = startDate
    ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    : currentSubscription?.endDate
      ? new Date(currentSubscription.endDate)
      : null;

  const daysLeft =
    endDate != null
      ? Math.max(
          0,
          Math.ceil(
            (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : null;

  const isCurrentPlan = (planId: string) => currentPlanId === planId;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const subscriptions = user?.company.subscriptions;
  const paymentStatus = subscriptions?.[0]?.paymentStatus;

  const hasShownToast = useRef(false);
  useEffect(() => {
    if (paymentStatus === "FAILED" && !hasShownToast.current) {
      toast.error(
        "O pagamento do seu plano falhou. Por favor, tente novamente.",
      );
      hasShownToast.current = true;
    } else if (paymentStatus === "PENDING" && !hasShownToast.current) {
      toast.info(
        "O pagamento do seu plano está pendente. Por favor, aguarde a confirmação.",
      );
      hasShownToast.current = true;
    } else if (paymentStatus === "OVERDUE" && !hasShownToast.current) {
      toast.error(
        "O pagamento do seu plano está atrasado. Por favor, regularize sua situação.",
      );
      hasShownToast.current = true;
    }
  }, [paymentStatus]);

  if (isLoadingPlans || isLoadingUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full rounded-lg bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <CreditCard className="text-primary h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Assinatura e Planos
          </h1>
          <p className="text-sm text-gray-500">
            {currentSubscription
              ? `Seu plano atual: ${currentSubscription.plan.name} (${daysLeft} dias restantes)`
              : "Escolha o plano que melhor se adapta às suas necessidades."}
          </p>
        </div>
      </div>

      {isLoadingPlans ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="ml-2 text-gray-600">Carregando planos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 2xl:grid-cols-3">
          {plans.map((plan) => {
            const isDiamond = plan.name.toLowerCase().includes("diamante");

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col shadow-lg transition-transform hover:scale-105 ${
                  isDiamond
                    ? "border-secondary-million border-2 shadow-xl"
                    : "border-2 border-gray-200"
                }`}
              >
                {isDiamond && (
                  <Badge
                    variant="secondary"
                    className="bg-secondary-million absolute -top-3 left-1/2 -translate-x-1/2 transform px-4 py-1 text-sm font-semibold text-white"
                  >
                    MAIS POPULAR
                  </Badge>
                )}

                <CardHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={`text-2xl font-bold ${
                        isDiamond ? "text-secondary-million" : "text-gray-800"
                      }`}
                    >
                      {plan.name}
                    </CardTitle>
                    {isDiamond ? (
                      <Gem className="text-secondary-million h-8 w-8" />
                    ) : (
                      <Rocket className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <CardDescription className="pt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow p-6">
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      /mês
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className={isDiamond ? "font-medium" : ""}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6">
                  <Button
                    onClick={() => {
                      window.location.href = plan.checkoutUrl;
                    }}
                    className={`w-full ${
                      isDiamond
                        ? "bg-secondary-million hover:bg-secondary-million/90 cursor-pointer text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    }`}
                    disabled={
                      isCurrentPlan(plan.id) &&
                      user?.company?.subscriptions[0]?.paymentStatus === "PAID"
                    }
                  >
                    {isCurrentPlan(plan.id) &&
                    user?.company?.subscriptions[0]?.paymentStatus === "PAID"
                      ? "Plano Atual"
                      : isCurrentPlan(plan.id) &&
                          user?.company?.subscriptions[0]?.paymentStatus ===
                            "PENDING"
                        ? "Aguardando pagamento"
                        : isCurrentPlan(plan.id) &&
                            user?.company?.subscriptions[0]?.paymentStatus ===
                              "FAILED"
                          ? "Pagamento recusado - Tentar Novamente"
                          : isCurrentPlan(plan.id) &&
                              user?.company?.subscriptions[0].paymentStatus ===
                                "OVERDUE"
                            ? "Pagamento Atrasado - Regularizar"
                            : isCurrentPlan(plan.id) &&
                                user?.company?.subscriptions[0]?.status ===
                                  "EXPIRED"
                              ? "Plano Expirado - Renovar"
                              : isDiamond
                                ? "Fazer Upgrade"
                                : "Começar Agora"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <Toaster />
    </div>
  );
}
