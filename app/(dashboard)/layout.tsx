import Link from 'next/link';

const links = [
  ['Dashboard', '/dashboard'],
  ['Contacts', '/contacts'],
  ['Companies', '/companies'],
  ['Deals', '/deals'],
  ['Tasks', '/tasks'],
  ['Automations', '/automations'],
  ['Settings', '/settings']
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>CRM SaaS</h2>
        <p className="muted">Sales workspace</p>
        <nav>
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
