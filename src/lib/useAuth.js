// Admin auth for FRESH MANAGER.
//
// FLOW:
//  1. Operator signs in with email + password (Firebase Auth).
//  2. App reads admins/{uid} from Firestore.
//     - Document exists  → authorized, isAdmin = true, app proceeds.
//     - Document missing → NOT authorized. We immediately sign the user
//       back out client-side so a valid-but-non-admin Firebase account
//       can never sit "signed in" inside FRESH MANAGER.
//  3. Firestore rules independently enforce the same admins/{uid} check
//     server-side — the client check is for UX only and is not the
//     security boundary.
//
// ⚠️ ASSUMPTION: admin accounts are provisioned out-of-band (Firebase
// Console → Authentication, plus a matching admins/{uid} doc created
// manually or via a separate trusted script). This MVP has no
// "create admin" UI on purpose — that's a privileged action that
// shouldn't be self-service from the client.
import { useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setAuthError("");
      if (!fbUser) {
        setUser(null);
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, "admins", fbUser.uid));
        if (adminDoc.exists()) {
          setUser(fbUser);
          setIsAdmin(true);
        } else {
          // Valid Firebase account, but not an authorized operator.
          setUser(null);
          setIsAdmin(false);
          setAuthError("This account is not authorized for FRESH MANAGER.");
          await fbSignOut(auth);
        }
      } catch (err) {
        setUser(null);
        setIsAdmin(false);
        setAuthError("Could not verify admin authorization. Try again.");
      } finally {
        setChecking(false);
      }
    });
    return unsub;
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError("");
    setChecking(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged above handles the admins/{uid} check + state.
    } catch (err) {
      setChecking(false);
      setAuthError(mapAuthError(err));
      throw err;
    }
  }, []);

  const signOut = useCallback(() => fbSignOut(auth), []);

  return { user, isAdmin, checking, authError, signIn, signOut };
}

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Incorrect email or password.";
  }
  if (code.includes("too-many-requests")) return "Too many attempts. Try again shortly.";
  return "Sign-in failed. Please try again.";
}
