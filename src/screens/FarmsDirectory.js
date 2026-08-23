import { useEffect, useState } from "react";
import { s, T, Card, CardHead, Badge, Btn } from "../ui/tokens";
import { watchGrowers } from "../lib/dataService";

export default function FarmsDirectory({ cityId, selectedGrowerId, onSelectGrower, goToAvailability }) {
  const [growers, setGrowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = watchGrowers(cityId, (rows) => { setGrowers(rows); setLoading(false); }, () => setLoading(false));
    return unsub;
  }, [cityId]);

  const active = growers.filter((g) => g.active !== false);

  return (
    <div>
      <div style={s.pageTitle}>Farms Directory</div>
      <div style={s.pageSub}>Pick a farm to enter today's availability for. Manage records on the Growers tab.</div>
      <Card>
        <CardHead title={`Active farms (${active.length})`} />
        <div style={s.cardBody}>
          {loading && <div style={{ fontSize: 13, color: T.muted }}>Loading…</div>}
          {!loading && active.length === 0 && (
            <div style={{ fontSize: 13, color: T.muted }}>
              No active farms in this city yet. Add one on the Growers tab first.
            </div>
          )}
          {active.map((g, i) => (
            <div
              key={g.id}
              onClick={() => onSelectGrower(g)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 10px",
                borderRadius: 8,
                marginBottom: 4,
                background: selectedGrowerId === g.id ? T.greenPale : "transparent",
                border: `1px solid ${selectedGrowerId === g.id ? T.greenBorder : "transparent"}`,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.green }}>{g.farmName}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{g.name}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {g.managedByOperator && <Badge type="operator">Managed by FRESH</Badge>}
                {selectedGrowerId === g.id && (
                  <Btn variant="primary" onClick={(e) => { e.stopPropagation(); goToAvailability(); }}>
                    Enter availability →
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
