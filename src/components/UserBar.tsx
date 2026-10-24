import { LogOut, ShieldCheck, UserRound } from "lucide-react";

import logo from "@/assets/glacetech-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth, useSession } from "@/lib/auth";

/** Top header: who is logged in (with a clear role badge) and a log-out button. */
const UserBar = () => {
  const { signOut } = useAuth();
  const { employee } = useSession();
  const isAdmin = employee.role === "admin";

  return (
    <header className="print:hidden bg-gradient-to-r from-header to-header-light text-header-foreground border-b-4 border-header-accent shadow-md">
      <div className="max-w-5xl mx-auto flex items-center gap-3 h-16 px-4">
        <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-white px-1.5 shadow-sm">
          <img src={logo} alt="GlaceTech" className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1.5 truncate text-base font-semibold">
            <UserRound className="h-4 w-4 shrink-0 opacity-80" />
            <span className="truncate">{employee.name}</span>
          </div>
          <div className="mt-1">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-header ring-2 ring-header-accent">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium">
                Technician{employee.code ? ` · ${employee.code}` : ""}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          className="h-10 gap-2 px-3 text-header-foreground hover:bg-white/15 hover:text-header-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </div>
    </header>
  );
};

export default UserBar;
