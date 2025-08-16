import { TarefasContent } from "@/components/tarefas-content";

export default function TarefasPage() {
  return (
    <main className="flex-1 overflow-auto h-dvh pt-20 lg:pt-0">
      <TarefasContent />
    </main>
  );
}
