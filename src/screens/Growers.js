import { useEffect, useState } from "react";
import { s, T, Card, CardHead, Btn, Badge } from "../ui/tokens";
import { watchGrowers, createGrower, updateGrower } from "../lib/dataService";

const EMPTY_FORM = { name: "", farmName: "", contact: "", address: "" };

export default function Growers({ cityId, adminUid }) {
  const [growers, setGrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = watchGrowers(
      cityId,
      (rows) => { setGrowers(rows); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return unsub;
  }, [cityId]);

  async function handleAdd() {
    if (!form.farmName.trim()) return;
    setSaving(true);
    try {
      await createGrower(cityId, adminUid, form);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(g) {
    try {
      await updateGrower(cityId, g.id, adminUid, { active: !g.active });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div style={s.pageTitle}>Growers</div>
      <div style={s.pageSub}>Farms and growers on record for this city — operator-entered records are labeled.</div>
      {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 12 }}>{error}</div>}

      <Card>
        <CardHead title={`Growers (${growers.length})`} />
        <div style={s.cardBody}>
          {loading && <div style={{ fontSize: 13, color: T.muted }}>Loading…</div>}
          {!loading && growers.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>No growers yet — add one below.</div>}
          {growers.map((g, i) => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < growers.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.green }}>{g.farmName}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>
                  {g.name}{g.contact ? ` · ${g.contact}` : ""}{g.address ? ` · ${g.address}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {g.managedByOperator && <Badge type="operator">Managed by FRESH</Badge>}
                <Badge type={g.active === false ? "unpublished" : "available"}>{g.active === false ? "Inactive" : "Active"}</Badge>
                <Btn onClick={() => toggleActive(g)}>{g.active === false ? "Reactivate" : "Deactivate"}</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Add grower / farm" />
        <div style={s.cardBody}>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Farm name</label>
              <input style={s.formInput} placeholder="e.g. Eastside Community Farm" value={form.farmName} onChange={(e) => setForm((f) => ({ ...f, farmName: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Grower / contact name</label>
              <input style={s.formInput} placeholder="e.g. Marcus J." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Contact (phone or email)</label>
              <input style={s.formInput} placeholder="optional" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Address</label>
              <input style={s.formInput} placeholder="optional" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: T.light, marginBottom: 10, fontFamily: "'Lato', sans-serif" }}>
            This record will be marked <code>managedByOperator: true</code> so it's clear FRESH
            entered it on the grower's behalf, rather than representing the operator as the grower.
          </div>
          <Btn variant="primary" onClick={handleAdd} disabled={saving} style={{ width: "100%" }}>
            {saving ? "Saving…" : "Add grower"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
