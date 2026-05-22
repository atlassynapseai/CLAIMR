import { PipelineBoard } from '@/components/pipeline-board';
import { getLeads } from '@/lib/data';

export default async function PipelinePage() {
  const leads = await getLeads();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pipeline</h1>
      <p className="text-sm text-zinc-400">Drag lead cards to update status in a Kanban workflow.</p>
      <PipelineBoard
        initialLeads={leads.map((lead) => ({
          id: lead.id,
          original_owner: lead.original_owner,
          gross_surplus: Number(lead.gross_surplus || 0),
          status: lead.status,
        }))}
      />
    </div>
  );
}
