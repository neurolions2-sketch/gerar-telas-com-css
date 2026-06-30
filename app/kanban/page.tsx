import { AppShell } from '@/components/nexlab/app-shell'
import { KanbanView } from '@/components/nexlab/kanban-view'

export default function KanbanPage() {
  return (
    <AppShell crumb="NEXLAB / OPERAÇÃO" title="Quadro Kanban">
      <KanbanView />
    </AppShell>
  )
}
