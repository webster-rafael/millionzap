import { useEffect } from "react";
import { toast } from "sonner";

export const useHandleInstagramCode = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;

    (async () => {
      try {
        const response = await fetch(
          "https://back-n8n.omnizap.com.br/webhook-test/4c1139cd-e2e5-4e22-87d5-86f2ca3e6706",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          },
        );

        if (!response.ok) {
          console.error("Erro ao enviar código para o n8n:", response.status);
          toast.error("Falha ao ativar webhook do n8n");
        } else {
          console.log("Webhook do n8n ativado com sucesso!");
          toast.success("Webhook do n8n ativado!");
        }
      } catch (err) {
        console.error("Falha na requisição:", err);
        toast.error("Erro ao ativar webhook do n8n");
      } finally {
        // limpa a URL para não disparar novamente
        const cleanUrl = window.location.href.split("?")[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }
    })();
  }, []);
};
