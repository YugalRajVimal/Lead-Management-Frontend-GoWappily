// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { useRouter } from "next/navigation";
// import { User } from "@/lib/types";
// import * as api from "@/lib/api-client";

// interface AuthContextValue {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const token = api.getToken();
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     api
//       .getMe()
//       .then(setUser)
//       .catch(() => {
//         api.clearToken();
//         setUser(null);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const login = useCallback(async (email: string, password: string) => {
//     const res = await api.login(email, password);
//     api.setToken(res.token);
//     setUser(res.user);
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       await api.logout();
//     } catch {
//       // ignore
//     }
//     api.clearToken();
//     setUser(null);
//     router.push("/login/");
//   }, [router]);

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Impersonation, Role, User } from "@/lib/types";
import * as api from "@/lib/api-client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Phase 3 — Admin "Login As" (impersonation).
  impersonation: Impersonation | null;
  loginAsUser: (userId: string, role: Role) => Promise<void>;
  exitImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonation, setImpersonation] = useState<Impersonation | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshMe = useCallback(() => {
    return api.getMe().then((res) => {
      const { impersonation: imp, ...rest } = res;
      setUser(rest);
      setImpersonation(imp ?? null);
    });
  }, []);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    refreshMe()
      .catch(() => {
        api.clearToken();
        setUser(null);
        setImpersonation(null);
      })
      .finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    api.setToken(res.token);
    setUser(res.user);
    setImpersonation(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    api.clearToken();
    api.clearAdminToken();
    setUser(null);
    setImpersonation(null);
    router.push("/login/");
  }, [router]);

  // Only `agent` stays inside this same admin app (Leads/Sources already
  // apply to that role), so that case swaps the active token in place.
  // `client` and `team_member` are separate deployed panels per the Phase 3
  // contract note, so those redirect the browser to that panel's origin
  // with the impersonation token in the URL — localStorage doesn't carry
  // across origins anyway, so there's nothing to swap back for those here.
  const loginAsUser = useCallback(async (userId: string, role: Role) => {
    const res = await api.impersonateUser(userId);

    if (role === "client" || role === "team_member") {
      const panelUrl =
        role === "client"
          ? process.env.NEXT_PUBLIC_CLIENT_PANEL_URL
          : process.env.NEXT_PUBLIC_TEAM_PANEL_URL;
      if (!panelUrl) {
        const envVar =
          role === "client"
            ? "NEXT_PUBLIC_CLIENT_PANEL_URL"
            : "NEXT_PUBLIC_TEAM_PANEL_URL";
        throw new Error(`${envVar} isn't configured — can't open that panel.`);
      }
      window.location.href = `${panelUrl}/?token=${encodeURIComponent(res.token)}`;
      return;
    }

    const currentToken = api.getToken();
    if (currentToken) api.setAdminToken(currentToken);
    api.setToken(res.token);
    setUser(res.user);
    setImpersonation(res.impersonation);
    router.push("/");
  }, [router]);

  const exitImpersonation = useCallback(async () => {
    const adminToken = api.getAdminToken();
    if (!adminToken) return;
    api.setToken(adminToken);
    api.clearAdminToken();
    setImpersonation(null);
    try {
      await refreshMe();
    } catch {
      // ignore — user stays null momentarily, AppShell's guard will redirect
    }
    router.push("/");
  }, [refreshMe, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        impersonation,
        loginAsUser,
        exitImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
