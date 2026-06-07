import { useState, useEffect } from "react";

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const INIT_RESERVATIONS = [
  { time: "6:00 PM", guest: "Johnson", size: 6, table: "Table 4", notes: "Anniversary dinner", status: "confirmed" },
  { time: "6:30 PM", guest: "Rivera", size: 2, table: "Table 9", notes: "Window seat requested", status: "confirmed" },
  { time: "7:00 PM", guest: "Chen", size: 4, table: "Table 2", notes: "", status: "pending" },
  { time: "7:30 PM", guest: "Williams", size: 8, table: "Private room", notes: "Birthday celebration", status: "confirmed" },
  { time: "8:00 PM", guest: "Okafor", size: 3, table: "Table 6", notes: "Vegan menu", status: "pending" },
  { time: "8:30 PM", guest: "Nakamura", size: 2, table: "Bar", notes: "", status: "confirmed" },
  { time: "9:00 PM", guest: "Thompson", size: 10, table: "Private room", notes: "Corporate event", status: "confirmed" },
];

const INIT_STAFF = [
  { name: "Maria G.", role: "Host", start: "16:00", end: "23:00", status: "confirmed" },
  { name: "James R.", role: "Bartender", start: "17:00", end: "02:00", status: "confirmed" },
  { name: "Priya S.", role: "Server", start: "17:00", end: "23:00", status: "confirmed" },
  { name: "Devon K.", role: "Server", start: "17:00", end: "23:00", status: "confirmed" },
  { name: "Chef Marcus", role: "Kitchen", start: "15:00", end: "23:00", status: "confirmed" },
  { name: "Tanya B.", role: "Manager", start: "16:00", end: "01:00", status: "confirmed" },
  { name: "DJ Renzo", role: "DJ", start: "21:00", end: "02:00", status: "confirmed" },
  { name: "Open shift", role: "Security", start: "20:00", end: "02:00", status: "open" },
];

const INIT_MENU = [
  { name: "Tuna Tartare", cat: "Starter", price: 22, stock: 18 },
  { name: "Wagyu Beef", cat: "Main", price: 68, stock: 4 },
  { name: "Pan Seared Halibut", cat: "Main", price: 42, stock: 12 },
  { name: "Chocolate Soufflé", cat: "Dessert", price: 16, stock: 20 },
  { name: "Espresso Martini", cat: "Cocktail", price: 18, stock: 99 },
  { name: "Signature Negroni", cat: "Cocktail", price: 16, stock: 99 },
  { name: "Château Margaux 2018", cat: "Wine", price: 95, stock: 6 },
  { name: "Burrata & Truffle", cat: "Starter", price: 26, stock: 10 },
];

const INIT_POSTS = [
  { platform: "Instagram", text: "Saturday nights hit different. The kitchen is ready — are you? Reservations open.", tags: "#finedining #saturday #chef", date: "Sat 7:00 PM", status: "scheduled" },
  { platform: "TikTok", text: "Behind the bar with James — watch how we make our signature Negroni.", tags: "#cocktails #bartender #behindthescenes", date: "Sun 6:00 PM", status: "scheduled" },
  { platform: "Facebook", text: "Private events now booking for July & August. DM us for packages.", tags: "#events #privatedining", date: "Mon 12:00 PM", status: "draft" },
];

const TABLE_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","B1","B2","PR"];
const INIT_TABLE_STATES = ["open","open","seated","seated","seated","reserved","open","reserved","seated","open","open","seated"];
const TABLE_CYCLE = ["open","seated","reserved"];

// ── Styles ──────────────────────────────────────────────────────────────────
const s = {
  app: { fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FAFAF7", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#1C1C1A" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#fff", borderBottom: "0.5px solid #E8E8E3" },
  logo: { fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.02em", color: "#1C1C1A" },
  logoAccent: { color: "#C4622D" },
  nav: { display: "flex", gap: 2, padding: "12px 20px", background: "#fff", borderBottom: "0.5px solid #E8E8E3", overflowX: "auto" },
  tab: (active) => ({ padding: "7px 16px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 500 : 400, border: "0.5px solid transparent", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", color: active ? "#fff" : "#6B6B67", background: active ? "#1C1C1A" : "transparent", transition: "all .15s" }),
  body: { flex: 1, padding: 20, overflowY: "auto" },
  sectionTitle: { fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 500, marginBottom: 4, color: "#1C1C1A" },
  sectionSub: { fontSize: 12, color: "#6B6B67", marginBottom: 20 },
  statRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 },
  stat: (accent) => ({ background: accent ? "#FAF0EA" : "#fff", border: `0.5px solid ${accent ? "#E8A882" : "#E8E8E3"}`, borderRadius: 10, padding: "14px 16px" }),
  statLabel: { fontSize: 11, color: "#6B6B67", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" },
  statVal: (accent) => ({ fontFamily: "'Georgia', serif", fontSize: 28, fontWeight: 500, color: accent ? "#C4622D" : "#1C1C1A", lineHeight: 1 }),
  statSub: { fontSize: 11, color: "#6B6B67", marginTop: 4 },
  card: { background: "#fff", border: "0.5px solid #E8E8E3", borderRadius: 10, marginBottom: 12 },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "0.5px solid #E8E8E3" },
  cardTitle: { fontSize: 13, fontWeight: 500, color: "#1C1C1A" },
  cardBody: { padding: "14px 16px" },
  btn: { padding: "6px 14px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, borderRadius: 6, cursor: "pointer", transition: "all .15s", border: "none" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  badge: (type) => {
    const map = {
      green: { background: "#EAF3DE", color: "#3B6D11" },
      amber: { background: "#FAEEDA", color: "#854F0B" },
      red: { background: "#FCEBEB", color: "#A32D2D" },
      blue: { background: "#E6F1FB", color: "#185FA5" },
      gray: { background: "#F1EFE8", color: "#5F5E5A" },
    };
    return { ...(map[type] || map.gray), display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500 };
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 },
  formLabel: { fontSize: 11, fontWeight: 500, color: "#6B6B67", letterSpacing: "0.04em", textTransform: "uppercase" },
  formInput: { padding: "8px 10px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", border: "0.5px solid #E8E8E3", borderRadius: 6, background: "#fff", color: "#1C1C1A", outline: "none", width: "100%", boxSizing: "border-box" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 },
  alert: (type) => {
    const map = {
      orange: { background: "#FAF0EA", border: "0.5px solid #E8A882", color: "#C4622D" },
      green: { background: "#EAF3DE", border: "0.5px solid #C0DD97", color: "#3B6D11" },
      blue: { background: "#E6F1FB", border: "0.5px solid #B5D4F4", color: "#185FA5" },
    };
    return { ...(map[type] || map.blue), display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, fontSize: 13 };
  },
};

// ── Shared Components ────────────────────────────────────────────────────────
function Badge({ type, children }) {
  return <span style={s.badge(type)}>{children}</span>;
}

function Btn({ onClick, primary, accent, style: extra, children }) {
  const base = { ...s.btn };
  if (primary) { base.background = "#1C1C1A"; base.color = "#fff"; }
  else if (accent) { base.background = "#C4622D"; base.color = "#fff"; }
  else { base.background = "transparent"; base.color = "#6B6B67"; base.border = "0.5px solid #E8E8E3"; }
  return <button onClick={onClick} style={{ ...base, ...extra }}>{children}</button>;
}

function StatCard({ label, val, sub, accent }) {
  return (
    <div style={s.stat(accent)}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statVal(accent)}>{val}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}

function Card({ children, style: extra }) {
  return <div style={{ ...s.card, ...extra }}>{children}</div>;
}

function CardHead({ title, action }) {
  return (
    <div style={s.cardHead}>
      <div style={s.cardTitle}>{title}</div>
      {action}
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function Overview({ reservations, switchTab }) {
  const [tableStates, setTableStates] = useState(() => load("mb_tables", INIT_TABLE_STATES));
  useEffect(() => { save("mb_tables", tableStates); }, [tableStates]);

  function cycleTable(i) {
    setTableStates(ts => ts.map((t, idx) => idx === i ? TABLE_CYCLE[(TABLE_CYCLE.indexOf(t) + 1) % 3] : t));
  }

  const upcoming = reservations.slice(0, 4);

  return (
    <div>
      <div style={s.sectionTitle}>Good evening</div>
      <div style={s.sectionSub}>Here's how tonight is shaping up</div>
      <div style={s.statRow}>
        <StatCard label="Tonight's covers" val="84" sub="of 96 capacity" accent />
        <StatCard label="Staff on floor" val="12" sub="3 back-of-house" />
        <StatCard label="Projected revenue" val="$4,200" sub="Avg check $50" />
        <StatCard label="Events tonight" val="2" sub="Private + open floor" />
      </div>
      <div style={s.twoCol}>
        <Card>
          <CardHead title="Next reservations" action={<Btn onClick={() => switchTab("reservations")}>View all</Btn>} />
          <div style={s.cardBody}>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 0.5, background: "#E8E8E3" }} />
              {upcoming.map((r, i) => (
                <div key={i} style={{ position: "relative", padding: "10px 0 10px 20px", borderBottom: i < upcoming.length - 1 ? "0.5px solid #E8E8E3" : "none" }}>
                  <div style={{ position: "absolute", left: -14, top: 16, width: 8, height: 8, borderRadius: "50%", background: r.status === "confirmed" ? "#C4622D" : "#fff", border: `1.5px solid ${r.status === "confirmed" ? "#C4622D" : "#E8E8E3"}` }} />
                  <div style={{ fontSize: 11, color: "#6B6B67", marginBottom: 2 }}>{r.time}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.guest} — party of {r.size}</div>
                  <div style={{ fontSize: 12, color: "#6B6B67" }}>{r.table}{r.notes ? ` · ${r.notes}` : ""}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Floor status" action={<Btn>Edit layout</Btn>} />
          <div style={s.cardBody}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {TABLE_LABELS.map((l, i) => {
                const st = tableStates[i];
                const bg = st === "seated" ? "#FAF0EA" : st === "reserved" ? "#E6F1FB" : "#F5F5F0";
                const col = st === "seated" ? "#C4622D" : st === "reserved" ? "#185FA5" : "#6B6B67";
                return (
                  <div key={i} onClick={() => cycleTable(i)} style={{ background: bg, border: "0.5px solid #E8E8E3", borderRadius: 6, padding: "8px 6px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: col }}>{l}</div>
                    <div style={{ fontSize: 10, color: col, marginTop: 2 }}>{st}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
      <Card style={{ marginTop: 12 }}>
        <CardHead title="Tonight's alerts" />
        <div style={{ ...s.cardBody, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={s.alert("orange")}>⚠ Low stock: Wagyu beef — 4 portions remaining</div>
          <div style={s.alert("green")}>✓ All staff checked in for tonight's service</div>
          <div style={s.alert("blue")}>★ New review: 5 stars on Yelp — "Best ambiance in the city"</div>
        </div>
      </Card>
    </div>
  );
}

// ── Reservations Tab ──────────────────────────────────────────────────────────
function Reservations({ reservations, setReservations }) {
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ guest: "", size: "2", time: "19:00", table: "Table 1", notes: "" });

  function toggle(i) {
    setReservations(rs => rs.map((r, idx) => idx === i ? { ...r, status: r.status === "confirmed" ? "pending" : "confirmed" } : r));
  }

  function add() {
    if (!form.guest.trim()) return;
    const [hStr, mStr] = form.time.split(":");
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h > 12 ? h - 12 : h || 12;
    setReservations(rs => [...rs, { time: `${h12}:${mStr} ${ampm}`, guest: form.guest, size: parseInt(form.size) || 2, table: form.table, notes: form.notes, status: "confirmed" }]);
    setForm({ guest: "", size: "2", time: "19:00", table: "Table 1", notes: "" });
  }

  const filtered = reservations.filter(r => {
    if (filter === "confirmed") return r.status === "confirmed";
    if (filter === "pending") return r.status === "pending";
    if (filter === "private") return r.table === "Private room";
    return true;
  });

  return (
    <div>
      <div style={s.sectionTitle}>Reservations</div>
      <div style={s.sectionSub}>Manage bookings, events, and table assignments</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Btn primary onClick={add}>+ New reservation</Btn>
        <select style={{ ...s.formInput, width: "auto", fontSize: 12 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All bookings</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="private">Private events</option>
        </select>
      </div>
      <Card>
        <div style={{ ...s.cardBody, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Time","Guest","Party","Table","Notes","Status",""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 500, color: "#6B6B67", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "0.5px solid #E8E8E3" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const realIdx = reservations.indexOf(r);
                return (
                  <tr key={i}>
                    <td style={{ padding: "10px 12px", fontWeight: 500, borderBottom: "0.5px solid #E8E8E3" }}>{r.time}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid #E8E8E3" }}>{r.guest}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid #E8E8E3" }}>{r.size}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid #E8E8E3" }}>{r.table}</td>
                    <td style={{ padding: "10px 12px", color: "#6B6B67", borderBottom: "0.5px solid #E8E8E3" }}>{r.notes || "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid #E8E8E3" }}><Badge type={r.status === "confirmed" ? "green" : "amber"}>{r.status}</Badge></td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid #E8E8E3" }}><Btn onClick={() => toggle(realIdx)} style={{ padding: "3px 8px", fontSize: 11 }}>Toggle</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ ...s.twoCol, marginTop: 12 }}>
        <Card>
          <CardHead title="Add reservation" />
          <div style={s.cardBody}>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Guest name</label>
                <input style={s.formInput} placeholder="Last name" value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Party size</label>
                <input style={s.formInput} type="number" min="1" max="20" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Time</label>
                <input style={s.formInput} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Table</label>
                <select style={s.formInput} value={form.table} onChange={e => setForm(f => ({ ...f, table: e.target.value }))}>
                  {["Table 1","Table 2","Table 3","Table 4","Table 5","Table 6","Table 7","Table 8","Table 9","Bar","Private room"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Notes</label>
              <input style={s.formInput} placeholder="Anniversary, allergies, special requests..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <Btn primary onClick={add} style={{ width: "100%", marginTop: 4 }}>Add booking</Btn>
          </div>
        </Card>
        <Card>
          <CardHead title="Capacity tonight" />
          <div style={s.cardBody}>
            {[["Dining room", 90, "#C4622D"], ["Bar seating", 50, "#1C1C1A"], ["Private room", 60, "#1C1C1A"]].map(([label, pct, col]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6B6B67" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{Math.round(pct * 0.9)} / {pct}</span>
                </div>
                <div style={{ height: 6, background: "#E8E8E3", borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 10, borderTop: "0.5px solid #E8E8E3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#6B6B67" }}>Total tonight</span>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 500, color: "#C4622D" }}>84 / 116</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Staff Tab ─────────────────────────────────────────────────────────────────
function Staff({ staff, setStaff }) {
  const [form, setForm] = useState({ name: "", role: "Server", start: "17:00", end: "23:00", status: "confirmed" });

  function add() {
    if (!form.name.trim()) return;
    setStaff(ss => [...ss, { ...form }]);
    setForm({ name: "", role: "Server", start: "17:00", end: "23:00", status: "confirmed" });
  }

  function timeToNum(t) {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  }

  return (
    <div>
      <div style={s.sectionTitle}>Staff & Shifts</div>
      <div style={s.sectionSub}>Tonight's schedule and team roster</div>
      <div style={s.statRow}>
        <StatCard label="On shift" val="12" sub="Checked in" />
        <StatCard label="Labor cost" val="$680" sub="Tonight est." accent />
        <StatCard label="Hours logged" val="38" sub="This week" />
        <StatCard label="Open shifts" val="2" sub="Need coverage" />
      </div>
      <div style={s.twoCol}>
        <Card>
          <CardHead title="Tonight's schedule" action={<Btn primary onClick={add}>+ Add</Btn>} />
          <div style={s.cardBody}>
            {staff.map((st, i) => {
              const startNum = timeToNum(st.start);
              const endNum = timeToNum(st.end);
              const span = Math.min(Math.abs(endNum < startNum ? endNum + 24 - startNum : endNum - startNum), 10);
              const pct = Math.round((span / 12) * 100);
              const initials = st.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
              const barCol = st.status === "open" ? "#E8E8E3" : st.status === "pending" ? "#EF9F27" : "#1C1C1A";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < staff.length - 1 ? "0.5px solid #E8E8E3" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5F5F0", border: "0.5px solid #E8E8E3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#6B6B67", flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{st.name}</div>
                    <div style={{ fontSize: 11, color: "#6B6B67" }}>{st.role}</div>
                  </div>
                  <div style={{ flex: 2, margin: "0 10px", height: 6, background: "#E8E8E3", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: barCol, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#6B6B67", whiteSpace: "nowrap", minWidth: 80, textAlign: "right" }}>{st.start}–{st.end}</div>
                  <Badge type={st.status === "confirmed" ? "green" : st.status === "open" ? "red" : "amber"}>{st.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHead title="Add shift" />
          <div style={s.cardBody}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Staff member</label>
              <input style={s.formInput} placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Role</label>
              <select style={s.formInput} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {["Server","Bartender","Host","Kitchen","Manager","Security","DJ"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Start</label>
                <input style={s.formInput} type="time" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>End</label>
                <input style={s.formInput} type="time" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Status</label>
              <select style={s.formInput} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="open">Open — needs fill</option>
              </select>
            </div>
            <Btn primary onClick={add} style={{ width: "100%", marginTop: 4 }}>Add to schedule</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Menu Tab ──────────────────────────────────────────────────────────────────
function Menu({ menu, setMenu }) {
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [form, setForm] = useState({ name: "", cat: "Starter", price: "", stock: "" });

  function adjust(i, d) {
    setMenu(ms => ms.map((m, idx) => idx === i ? { ...m, stock: Math.max(0, m.stock + d) } : m));
  }

  function add() {
    if (!form.name.trim()) return;
    setMenu(ms => [...ms, { name: form.name, cat: form.cat, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 }]);
    setForm({ name: "", cat: "Starter", price: "", stock: "" });
  }

  const filtered = menu.filter(m => {
    if (catFilter !== "all" && m.cat !== catFilter) return false;
    if (stockFilter === "low" && m.stock >= 10) return false;
    if (stockFilter === "ok" && m.stock < 10) return false;
    return true;
  });

  return (
    <div>
      <div style={s.sectionTitle}>Menu & Inventory</div>
      <div style={s.sectionSub}>Track dishes, pricing, and stock levels</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Btn primary onClick={add}>+ Add item</Btn>
        <select style={{ ...s.formInput, width: "auto", fontSize: 12 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          {["Starter","Main","Dessert","Cocktail","Wine"].map(c => <option key={c} value={c}>{c}s</option>)}
        </select>
        <select style={{ ...s.formInput, width: "auto", fontSize: 12 }} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="all">All stock</option>
          <option value="low">Low stock</option>
          <option value="ok">In stock</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtered.map((m, i) => {
          const low = m.stock < 10 && m.cat !== "Cocktail";
          const realIdx = menu.indexOf(m);
          return (
            <div key={i} style={{ background: "#fff", border: "0.5px solid #E8E8E3", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "#6B6B67" }}>{m.cat}</div>
                </div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 500, color: "#C4622D" }}>${m.price}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <Badge type={low ? "red" : "green"}>
                  {m.cat === "Cocktail" ? "In stock" : low ? `Low — ${m.stock} left` : `${m.stock} portions`}
                </Badge>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn onClick={() => adjust(realIdx, -1)} style={{ padding: "3px 7px", fontSize: 11 }}>−</Btn>
                  <Btn onClick={() => adjust(realIdx, 1)} style={{ padding: "3px 7px", fontSize: 11 }}>+</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Card style={{ marginTop: 16 }}>
        <CardHead title="Add menu item" />
        <div style={s.cardBody}>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Item name</label>
              <input style={s.formInput} placeholder="Dish or drink name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Category</label>
              <select style={s.formInput} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                {["Starter","Main","Dessert","Cocktail","Wine","Beer","NA"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Price</label>
              <input style={s.formInput} type="number" placeholder="28" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Stock count</label>
              <input style={s.formInput} type="number" placeholder="20" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>
          <Btn primary onClick={add} style={{ width: "100%" }}>Add to menu</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Social Tab ────────────────────────────────────────────────────────────────
function Social({ posts, setPosts }) {
  const [form, setForm] = useState({ platform: "Instagram", text: "", tags: "", date: "", time: "18:00" });

  function add() {
    if (!form.text.trim()) return;
    const dateLabel = form.date && form.time ? `${form.date} ${form.time}` : "Scheduled";
    setPosts(ps => [{ platform: form.platform, text: form.text, tags: form.tags, date: dateLabel, status: "scheduled" }, ...ps]);
    setForm(f => ({ ...f, text: "", tags: "" }));
  }

  return (
    <div>
      <div style={s.sectionTitle}>Social & Marketing</div>
      <div style={s.sectionSub}>Schedule posts, track engagement, plan promotions</div>
      <div style={s.twoCol}>
        <Card>
          <CardHead title="Scheduled posts" action={<Btn primary onClick={add}>+ Schedule</Btn>} />
          <div style={s.cardBody}>
            {posts.map((p, i) => (
              <div key={i} style={{ background: "#fff", border: "0.5px solid #E8E8E3", borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#6B6B67", textTransform: "uppercase", letterSpacing: ".04em" }}>{p.platform}</span>
                  <Badge type={p.status === "scheduled" ? "green" : "gray"}>{p.status}</Badge>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{p.text}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#C4622D" }}>{p.tags}</span>
                  <span style={{ fontSize: 11, color: "#6B6B67" }}>{p.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Create post" />
          <div style={s.cardBody}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Platform</label>
              <select style={s.formInput} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                {["Instagram","TikTok","Facebook","Twitter/X"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Caption</label>
              <textarea style={{ ...s.formInput, resize: "vertical" }} rows={3} placeholder="Write your caption..." value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>Hashtags</label>
              <input style={s.formInput} placeholder="#finedining #cocktails" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Date</label>
                <input style={s.formInput} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Time</label>
                <input style={s.formInput} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <Btn primary onClick={add} style={{ width: "100%" }}>Schedule post</Btn>
          </div>
        </Card>
      </div>
      <Card style={{ marginTop: 12 }}>
        <CardHead title="Engagement snapshot" />
        <div style={s.cardBody}>
          <div style={s.statRow}>
            <StatCard label="Instagram followers" val="4.2k" sub="+82 this week" />
            <StatCard label="Best post reach" val="18.4k" sub="Saturday's reel" accent />
            <StatCard label="Reviews this week" val="14" sub="Avg 4.8 stars" />
            <StatCard label="Promotions active" val="2" sub="HH + event" />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = ["overview","reservations","staff","menu","social"];
const TAB_LABELS = {
  overview: "Overview",
  reservations: "Reservations",
  staff: "Staff & Shifts",
  menu: "Menu & Inventory",
  social: "Social & Marketing",
};

export default function App() {
  const [view, setView] = useState("overview");
  const [reservations, setReservations] = useState(() => load("mb_reservations", INIT_RESERVATIONS));
  const [staff, setStaff] = useState(() => load("mb_staff", INIT_STAFF));
  const [menu, setMenu] = useState(() => load("mb_menu", INIT_MENU));
  const [posts, setPosts] = useState(() => load("mb_posts", INIT_POSTS));

  useEffect(() => { save("mb_reservations", reservations); }, [reservations]);
  useEffect(() => { save("mb_staff", staff); }, [staff]);
  useEffect(() => { save("mb_menu", menu); }, [menu]);
  useEffect(() => { save("mb_posts", posts); }, [posts]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={s.logo}>Manager <span style={s.logoAccent}>Buddy</span></div>
        <div style={{ fontSize: 12, color: "#6B6B67" }}>{dateStr}</div>
      </div>
      <div style={s.nav}>
        {TABS.map(t => (
          <button key={t} onClick={() => setView(t)} style={s.tab(view === t)}>{TAB_LABELS[t]}</button>
        ))}
      </div>
      <div style={s.body}>
        {view === "overview"     && <Overview reservations={reservations} switchTab={setView} />}
        {view === "reservations" && <Reservations reservations={reservations} setReservations={setReservations} />}
        {view === "staff"        && <Staff staff={staff} setStaff={setStaff} />}
        {view === "menu"         && <Menu menu={menu} setMenu={setMenu} />}
        {view === "social"       && <Social posts={posts} setPosts={setPosts} />}
      </div>
    </div>
  );
}
