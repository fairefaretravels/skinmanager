import { useEffect, useState } from "react";
import { s, T, Card, CardHead, Btn, Badge } from "../ui/tokens";
import { watchAlerts, createAlert, resolveAlert } from "../lib/dataService";

const SEVERITIES = ["info", "warning", "urgent"];

export default function Alerts({ cityId, adminUid }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ message: "", severity: "info" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const unsub = watchAlerts(cityId, (rows) => { setAlerts(rows); setLoading(false); }, (err) => { setError(err.message); setLoading(false); });
    return unsub;
  }, [cityId]);

  async function handleAdd() {
    if (!form.message.trim()) return;
    setSaving(true);
    try {
      await createAlert(cityId, adminUid, form);
      setForm({ message: "", severity: "info" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResolve(id) {
    try {
      await resolveAlert(cityId, id, adminUid);
    } catch (err) {
      setError(err.message);
    }
  }

  const active = alerts.filter((a) => a.active !== false);

  return (
    <div>
      <div style={s.pageTitle}>Alerts</div>
      <div style={s.pageSub}>City-wide notices shown to the public marketplace and growers.</div>
      {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 12 }}>{error}</div>}

      <Card>
        <CardHead title={`Active alerts (${active.length})`} />
        <div style={s.cardBody}>
          {loading && <div style={{ fontSize: 13, color: T.muted }}>Loading…</div>}
          {!loading && active.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>No active alerts.</div>}
          {active.map((a, i) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < active.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge type={a.severity}>{a.severity}</Badge>
                <div style={{ fontSize: 13 }}>{a.message}</div>
              </div>
              <Btn onClick={() => handleResolve(a.id)}>Resolve</Btn>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="New alert" />
        <div style={s.cardBody}>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Message</label>
              <input style={s.formInput} placeholder="e.g. Eastside Farm closed this week" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Severity</label>
              <select style={s.formInput} value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                {SEVERITIES.map((sv) => <option key={sv}>{sv}</option>)}
              </select>
            </div>
          </div>
          <Btn variant="amber" onClick={handleAdd} disabled={saving} style={{ width: "100%" }}>
            {saving ? "Posting…" : "Post alert"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
