import { DashboardMetricsCard } from '@/components/dashboard-metrics';

export default function DashboardPage() {
  return (
    <div className="grid">
      <h1>Dashboard</h1>
      <DashboardMetricsCard />
      <div className="card">
        <h3>Sales Snapshot</h3>
        <p className="muted">Track pipeline value, conversion trends, and win/loss outcomes across teams.</p>
      </div>
    </div>
  );
}
