import type { SubscriptionPlan } from "@/interfaces/subscriptionPlans-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type CreateSubscriptionPlan = Omit<
  SubscriptionPlan,
  "id" | "createdAt" | "updatedAt"
>;

type SubscriptionPlanUpdatePayload = Partial<CreateSubscriptionPlan> & {
  id: string;
};

const resourceUrl = "/subscription-plans";
const queryKey = ["subscriptionPlans"];

const fetchSubscriptionPlans = (): Promise<SubscriptionPlan[]> =>
  api.get(resourceUrl);

const createSubscriptionPlan = (
  data: CreateSubscriptionPlan,
): Promise<SubscriptionPlan> => api.post(resourceUrl, data);

const updateSubscriptionPlan = (
  data: SubscriptionPlanUpdatePayload,
): Promise<SubscriptionPlan> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteSubscriptionPlan = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useSubscriptionPlans = () => {
  const queryClient = useQueryClient();

  const {
    data: plans = [],
    isLoading: isLoadingPlans,
    isError: isErrorPlans,
  } = useQuery<SubscriptionPlan[]>({
    queryKey,
    queryFn: fetchSubscriptionPlans,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar plano:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateSubscriptionPlan,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar plano:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteSubscriptionPlan,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar plano:", error);
    },
  });

  return {
    plans,
    isLoadingPlans,
    isErrorPlans,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
