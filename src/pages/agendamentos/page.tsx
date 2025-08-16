import { AgendamentosContent } from "@/components/agendamentos-content";

export default function AgendamentosPage() {
  return (
    <main className="flex-1 overflow-auto h-dvh pt-20 lg:pt-0">
      <AgendamentosContent />
    </main>
  );
}
