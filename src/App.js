import { useState } from "react";
import { s, T, GoogleFonts, Btn } from "./ui/tokens";
import { useAuth } from "./lib/useAuth";
import SignIn from "./screens/SignIn";
import CitySelector from "./screens/CitySelector";
import FarmsDirectory from "./screens/FarmsDirectory";
import Growers from "./screens/Growers";
import TodaysAvailability from "./screens/TodaysAvailability";
import MarketplaceListings from "./screens/MarketplaceListings";
import Alerts from "./screens/Alerts";

const TABS = ["city", "farms", "growers", "availability", "listings", "alerts"];
const TAB_LABELS = {
  city: "🏙️ City",
  farms: "🚜 Farms Directory",
  growers: "🌱 Growers",
  availability: "📋 Today's Availability",
  listings: "🛒 Marketplace Listings",
  alerts: "🔔 Alerts",
};

export default function App() {
  const { user, isAdmin, checking, authError, signIn, signOut } = useAuth();
  const [view, setView] = useState("city");
  const [activeCity, setActiveCity] = useState("detroit");
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [draftProducts, setDraftProducts] = useState([]);

  if (checking && !user) {
    return (
      <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
        <GoogleFonts />
        <div style={{ fontSize: 13, color: T.muted, fontFamily: "'Lato', sans-serif" }}>Checking session…</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <>
        <GoogleFonts />
        <SignIn signIn={signIn} authError={authError} checking={checking} />
      </>
    );
  }

  return (
    <div style={s.app}>
      <GoogleFonts />
      <div style={s.header}>
        <div style={s.logo}>FRESH <span style={s.logoAccent}>MANAGER</span></div>
        <div style={s.headerRight}>
          <div style={{ fontSize: 12, color: "#fff", fontFamily: "'Lato', sans-serif" }}>{user.email}</div>
          <Btn onClick={signOut} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none" }}>
            Sign out
          </Btn>
        </div>
      </div>
      <div style={s.nav}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setView(t)} style={s.tab(view === t)}>{TAB_LABELS[t]}</button>
        ))}
      </div>
      <div style={s.body}>
        {view === "city" && (
          <CitySelector activeCity={activeCity} onSelect={(id) => { setActiveCity(id); setSelectedGrower(null); setDraftProducts([]); }} />
        )}
        {view === "farms" && (
          <FarmsDirectory
            cityId={activeCity}
            selectedGrowerId={selectedGrower?.id}
            onSelectGrower={setSelectedGrower}
            goToAvailability={() => setView("availability")}
          />
        )}
        {view === "growers" && <Growers cityId={activeCity} adminUid={user.uid} />}
        {view === "availability" && (
          <TodaysAvailability
            cityId={activeCity}
            grower={selectedGrower}
            draftProducts={draftProducts}
            setDraftProducts={setDraftProducts}
            goToListings={() => setView("listings")}
          />
        )}
        {view === "listings" && (
          <MarketplaceListings
            cityId={activeCity}
            adminUid={user.uid}
            grower={selectedGrower}
            draftProducts={draftProducts}
            setDraftProducts={setDraftProducts}
          />
        )}
        {view === "alerts" && <Alerts cityId={activeCity} adminUid={user.uid} />}
      </div>
    </div>
  );
}
