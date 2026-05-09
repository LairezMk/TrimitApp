import { HelpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function PageGuideButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isHelpPage = location.pathname === "/help";
  const isTourOpen = searchParams.get("tour") === "1";

  if (isHelpPage || isTourOpen) {
    return null;
  }

  const hasHelpGuide = location.pathname !== "/" && location.pathname !== "/auth";

  if (!hasHelpGuide) {
    return null;
  }

  return (
    <div className="flex justify-end pb-6" style={{ marginRight: "8px" }}>
      <button
        onClick={() => {
          const next = new URLSearchParams(location.search);
          next.set("tour", "1");
          navigate({
            pathname: location.pathname,
            search: `?${next.toString()}`,
          });
        }}
        className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/35 grid place-items-center motion-nav-button"
        title="Guía de esta página"
        aria-label="Guía de esta página"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
