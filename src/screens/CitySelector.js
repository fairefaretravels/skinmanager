import { s, T, Card, CardHead } from "../ui/tokens";
import { CITY_LIST } from "../lib/cities";

export default function CitySelector({ activeCity, onSelect }) {
  return (
    <div>
      <div style={s.pageTitle}>Select a City</div>
      <div style={s.pageSub}>Every screen below operates on whichever city is selected here.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {CITY_LIST.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              cursor: "pointer",
              background: "#fff",
              border: `2px solid ${activeCity === c.id ? T.green : T.border}`,
              borderRadius: 10,
              padding: "18px 16px",
            }}
          >
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.green }}>
              {c.label}
            </div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif", marginTop: 6 }}>
              {c.architecture === "legacy"
                ? `Legacy collections: ${c.collections.growers} / ${c.collections.listings} / ${c.collections.alerts}`
                : `Scalable architecture: ${c.basePath}/*`}
            </div>
            {activeCity === c.id && (
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: T.greenMid, fontFamily: "'Lato', sans-serif" }}>
                ✓ Active
              </div>
            )}
          </div>
        ))}
      </div>
      <Card style={{ marginTop: 16 }}>
        <CardHead title="About Lithonia" />
        <div style={s.cardBody}>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "'Lato', sans-serif", lineHeight: 1.6 }}>
            Lithonia is the pilot city for the new city-aware data structure
            (<code>cities/lithonia/…</code>). Detroit and Atlanta stay on their existing
            <code> fd_*</code> / <code>fa_*</code> collections — nothing about their data has moved.
          </div>
        </div>
      </Card>
    </div>
  );
}
