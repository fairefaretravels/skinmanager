import { useState } from "react";
import { s, T, Card, CardHead, Btn } from "../ui/tokens";

export default function SignIn({ signIn, authError, checking }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");
    if (!email.trim() || !password) {
      setLocalError("Enter email and password.");
      return;
    }
    try {
      await signIn(email.trim(), password);
    } catch {
      // authError from useAuth already covers the message
    }
  }

  return (
    <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: T.green }}>
            FRESH <span style={{ color: T.greenMid }}>MANAGER</span>
          </div>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "'Lato', sans-serif", marginTop: 4 }}>
            Operator sign-in — Detroit · Atlanta · Lithonia
          </div>
        </div>
        <Card>
          <CardHead title="Sign in" />
          <form onSubmit={handleSubmit}>
            <div style={s.cardBody}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Email</label>
                <input
                  style={s.formInput}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@sanecatv.com"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Password</label>
                <input
                  style={s.formInput}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {(localError || authError) && (
                <div style={{ fontSize: 12, color: T.red, marginBottom: 10, fontFamily: "'Lato', sans-serif" }}>
                  {localError || authError}
                </div>
              )}
              <Btn variant="primary" type="submit" disabled={checking} style={{ width: "100%" }}>
                {checking ? "Checking…" : "Sign in"}
              </Btn>
              <div style={{ fontSize: 11, color: T.light, marginTop: 10, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>
                Accounts are provisioned by an existing admin. There's no self-service
                sign-up here — this app writes directly into the public FRESH marketplaces.
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
