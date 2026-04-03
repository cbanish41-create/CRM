'use client';

import { useEffect, useState } from 'react';

type Rule = { id: string; name: string; trigger_type: string; is_active: boolean };

export function AutomationRules() {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    fetch('/api/workflows').then((r) => r.json()).then(setRules).catch(() => undefined);
  }, []);

  return (
    <div className="card">
      <h3>Workflow Rules</h3>
      <table className="table">
        <thead><tr><th>Name</th><th>Trigger</th><th>Status</th></tr></thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id}><td>{r.name}</td><td>{r.trigger_type}</td><td>{r.is_active ? 'Active' : 'Paused'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
