import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Calendar, Ticket, Users, BarChart3, Sparkles, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const studentNav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/events", label: "Browse events", icon: Calendar },
  { to: "/dashboard/tickets", label: "My tickets", icon: Ticket },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/registrations", label: "Registrations", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = role === "admin" ? adminNav : studentNav;
  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  const onSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-gradient-subtle px-4 py-6">
        <Link to="/" className="flex items-center gap-2 px-2 mb-8 font-display font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          Campus<span className="text-gradient-hero">Hub</span>
        </Link>
        <SidebarLinks items={items} />
        <div className="mt-auto px-2 pt-6 text-xs text-muted-foreground">
          {role === "admin" ? "Admin workspace" : "Student account"}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card px-4 py-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <span className="font-display font-bold">CampusHub</span>
                <Button size="icon" variant="ghost" onClick={() => setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarLinks items={items} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-sm text-muted-foreground hidden sm:block">
            {role === "admin" ? "Admin" : "Student"} · <span className="text-foreground">{currentLabel(items, location.pathname)}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const SidebarLinks = ({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) => (
  <nav className="space-y-1">
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            isActive
              ? "bg-gradient-hero text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`
        }
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </NavLink>
    ))}
  </nav>
);

const currentLabel = (items: NavItem[], path: string) =>
  items.find((i) => i.to === path)?.label ?? "Workspace";
