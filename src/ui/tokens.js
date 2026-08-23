// Reused visual shell from the original SkinManager (Garden Buddy) app —
// same tokens/components, renamed generically so FRESH MANAGER screens
// can share them without dragging in Garden Buddy's crop/product logic.
export const T = {
  green: "#2D5016",
  greenMid: "#4A7C2F",
  greenLight: "#7AB648",
  greenPale: "#EEF5E6",
  greenBorder: "#C5DDA8",
  soil: "#6B4226",
  soilLight: "#F5EDE4",
  soilBorder: "#D4B89A",
  amber: "#C8820A",
  amberPale: "#FEF3DC",
  red: "#B83232",
  redPale: "#FBEAEA",
  blue: "#1A5FA8",
  bluePale: "#E8F0FB",
  bg: "#F7F5F0",
  surface: "#FFFFFF",
  border: "#E2DDD4",
  text: "#1A1A16",
  muted: "#6B6860",
  light: "#A8A49C",
};

export const s = {
  app: { fontFamily: "'Lora', Georgia, serif", background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", color: T.text },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: T.green, borderBottom: `1px solid ${T.greenMid}` },
  logo: { fontFamily: "'Playfair Display', 'Lora', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" },
  logoAccent: { color: T.greenLight },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  nav: { display: "flex", gap: 2, padding: "10px 24px", background: "#fff", borderBottom: `1px solid ${T.border}`, overflowX: "auto" },
  tab: (active) => ({ padding: "7px 18px", fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: active ? 600 : 400, border: "1px solid transparent", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase", color: active ? "#fff" : T.muted, background: active ? T.green : "transparent", transition: "all .15s" }),
  body: { flex: 1, padding: "20px 24px", overflowY: "auto" },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: T.green, marginBottom: 2 },
  pageSub: { fontSize: 12, color: T.muted, marginBottom: 20, fontFamily: "'Lato', sans-serif" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 },
  statCard: (accent) => ({ background: accent ? T.greenPale : "#fff", border: `1px solid ${accent ? T.greenBorder : T.border}`, borderRadius: 10, padding: "14px 16px", borderLeft: accent ? `3px solid ${T.greenMid}` : `3px solid transparent` }),
  statLabel: { fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif" },
  statVal: (accent) => ({ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: accent ? T.green : T.text, lineHeight: 1 }),
  statSub: { fontSize: 11, color: T.muted, marginTop: 4, fontFamily: "'Lato', sans-serif" },
  card: { background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 12 },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.border}` },
  cardTitle: { fontSize: 13, fontWeight: 600, color: T.green, fontFamily: "'Lato', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" },
  cardBody: { padding: "14px 16px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGroup: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 },
  formLabel: { fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Lato', sans-serif" },
  formInput: { padding: "8px 10px", fontSize: 13, fontFamily: "'Lato', sans-serif", border: `1px solid ${T.border}`, borderRadius: 6, background: "#fff", color: T.text, outline: "none", width: "100%", boxSizing: "border-box" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 },
  btn: (variant) => {
    const variants = {
      primary: { background: T.green, color: "#fff", border: "none" },
      soil: { background: T.soil, color: "#fff", border: "none" },
      ghost: { background: "transparent", color: T.muted, border: `1px solid ${T.border}` },
      amber: { background: T.amber, color: "#fff", border: "none" },
      danger: { background: T.red, color: "#fff", border: "none" },
    };
    return { ...(variants[variant] || variants.ghost), padding: "7px 16px", fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: 600, borderRadius: 6, cursor: "pointer", letterSpacing: "0.03em" };
  },
  badge: (type) => {
    const map = {
      available: { background: T.greenPale, color: T.green, border: `1px solid ${T.greenBorder}` },
      sold_out: { background: T.amberPale, color: T.amber, border: "1px solid #E8C87A" },
      unpublished: { background: "#F1F0EE", color: T.muted, border: `1px solid ${T.border}` },
      expired: { background: T.redPale, color: T.red, border: "1px solid #E8AAAA" },
      urgent: { background: T.redPale, color: T.red, border: "1px solid #E8AAAA" },
      warning: { background: T.amberPale, color: T.amber, border: "1px solid #E8C87A" },
      info: { background: T.bluePale, color: T.blue, border: "1px solid #B5CEED" },
      operator: { background: T.bluePale, color: T.blue, border: "1px solid #B5CEED" },
    };
    const st = map[type] || map.info;
    return { ...st, display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'Lato', sans-serif" };
  },
};

export function Badge({ type, children }) { return <span style={s.badge(type)}>{children}</span>; }
export function Btn({ onClick, variant = "ghost", style: extra, children, disabled, type = "button" }) {
  return <button type={type} disabled={disabled} onClick={onClick} style={{ ...s.btn(variant), ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}), ...extra }}>{children}</button>;
}
export function StatCard({ label, val, sub, accent }) {
  return (
    <div style={s.statCard(accent)}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statVal(accent)}>{val}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}
export function Card({ children, style: extra }) { return <div style={{ ...s.card, ...extra }}>{children}</div>; }
export function CardHead({ title, action }) {
  return <div style={s.cardHead}><div style={s.cardTitle}>{title}</div>{action}</div>;
}
export function GoogleFonts() {
  return <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lora:wght@400;500&family=Lato:wght@400;600;700&display=swap" rel="stylesheet" />;
}
