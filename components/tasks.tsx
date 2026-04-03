'use client';

import { useEffect, useState } from 'react';

type Task = { id: string; title: string; due_at: string | null; status: string };

export function TasksView() {
  const [rows, setRows] = useState<Task[]>([]);

  async function load() {
    const data = await fetch('/api/tasks').then((r) => r.json());
    setRows(data ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function markDone(id: string) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status: 'done' })
    });
    await load();
  }

  return (
    <div className="card">
      <h3>Tasks</h3>
      <table className="table">
        <thead><tr><th>Task</th><th>Due</th><th>Status</th><th /></tr></thead>
        <tbody>
          {rows.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.due_at ? new Date(task.due_at).toLocaleString() : '-'}</td>
              <td>{task.status}</td>
              <td>{task.status !== 'done' && <button className="button secondary" onClick={() => markDone(task.id)}>Done</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
