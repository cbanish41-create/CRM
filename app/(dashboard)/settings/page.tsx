export default function SettingsPage() {
  return (
    <div className="grid">
      <h1>Settings</h1>
      <div className="card">
        <h3>Customization & Access</h3>
        <ul>
          <li>Custom fields for contacts, companies, deals, and tasks</li>
          <li>Multiple pipelines with custom stages</li>
          <li>Role-based permissions: admin, manager, sales rep</li>
          <li>Webhook endpoints and API keys for integrations</li>
        </ul>
      </div>
    </div>
  );
}
