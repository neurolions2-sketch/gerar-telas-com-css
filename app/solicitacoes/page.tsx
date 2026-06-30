import { AppShell } from '@/components/nexlab/app-shell'
import { SolicitacoesView } from '@/components/nexlab/solicitacoes-view'

export default function SolicitacoesPage() {
  return (
    <AppShell crumb="NEXLAB / OPERAÇÃO" title="Solicitações">
      <SolicitacoesView />
    </AppShell>
  )
}
