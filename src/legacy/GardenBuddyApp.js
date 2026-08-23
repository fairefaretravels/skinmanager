import { useState, useEffect } from "react";

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
const INIT_CROPS = [
  { id: 1, name: "Lavender", type: "Herb", bed: "Bed A", planted: "2025-03-10", harvest: "2025-07-01", status: "growing", yield: 12, unit: "lbs", notes: "Pruned last week" },
  { id: 2, name: "Sunflower", type: "Flower", bed: "Bed B", planted: "2025-04-01", harvest: "2025-08-15", status: "growing", yield: 40, unit: "heads", notes: "Giant variety" },
  { id: 3, name: "Tomato", type: "Vegetable", bed: "Bed C", planted: "2025-03-20", harvest: "2025-07-10", status: "ready", yield: 30, unit: "lbs", notes: "Heirloom mix" },
  { id: 4, name: "Chamomile", type: "Herb", bed: "Bed A", planted: "2025-02-15", harvest: "2025-06-01", status: "harvested", yield: 8, unit: "lbs", notes: "Second flush coming" },
  { id: 5, name: "Rosemary", type: "Herb", bed: "Bed D", planted: "2024-10-01", harvest: "2025-06-15", status: "ready", yield: 6, unit: "lbs", notes: "Perennial — established" },
  { id: 6, name: "Pumpkin", type: "Vegetable", bed: "Bed E", planted: "2025-05-01", harvest: "2025-10-01", status: "seedling", yield: 20, unit: "pcs", notes: "Sugar pie variety" },
];

const INIT_PRODUCTS = [
  { id: 1, name: "Lavender Essential Oil", crop: "Lavender", category: "Wellness", price: 28, stock: 24, unit: "30ml bottle", cropLbs: 5, status: "active" },
  { id: 2, name: "Dried Lavender Bundles", crop: "Lavender", category: "Home", price: 12, stock: 60, unit: "bundle", cropLbs: 0.5, status: "active" },
  { id: 3, name: "Chamomile Tea Blend", crop: "Chamomile", category: "Food", price: 16, stock: 30, unit: "3oz bag", cropLbs: 1, status: "active" },
  { id: 4, name: "Heirloom Tomato Sauce", crop: "Tomato", category: "Food", price: 10, stock: 48, unit: "jar", cropLbs: 2, status: "active" },
  { id: 5, name: "Rosemary Salt", crop: "Rosemary", category: "Food", price: 9, stock: 36, unit: "4oz jar", cropLbs: 0.25, status: "active" },
  { id: 6, name: "Sunflower Seed Mix", crop: "Sunflower", category: "Food", price: 7, stock: 20, unit: "bag", cropLbs: 0, status: "low" },
  { id: 7, name: "Pumpkin Spice Preserve", crop: "Pumpkin", category: "Food", price: 14, stock: 0, unit: "jar", cropLbs: 3, status: "pending" },
];

const INIT_TASKS = [
  { id: 1, task: "Water Bed C tomatoes", bed: "Bed C", due: "2025-06-07", priority: "high", done: false },
  { id: 2, task: "Harvest rosemary (Bed D)", bed: "Bed D", due: "2025-06-08", priority: "high", done: false },
  { id: 3, task: "Apply compost to Bed E", bed: "Bed E", due: "2025-06-09", priority: "medium", done: false },
  { id: 4, task: "Thin sunflower seedlings", bed: "Bed B", due: "2025-06-10", priority: "low", done: true },
  { id: 5, task: "Order new seed stock", bed: "—", due: "2025-06-12", priority: "medium", done: false },
];

const INIT_DRIVE_LINKS = [
  { id: 1, name: "2025 Yield Forecast", type: "sheet", url: "https://docs.google.com/spreadsheets/d/example1", crop: "All", updated: "Jun 3, 2025" },
  { id: 2, name: "Lavender Harvest Log", type: "sheet", url: "https://docs.google.com/spreadsheets/d/example2", crop: "Lavender", updated: "May 28, 2025" },
  { id: 3, name: "Product Sales Report Q2", type: "sheet", url: "https://docs.google.com/spreadsheets/d/example3", crop: "All", updated: "Jun 1, 2025" },
  { id: 4, name: "Garden Layout Plan", type: "doc", url: "https://docs.google.com/document/d/example4", crop: "All", updated: "Apr 15, 2025" },
  { id: 5, name: "Chamomile Processing Notes", type: "doc", url: "https://docs.google.com/document/d/example5", crop: "Chamomile", updated: "May 10, 2025" },
  { id: 6, name: "Crop Rotation Schedule", type: "slide", url: "https://docs.google.com/presentation/d/example6", crop: "All", updated: "Mar 20, 2025" },
];

// ── Chart Data ────────────────────────────────────────────────────────────────
const MONTHLY_YIELD = [
  { month: "Jan", lbs: 2 }, { month: "Feb", lbs: 4 }, { month: "Mar", lbs: 9 },
  { month: "Apr", lbs: 14 }, { month: "May", lbs: 22 }, { month: "Jun", lbs: 31 },
  { month: "Jul", lbs: 38 }, { month: "Aug", lbs: 42 }, { month: "Sep", lbs: 35 },
  { month: "Oct", lbs: 18 }, { month: "Nov", lbs: 8 }, { month: "Dec", lbs: 3 },
];
const CROP_REVENUE = [
  { crop: "Lavender", rev: 1120 }, { crop: "Chamomile", rev: 480 },
  { crop: "Tomato", rev: 480 }, { crop: "Rosemary", rev: 324 },
  { crop: "Sunflower", rev: 140 }, { crop: "Pumpkin", rev: 0 },
];

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
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

const s = {
  app: { fontFamily: "'Lora', Georgia, serif", background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", color: T.text },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: T.green, borderBottom: `1px solid ${T.greenMid}` },
  logo: { fontFamily: "'Playfair Display', 'Lora', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" },
  logoAccent: { color: T.greenLight },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerStat: { textAlign: "right" },
  headerStatVal: { fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" },
  headerStatLabel: { fontSize: 10, color: T.greenLight, textTransform: "uppercase", letterSpacing: "0.06em" },
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
  threeCol: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
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
    };
    return { ...(variants[variant] || variants.ghost), padding: "7px 16px", fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: 600, borderRadius: 6, cursor: "pointer", letterSpacing: "0.03em" };
  },
  badge: (type) => {
    const map = {
      growing: { background: T.greenPale, color: T.greenMid, border: `1px solid ${T.greenBorder}` },
      ready: { background: "#FEF9E8", color: "#7A6200", border: "1px solid #E8D87A" },
      harvested: { background: T.soilLight, color: T.soil, border: `1px solid ${T.soilBorder}` },
      seedling: { background: T.bluePale, color: T.blue, border: "1px solid #B5CEED" },
      active: { background: T.greenPale, color: T.green, border: `1px solid ${T.greenBorder}` },
      low: { background: T.amberPale, color: T.amber, border: "1px solid #E8C87A" },
      pending: { background: "#F1F0EE", color: T.muted, border: `1px solid ${T.border}` },
      high: { background: T.redPale, color: T.red, border: "1px solid #E8AAAA" },
      medium: { background: T.amberPale, color: T.amber, border: "1px solid #E8C87A" },
      low2: { background: T.greenPale, color: T.greenMid, border: `1px solid ${T.greenBorder}` },
      sheet: { background: "#E8F5E9", color: "#1B5E20", border: "1px solid #A5D6A7" },
      doc: { background: T.bluePale, color: T.blue, border: "1px solid #B5CEED" },
      slide: { background: T.amberPale, color: T.amber, border: "1px solid #E8C87A" },
    };
    const st = map[type] || map.pending;
    return { ...st, display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'Lato', sans-serif" };
  },
};

function Badge({ type, children }) { return <span style={s.badge(type)}>{children}</span>; }
function Btn({ onClick, variant = "ghost", style: extra, children }) {
  return <button onClick={onClick} style={{ ...s.btn(variant), ...extra }}>{children}</button>;
}
function StatCard({ label, val, sub, accent }) {
  return (
    <div style={s.statCard(accent)}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statVal(accent)}>{val}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}
function Card({ children, style: extra }) { return <div style={{ ...s.card, ...extra }}>{children}</div>; }
function CardHead({ title, action }) {
  return <div style={s.cardHead}><div style={s.cardTitle}>{title}</div>{action}</div>;
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, xKey, yKey, color = T.greenMid, height = 120, label = "" }) {
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, fontFamily: "'Lato', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
        {data.map((d, i) => {
          const pct = max > 0 ? (d[yKey] / max) * 100 : 0;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                <div title={`${d[xKey]}: ${d[yKey]}`} style={{ width: "100%", height: `${Math.max(pct, 2)}%`, background: color, borderRadius: "3px 3px 0 0", transition: "height .3s ease" }} />
              </div>
              <div style={{ fontSize: 9, color: T.light, fontFamily: "'Lato', sans-serif", textAlign: "center" }}>{d[xKey]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizBarChart({ data, xKey, yKey, color = T.greenMid }) {
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => {
        const pct = max > 0 ? (d[yKey] / max) * 100 : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, color: T.text, minWidth: 80, fontFamily: "'Lato', sans-serif" }}>{d[xKey]}</div>
            <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 4 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: i === 0 ? T.greenMid : i === 1 ? T.greenLight : T.amber, borderRadius: 4, transition: "width .4s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: T.muted, minWidth: 50, textAlign: "right", fontFamily: "'Lato', sans-serif" }}>${d[yKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function Overview({ crops, products, tasks, driveLinks, switchTab }) {
  const readyCrops = crops.filter(c => c.status === "ready");
  const lowProducts = products.filter(p => p.status === "low" || p.stock === 0);
  const todayTasks = tasks.filter(t => !t.done).slice(0, 4);

  return (
    <div>
      <div style={s.pageTitle}>Garden Dashboard</div>
      <div style={s.pageSub}>Your farm at a glance — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
      <div style={s.statRow}>
        <StatCard label="Active crops" val={crops.filter(c => c.status !== "harvested").length} sub={`${readyCrops.length} ready to harvest`} accent />
        <StatCard label="Products" val={products.length} sub={`${lowProducts.length} need restocking`} />
        <StatCard label="Est. revenue" val="$2,544" sub="From current stock" />
        <StatCard label="Pending tasks" val={tasks.filter(t => !t.done).length} sub="This week" />
      </div>

      <div style={s.twoCol}>
        <Card>
          <CardHead title="Yield this year (lbs)" action={<Btn onClick={() => switchTab("charts")}>Full charts</Btn>} />
          <div style={s.cardBody}>
            <BarChart data={MONTHLY_YIELD} xKey="month" yKey="lbs" height={110} />
          </div>
        </Card>
        <Card>
          <CardHead title="Revenue by crop" action={<Btn onClick={() => switchTab("charts")}>Details</Btn>} />
          <div style={s.cardBody}>
            <HorizBarChart data={CROP_REVENUE} xKey="crop" yKey="rev" />
          </div>
        </Card>
      </div>

      <div style={s.twoCol}>
        <Card>
          <CardHead title="Ready to harvest" action={<Btn onClick={() => switchTab("crops")}>All crops</Btn>} />
          <div style={s.cardBody}>
            {readyCrops.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>No crops ready right now.</div>}
            {readyCrops.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < readyCrops.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{c.bed} · {c.yield} {c.unit} expected</div>
                </div>
                <Badge type="ready">Ready</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Today's tasks" action={<Btn onClick={() => switchTab("tasks")}>All tasks</Btn>} />
          <div style={s.cardBody}>
            {todayTasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < todayTasks.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.priority === "high" ? T.red : t.priority === "medium" ? T.amber : T.greenLight, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13 }}>{t.task}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{t.due}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Recent Google Drive files" action={<Btn onClick={() => switchTab("drive")}>All files</Btn>} />
        <div style={{ ...s.cardBody, display: "flex", flexDirection: "column", gap: 8 }}>
          {driveLinks.slice(0, 3).map((link, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 18 }}>{link.type === "sheet" ? "📊" : link.type === "doc" ? "📄" : "📑"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{link.name}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{link.crop} · Updated {link.updated}</div>
              </div>
              <Badge type={link.type}>{link.type}</Badge>
              <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.blue, fontFamily: "'Lato', sans-serif", textDecoration: "none", fontWeight: 600 }}>Open →</a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Crops Tab ─────────────────────────────────────────────────────────────────
function Crops({ crops, setCrops }) {
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ name: "", type: "Herb", bed: "Bed A", planted: "", harvest: "", yield: "", unit: "lbs", notes: "", status: "seedling" });

  function add() {
    if (!form.name.trim()) return;
    setCrops(cs => [...cs, { ...form, id: Date.now(), yield: parseFloat(form.yield) || 0 }]);
    setForm({ name: "", type: "Herb", bed: "Bed A", planted: "", harvest: "", yield: "", unit: "lbs", notes: "", status: "seedling" });
  }

  function updateStatus(id, status) {
    setCrops(cs => cs.map(c => c.id === id ? { ...c, status } : c));
  }

  const filtered = crops.filter(c => filter === "all" ? true : c.status === filter);
  const STATUS_CYCLE = ["seedling", "growing", "ready", "harvested"];

  return (
    <div>
      <div style={s.pageTitle}>Crops</div>
      <div style={s.pageSub}>Track planting, growth, and harvest schedules</div>
      <div style={s.statRow}>
        <StatCard label="Seedlings" val={crops.filter(c => c.status === "seedling").length} sub="Just planted" />
        <StatCard label="Growing" val={crops.filter(c => c.status === "growing").length} sub="In progress" accent />
        <StatCard label="Ready" val={crops.filter(c => c.status === "ready").length} sub="Harvest now" />
        <StatCard label="Harvested" val={crops.filter(c => c.status === "harvested").length} sub="This season" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["all","seedling","growing","ready","harvested"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...s.btn(filter === f ? "primary" : "ghost"), fontSize: 11 }}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px", borderTop: `3px solid ${c.status === "ready" ? T.amber : c.status === "harvested" ? T.soil : c.status === "seedling" ? T.blue : T.greenMid}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.green }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{c.type} · {c.bed}</div>
              </div>
              <Badge type={c.status}>{c.status}</Badge>
            </div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: "'Lato', sans-serif", marginBottom: 10, lineHeight: 1.7 }}>
              <div>Planted: {c.planted || "—"}</div>
              <div>Harvest by: {c.harvest || "—"}</div>
              <div>Expected: {c.yield} {c.unit}</div>
              {c.notes && <div style={{ color: T.soil, marginTop: 4 }}>📝 {c.notes}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {STATUS_CYCLE.filter(st => st !== c.status).map(st => (
                <button key={st} onClick={() => updateStatus(c.id, st)} style={{ ...s.btn("ghost"), fontSize: 10, padding: "3px 8px" }}>→ {st}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHead title="Add new crop" />
        <div style={s.cardBody}>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Crop name</label><input style={s.formInput} placeholder="e.g. Basil" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>Type</label>
              <select style={s.formInput} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["Herb","Vegetable","Flower","Fruit","Tree"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Bed / Location</label><input style={s.formInput} placeholder="Bed A" value={form.bed} onChange={e => setForm(f => ({ ...f, bed: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>Status</label>
              <select style={s.formInput} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["seedling","growing","ready","harvested"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Planted date</label><input style={s.formInput} type="date" value={form.planted} onChange={e => setForm(f => ({ ...f, planted: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>Harvest date</label><input style={s.formInput} type="date" value={form.harvest} onChange={e => setForm(f => ({ ...f, harvest: e.target.value }))} /></div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Expected yield</label><input style={s.formInput} type="number" placeholder="20" value={form.yield} onChange={e => setForm(f => ({ ...f, yield: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>Unit</label>
              <select style={s.formInput} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                {["lbs","kg","heads","pcs","bundles","oz"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formGroup}><label style={s.formLabel}>Notes</label><input style={s.formInput} placeholder="Variety, conditions, special care..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <Btn variant="primary" onClick={add} style={{ width: "100%", marginTop: 4 }}>Add crop</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function Products({ products, setProducts, crops }) {
  const [form, setForm] = useState({ name: "", crop: crops[0]?.name || "", category: "Food", price: "", stock: "", unit: "jar", cropLbs: "", status: "active" });

  function adjustStock(id, d) { setProducts(ps => ps.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + d) } : p)); }
  function add() {
    if (!form.name.trim()) return;
    setProducts(ps => [...ps, { ...form, id: Date.now(), price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0, cropLbs: parseFloat(form.cropLbs) || 0 }]);
    setForm({ name: "", crop: crops[0]?.name || "", category: "Food", price: "", stock: "", unit: "jar", cropLbs: "", status: "active" });
  }

  const totalRev = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div>
      <div style={s.pageTitle}>Crop Products</div>
      <div style={s.pageSub}>Items made from your harvests — stock, pricing, and crop usage</div>
      <div style={s.statRow}>
        <StatCard label="Products" val={products.length} sub={`${products.filter(p => p.status === "active").length} active`} accent />
        <StatCard label="Total inventory value" val={`$${totalRev.toLocaleString()}`} sub="At retail price" />
        <StatCard label="Low / out of stock" val={products.filter(p => p.stock < 5).length} sub="Need attention" />
        <StatCard label="Crop types used" val={[...new Set(products.map(p => p.crop))].length} sub="Unique crops" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {products.map((p) => {
          const badgeType = p.stock === 0 ? "pending" : p.stock < 8 ? "low" : "active";
          return (
            <div key={p.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.green }}>${p.price}</div>
              </div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif", marginBottom: 10 }}>
                <span style={{ background: T.greenPale, color: T.green, padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 600, marginRight: 6 }}>{p.crop}</span>
                {p.category} · {p.unit}
                {p.cropLbs > 0 && <span style={{ marginLeft: 6 }}>· {p.cropLbs} lbs/unit</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Badge type={badgeType}>{p.stock === 0 ? "Out of stock" : p.stock < 8 ? `Low — ${p.stock} left` : `${p.stock} in stock`}</Badge>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <button onClick={() => adjustStock(p.id, -1)} style={{ ...s.btn("ghost"), padding: "2px 8px", fontSize: 13 }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 28, textAlign: "center" }}>{p.stock}</span>
                  <button onClick={() => adjustStock(p.id, 1)} style={{ ...s.btn("ghost"), padding: "2px 8px", fontSize: 13 }}>+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHead title="Add product" />
        <div style={s.cardBody}>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Product name</label><input style={s.formInput} placeholder="e.g. Rosemary Olive Oil" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>Source crop</label>
              <select style={s.formInput} value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}>
                {[...new Set(crops.map(c => c.name))].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Category</label>
              <select style={s.formInput} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {["Food","Wellness","Home","Beauty","Gift"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.formGroup}><label style={s.formLabel}>Unit label</label><input style={s.formInput} placeholder="jar, bottle, bag..." value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Price ($)</label><input style={s.formInput} type="number" placeholder="14" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>Stock count</label><input style={s.formInput} type="number" placeholder="30" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
          </div>
          <div style={s.formGroup}><label style={s.formLabel}>Crop lbs per unit</label><input style={s.formInput} type="number" placeholder="0.5" value={form.cropLbs} onChange={e => setForm(f => ({ ...f, cropLbs: e.target.value }))} /></div>
          <Btn variant="soil" onClick={add} style={{ width: "100%", marginTop: 4 }}>Add product</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────────────────────
function Tasks({ tasks, setTasks }) {
  const [form, setForm] = useState({ task: "", bed: "", due: "", priority: "medium" });

  function toggle(id) { setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function add() {
    if (!form.task.trim()) return;
    setTasks(ts => [...ts, { ...form, id: Date.now(), done: false }]);
    setForm({ task: "", bed: "", due: "", priority: "medium" });
  }
  function remove(id) { setTasks(ts => ts.filter(t => t.id !== id)); }

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <div>
      <div style={s.pageTitle}>Garden Tasks</div>
      <div style={s.pageSub}>Daily and weekly garden management checklist</div>
      <div style={s.twoCol}>
        <Card>
          <CardHead title={`Pending (${pending.length})`} />
          <div style={s.cardBody}>
            {pending.length === 0 && <div style={{ fontSize: 13, color: T.muted }}>All done! 🌿</div>}
            {pending.map((t, i) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < pending.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <input type="checkbox" checked={false} onChange={() => toggle(t.id)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: T.green }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.task}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontFamily: "'Lato', sans-serif" }}>{t.bed !== "—" ? t.bed + " · " : ""}{t.due}</div>
                </div>
                <Badge type={t.priority === "high" ? "high" : t.priority === "medium" ? "medium" : "low2"}>{t.priority}</Badge>
                <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.light, fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Add task" />
          <div style={s.cardBody}>
            <div style={s.formGroup}><label style={s.formLabel}>Task description</label><input style={s.formInput} placeholder="e.g. Prune Bed A lavender" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} /></div>
            <div style={s.formRow}>
              <div style={s.formGroup}><label style={s.formLabel}>Bed / Location</label><input style={s.formInput} placeholder="Bed A" value={form.bed} onChange={e => setForm(f => ({ ...f, bed: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.formLabel}>Due date</label><input style={s.formInput} type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} /></div>
            </div>
            <div style={s.formGroup}><label style={s.formLabel}>Priority</label>
              <select style={s.formInput} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <Btn variant="primary" onClick={add} style={{ width: "100%", marginTop: 4 }}>Add task</Btn>
          </div>
        </Card>
      </div>
      {done.length > 0 && (
        <Card style={{ marginTop: 4 }}>
          <CardHead title={`Completed (${done.length})`} />
          <div style={s.cardBody}>
            {done.map((t, i) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < done.length - 1 ? `1px solid ${T.border}` : "none", opacity: 0.55 }}>
                <input type="checkbox" checked onChange={() => toggle(t.id)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: T.green }} />
                <div style={{ flex: 1, textDecoration: "line-through", fontSize: 13, color: T.muted }}>{t.task}</div>
                <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.light, fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Charts Tab ────────────────────────────────────────────────────────────────
function Charts({ crops, products }) {
  const cropYields = crops.map(c => ({ crop: c.name, lbs: c.yield }));
  const productsByCategory = Object.entries(
    products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {})
  ).map(([cat, count]) => ({ cat, count }));

  return (
    <div>
      <div style={s.pageTitle}>Analytics & Charts</div>
      <div style={s.pageSub}>Visual overview of yields, products, and revenue</div>
      <div style={s.twoCol}>
        <Card>
          <CardHead title="Monthly yield (lbs) — 2025" />
          <div style={s.cardBody}>
            <BarChart data={MONTHLY_YIELD} xKey="month" yKey="lbs" height={150} color={T.greenMid} />
          </div>
        </Card>
        <Card>
          <CardHead title="Revenue by crop" />
          <div style={s.cardBody}>
            <HorizBarChart data={CROP_REVENUE} xKey="crop" yKey="rev" />
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.muted, fontFamily: "'Lato', sans-serif" }}>Total potential revenue</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: T.green }}>${CROP_REVENUE.reduce((s, d) => s + d.rev, 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
      <div style={s.twoCol}>
        <Card>
          <CardHead title="Expected yield by crop" />
          <div style={s.cardBody}>
            <BarChart data={cropYields} xKey="crop" yKey="lbs" height={130} color={T.soil} />
          </div>
        </Card>
        <Card>
          <CardHead title="Products by category" />
          <div style={s.cardBody}>
            <HorizBarChart data={productsByCategory} xKey="cat" yKey="count" />
          </div>
        </Card>
      </div>
      <Card>
        <CardHead title="Crop → product conversion tracker" />
        <div style={{ ...s.cardBody, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Lato', sans-serif" }}>
            <thead>
              <tr>{["Crop","Yield","Products made","Total units","Crop lbs used","Revenue"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {crops.map((c, i) => {
                const prods = products.filter(p => p.crop === c.name);
                const totalUnits = prods.reduce((sum, p) => sum + p.stock, 0);
                const lbsUsed = prods.reduce((sum, p) => sum + p.stock * p.cropLbs, 0);
                const rev = prods.reduce((sum, p) => sum + p.stock * p.price, 0);
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : T.bg }}>
                    <td style={{ padding: "9px 10px", fontWeight: 600, color: T.green }}>{c.name}</td>
                    <td style={{ padding: "9px 10px" }}>{c.yield} {c.unit}</td>
                    <td style={{ padding: "9px 10px" }}>{prods.length > 0 ? prods.map(p => p.name).join(", ") : <span style={{ color: T.light }}>—</span>}</td>
                    <td style={{ padding: "9px 10px" }}>{totalUnits || "—"}</td>
                    <td style={{ padding: "9px 10px" }}>{lbsUsed > 0 ? `${lbsUsed.toFixed(1)} lbs` : "—"}</td>
                    <td style={{ padding: "9px 10px", fontWeight: 700, color: T.green }}>{rev > 0 ? `$${rev.toLocaleString()}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Drive Tab ─────────────────────────────────────────────────────────────────
function Drive({ driveLinks, setDriveLinks, crops }) {
  const [form, setForm] = useState({ name: "", type: "sheet", url: "", crop: "All", updated: "" });
  const [filter, setFilter] = useState("all");

  function add() {
    if (!form.name.trim() || !form.url.trim()) return;
    setDriveLinks(dl => [...dl, { ...form, id: Date.now() }]);
    setForm({ name: "", type: "sheet", url: "", crop: "All", updated: "" });
  }

  function remove(id) { setDriveLinks(dl => dl.filter(l => l.id !== id)); }

  const filtered = driveLinks.filter(l => {
    if (filter === "all") return true;
    if (filter === "sheet" || filter === "doc" || filter === "slide") return l.type === filter;
    return l.crop === filter;
  });

  const typeIcon = { sheet: "📊", doc: "📄", slide: "📑" };
  const typeLabel = { sheet: "Google Sheet", doc: "Google Doc", slide: "Google Slides" };

  return (
    <div>
      <div style={s.pageTitle}>Google Drive Links</div>
      <div style={s.pageSub}>Connected spreadsheets, docs, and charts for your garden operation</div>
      <div style={s.statRow}>
        <StatCard label="Total files" val={driveLinks.length} sub="Linked documents" accent />
        <StatCard label="Sheets" val={driveLinks.filter(l => l.type === "sheet").length} sub="Spreadsheets" />
        <StatCard label="Docs" val={driveLinks.filter(l => l.type === "doc").length} sub="Documents" />
        <StatCard label="Slides" val={driveLinks.filter(l => l.type === "slide").length} sub="Presentations" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["all","sheet","doc","slide","All",...[...new Set(crops.map(c => c.name))]].filter((v, i, a) => a.indexOf(v) === i).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...s.btn(filter === f ? "primary" : "ghost"), fontSize: 11 }}>
            {f === "all" ? "All files" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {filtered.map((link) => (
          <div key={link.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{typeIcon[link.type] || "📁"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{link.name}</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: "'Lato', sans-serif", display: "flex", gap: 12 }}>
                <span>{typeLabel[link.type] || link.type}</span>
                {link.crop && link.crop !== "All" && <span style={{ color: T.green, fontWeight: 600 }}>🌿 {link.crop}</span>}
                {link.updated && <span>Updated {link.updated}</span>}
              </div>
            </div>
            <Badge type={link.type}>{link.type}</Badge>
            <a href={link.url} target="_blank" rel="noreferrer" style={{ padding: "7px 14px", background: T.blue, color: "#fff", borderRadius: 6, fontSize: 12, fontFamily: "'Lato', sans-serif", fontWeight: 600, textDecoration: "none" }}>Open →</a>
            <button onClick={() => remove(link.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.light, fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>

      <Card>
        <CardHead title="Add Drive link" />
        <div style={s.cardBody}>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>File name</label><input style={s.formInput} placeholder="e.g. 2025 Yield Tracker" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={s.formGroup}><label style={s.formLabel}>File type</label>
              <select style={s.formInput} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="sheet">Google Sheet</option>
                <option value="doc">Google Doc</option>
                <option value="slide">Google Slides</option>
              </select>
            </div>
          </div>
          <div style={s.formGroup}><label style={s.formLabel}>Google Drive URL</label><input style={s.formInput} placeholder="https://docs.google.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
          <div style={s.formRow}>
            <div style={s.formGroup}><label style={s.formLabel}>Related crop (optional)</label>
              <select style={s.formInput} value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}>
                <option value="All">All / General</option>
                {[...new Set(crops.map(c => c.name))].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={s.formGroup}><label style={s.formLabel}>Last updated</label><input style={s.formInput} placeholder="Jun 7, 2025" value={form.updated} onChange={e => setForm(f => ({ ...f, updated: e.target.value }))} /></div>
          </div>
          <Btn variant="amber" onClick={add} style={{ width: "100%", marginTop: 4 }}>Add Drive link</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = ["overview","crops","products","tasks","charts","drive"];
const TAB_LABELS = { overview: "🌿 Overview", crops: "🌱 Crops", products: "🧴 Products", tasks: "✅ Tasks", charts: "📊 Charts", drive: "🔗 Drive Files" };

export default function App() {
  const [view, setView] = useState("overview");
  const [crops, setCrops] = useState(() => load("gd_crops", INIT_CROPS));
  const [products, setProducts] = useState(() => load("gd_products", INIT_PRODUCTS));
  const [tasks, setTasks] = useState(() => load("gd_tasks", INIT_TASKS));
  const [driveLinks, setDriveLinks] = useState(() => load("gd_drive", INIT_DRIVE_LINKS));

  useEffect(() => { save("gd_crops", crops); }, [crops]);
  useEffect(() => { save("gd_products", products); }, [products]);
  useEffect(() => { save("gd_tasks", tasks); }, [tasks]);
  useEffect(() => { save("gd_drive", driveLinks); }, [driveLinks]);

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lora:wght@400;500&family=Lato:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>Garden <span style={s.logoAccent}>Buddy</span></div>
        <div style={s.headerRight}>
          <div style={s.headerStat}>
            <div style={s.headerStatVal}>{crops.filter(c => c.status === "ready").length}</div>
            <div style={s.headerStatLabel}>Ready to harvest</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.2)" }} />
          <div style={s.headerStat}>
            <div style={s.headerStatVal}>{tasks.filter(t => !t.done).length}</div>
            <div style={s.headerStatLabel}>Pending tasks</div>
          </div>
        </div>
      </div>
      <div style={s.nav}>
        {TABS.map(t => (
          <button key={t} onClick={() => setView(t)} style={s.tab(view === t)}>{TAB_LABELS[t]}</button>
        ))}
      </div>
      <div style={s.body}>
        {view === "overview"  && <Overview crops={crops} products={products} tasks={tasks} driveLinks={driveLinks} switchTab={setView} />}
        {view === "crops"     && <Crops crops={crops} setCrops={setCrops} />}
        {view === "products"  && <Products products={products} setProducts={setProducts} crops={crops} />}
        {view === "tasks"     && <Tasks tasks={tasks} setTasks={setTasks} />}
        {view === "charts"    && <Charts crops={crops} products={products} />}
        {view === "drive"     && <Drive driveLinks={driveLinks} setDriveLinks={setDriveLinks} crops={crops} />}
      </div>
    </div>
  );
}
