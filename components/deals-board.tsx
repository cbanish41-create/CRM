'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Deal } from '@/lib/types';

type Stage = { id: string; name: string };

const defaultStages: Stage[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Prospecting' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Qualified' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Proposal' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Closed' }
];

export function DealsBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);

  async function load() {
    const data = await fetch('/api/deals').then((r) => r.json());
    setDeals(data ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const byStage = useMemo(() => {
    return defaultStages.reduce<Record<string, Deal[]>>((acc, stage) => {
      acc[stage.id] = deals.filter((deal) => deal.stage_id === stage.id);
      return acc;
    }, {});
  }, [deals]);

  async function onDrop(dealId: string, stageId: string) {
    await fetch('/api/deals', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dealId, stage_id: stageId })
    });
    await load();
  }

  return (
    <div className="columns">
      {defaultStages.map((stage) => (
        <div
          key={stage.id}
          className="column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const dealId = e.dataTransfer.getData('text/plain');
            onDrop(dealId, stage.id).catch(() => undefined);
          }}
        >
          <h4>{stage.name}</h4>
          {byStage[stage.id]?.map((deal) => (
            <div key={deal.id} className="deal" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', deal.id)}>
              <strong>{deal.title}</strong>
              <div className="muted">${Number(deal.value).toLocaleString()}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
