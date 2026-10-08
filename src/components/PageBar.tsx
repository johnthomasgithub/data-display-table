import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PageBarProps {
  title: string;
  /** Where to go when there is no previous screen (e.g. a link opened directly). */
  fallback: string;
  children?: ReactNode;
}

/** Sticky top bar with a back button, a title and optional actions. */
const PageBar = ({ title, fallback, children }: PageBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate(fallback, { replace: true });
  };

  return (
    <div className="sticky top-0 z-30 print:hidden border-b bg-background/95 backdrop-blur">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-2 px-3 py-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="-ml-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="flex-1 truncate font-semibold">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default PageBar;
