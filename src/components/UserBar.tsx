import { LogOut, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth, useSession } from "@/lib/auth";

/** Who is logged in, with a log-out button. */
const UserBar = () => {
  const { signOut } = useAuth();
  const { employee } = useSession();
  const isAdmin = employee.role === "admin";

  return (
    <div className="print:hidden bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto flex items-center gap-2 px-3 py-1.5 text-sm">
        {isAdmin ? <ShieldCheck className="h-4 w-4 text-emerald-300" /> : <UserRound className="h-4 w-4" />}
        <span className="truncate font-medium">{employee.name}</span>
        <span className="text-white/60 text-xs">{isAdmin ? "Admin" : employee.code ?? "Technician"}</span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 text-white hover:bg-white/10 hover:text-white"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </div>
    </div>
  );
};

export default UserBar;
