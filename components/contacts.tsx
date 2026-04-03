'use client';

import { useEffect, useState } from 'react';
import type { Contact } from '@/lib/types';

export function ContactsView() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', tags: '' });

  async function load() {
    const data = await fetch('/api/contacts').then((r) => r.json());
    setRows(data ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...form,
        lead_status: 'lead',
        tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean)
      })
    });

    setForm({ first_name: '', last_name: '', email: '', tags: '' });
    await load();
  }

  return (
    <div className="grid">
      <form className="card grid" onSubmit={createContact}>
        <h3>Add Contact</h3>
        <div className="row">
          <input className="input" placeholder="First name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />
          <input className="input" placeholder="Last name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
        </div>
        <input className="input" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
        <button className="button" type="submit">Save</button>
      </form>

      <div className="card">
        <h3>Contacts</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.first_name} {row.last_name}</td>
                <td>{row.email}</td>
                <td>{row.lead_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
