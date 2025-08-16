import { KanbanBoard } from "@/components/kanban-board";

export default function KanbanPage() {
  return (
    <main className="flex-1 overflow-hidden h-dvh pt-20 lg:pt-0">
      <KanbanBoard />
    </main>
  );
}
