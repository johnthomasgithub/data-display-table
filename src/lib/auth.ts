import { createContext, useContext, useMemo } from "react";
import {
  SessionExpiredError,
  createRecord,
  deleteRecord,
  getRecord,
  listEmployees,
  listRecords,
  updateRecord,
  type LoginResult,
  type Session,
} from "@/lib/records";

export interface AuthContextValue {
  session: Session | null;
  signIn: (pin: string) => Promise<LoginResult>;
  /** Ends the session; "expired" also tells the user why. */
  signOut: (reason?: "expired") => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** The logged-in session (only used on screens behind the PIN login). */
export function useSession(): Session {
  const { session } = useAuth();
  if (!session) throw new Error("Not logged in");
  return session;
}

/**
 * Data functions bound to the current session. If the database says the
 * session has ended, the user is sent back to the PIN screen.
 */
export function useApi() {
  const { session, signOut } = useAuth();
  return useMemo(() => {
    const token = session?.token ?? "";
    const guard =
      <A extends unknown[], R>(fn: (token: string, ...args: A) => Promise<R>) =>
      async (...args: A): Promise<R> => {
        try {
          return await fn(token, ...args);
        } catch (err) {
          if (err instanceof SessionExpiredError) signOut("expired");
          throw err;
        }
      };
    return {
      listRecords: guard(listRecords),
      getRecord: guard(getRecord),
      createRecord: guard(createRecord),
      updateRecord: guard(updateRecord),
      deleteRecord: guard(deleteRecord),
      listEmployees: guard(listEmployees),
    };
  }, [session, signOut]);
}
