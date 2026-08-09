import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, LogOut, Users } from "lucide-react";

import SEO from "@/components/shared/SEO";
import { Button } from "@/components/ui/button";
import { clearAdminToken, getAdminToken } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/contacts", label: "Contacts", icon: Users },
  { to: "/admin/blog", label: "Blog", icon: FileText },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Route guard. The API authorises every admin request independently; this
  // only keeps unauthenticated users out of the console shell.
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const handleSignOut = () => {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO title="Admin | AlphaTrack Digital" description="Internal admin console." noindex />

      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold tracking-tight">AlphaTrack Admin</span>
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
