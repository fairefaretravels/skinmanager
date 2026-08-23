import { useState } from "react";
import { s, T, Card, CardHead, Btn } from "../ui/tokens";

const UNITS = ["lbs", "bunches", "heads", "bags", "dozen", "pints", "each"];
let rowId = 1;

export default function TodaysAvailability({ cityId, grower, draftProducts, setDraftProducts, goToListings }) {
  const [row, setRow] = useState({ product: "", quantity: "", unit: "lbs" });

  function addRow() {
    if (!row.product.trim() || !row.quantity) return;
    setDraftProducts((rows) => [...rows, { ...row, _rowId: rowId++ }]);
    setRow({ product: "", quantity: "", unit: row.unit });
  }

  function removeRow(id) {
    setDraftProducts((rows) => rows.filter((r) => r._rowId !== id));
  }

  if (!grower) {
    return (
      <div>
        <div style={s.pageTitle}>Today's Availability</div>
        <div style={s.pageSub}>Select a farm on the Farms Directory tab first.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={s.pageTitle}>Today's Availability</div>
      <div style={s.pageSub}>{grower.farmName} — enter each product separately, then publish as individual listings.</div>

      <Card>
        <CardHead title="Products for today" />
        <div style={s.cardBody}>
          {draftProducts.length === 0 && <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>Nothing added yet.</div>}
          {draftProducts.map((p, i) => (
            <div key={p._rowId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < draftProducts.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontSize: 13 }}>
                <strong>{p.product}</strong> — {p.quantity} {p.unit}
              </div>
              <button onClick={() => removeRow(p._rowId)} style={{ background: "none", border: "none", cursor: "pointer", color: T.light, fontSize: 16 }}>×</button>
            </div>
          ))}

          <div style={{ ...s.formRow, marginTop: draftProducts.length ? 14 : 0 }}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Product</label>
              <input style={s.formInput} placeholder="e.g. Tomatoes" value={row.product} onChange={(e) => setRow((r) => ({ ...r, product: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Quantity</label>
              <input style={s.formInput} type="number" min="0" placeholder="40" value={row.quantity} onChange={(e) => setRow((r) => ({ ...r, quantity: e.target.value }))} />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Unit</label>
              <select style={s.formInput} value={row.unit} onChange={(e) => setRow((r) => ({ ...r, unit: e.target.value }))}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Btn variant="soil" onClick={addRow} style={{ width: "100%" }}>+ Add product</Btn>
            </div>
          </div>
        </div>
      </Card>

      <Btn variant="primary" disabled={draftProducts.length === 0} onClick={goToListings} style={{ width: "100%" }}>
        Continue to Marketplace Listings ({draftProducts.length} product{draftProducts.length === 1 ? "" : "s"}) →
      </Btn>
    </div>
  );
}
