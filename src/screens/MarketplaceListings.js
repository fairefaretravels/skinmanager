import { useEffect, useState } from "react";
import { s, T, Card, CardHead, Btn, Badge } from "../ui/tokens";
import { watchListings, publishListings, updateListingStatus } from "../lib/dataService";

const STATUSES = ["available", "sold_out", "unpublished", "expired"];

export default function MarketplaceListings({ cityId, adminUid, grower, draftProducts, setDraftProducts }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [justPublished, setJustPublished] = useState(0);

  useEffect(() => {
    setLoading(true);
    const unsub = watchListings(cityId, (rows) => { setListings(rows); setLoading(false); }, (err) => { setError(err.message); setLoading(false); });
    return unsub;
  }, [cityId]);

  async function handlePublishAll() {
    if (!grower || draftProducts.length === 0) return;
    setPublishing(true);
    setError("");
    try {
      const ids = await publishListings(cityId, adminUid, grower, draftProducts);
      setJustPublished(ids.length);
      setDraftProducts([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function changeStatus(listingId, status) {
    try {
      await updateListingStatus(cityId, listingId, adminUid, status);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div style={s.pageTitle}>Marketplace Listings</div>
      <div style={s.pageSub}>Each product becomes its own listing document — no items[] array — so the public marketplace can claim/update/sell out/unpublish/expire them independently.</div>
      {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 12 }}>{error}</div>}

      {grower && draftProducts.length > 0 && (
        <Card>
          <CardHead title={`Ready to publish — ${grower.farmName}`} />
          <div style={s.cardBody}>
            {draftProducts.map((p, i) => (
              <div key={p._rowId} style={{ fontSize: 13, padding: "6px 0", borderBottom: i < draftProducts.length - 1 ? `1px solid ${T.border}` : "none" }}>
                {p.product} — {p.quantity} {p.unit}
              </div>
            ))}
            <Btn variant="primary" disabled={publishing} onClick={handlePublishAll} style={{ width: "100%", marginTop: 12 }}>
              {publishing ? "Publishing…" : `Publish all (${draftProducts.length} listing${draftProducts.length === 1 ? "" : "s"})`}
            </Btn>
          </div>
        </Card>
      )}

      {justPublished > 0 && draftProducts.length === 0 && (
        <div style={{ fontSize: 12, color: T.greenMid, marginBottom: 12, fontFamily: "'Lato', sans-serif" }}>
          ✓ Published {justPublished} listing{justPublished === 1 ? "" : "s"}.
        </div>
      )}

      <Card>
        <CardHead title={`Live listings (${listings.length})`} />
        <div style={s.cardBody}>
          {loading && <div style={{ fontSize: 13, color: T.muted }}>Loading…</div>}
          {!loading && listings.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>No listings yet.</div>}
          {listings.map((l, i) => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < listings.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{l.product} — {l.quantity} {l.unit}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{l.growerName}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Badge type={l.status}>{l.status?.replace("_", " ")}</Badge>
                <select
                  value={l.status}
                  onChange={(e) => changeStatus(l.id, e.target.value)}
                  style={{ ...s.formInput, width: "auto", padding: "4px 8px", fontSize: 11 }}
                >
                  {STATUSES.map((st) => <option key={st} value={st}>{st.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
