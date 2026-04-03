'use client';

import { useEffect, useState } from 'react';
import type { DashboardMetrics } from '@/lib/types';

export function DashboardMetricsCard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pipelineValue: 0,
    conversionRate: 0,
    wonDeals: 0,
    lostDeals: 0
  });

  useEffect(() => {
    fetch('/api/dashboard').then((res) => res.json()).then(setMetrics).catch(() => undefined);
  }, []);

  return (
    <div className="grid grid-3">
      <div className="card"><div className="muted">Pipeline Value</div><div className="kpi">${metrics.pipelineValue.toLocaleString()}</div></div>
      <div className="card"><div className="muted">Conversion Rate</div><div className="kpi">{metrics.conversionRate}%</div></div>
      <div className="card"><div className="muted">Won / Lost</div><div className="kpi">{metrics.wonDeals} / {metrics.lostDeals}</div></div>
    </div>
  );
}
