import { Outlet, useNavigate, useLocation } from "react-router";
import logoImage from "../../assets/0d23369e4a896d703eefe2aaa97e96c4234407d6.png";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Target,
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Archive,
  Clock,
  Lightbulb,
  Calculator,
  Bell,
  Trophy,
  CircleHelp,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { PageTransition } from "./motion/PageTransition";
import { PageGuideButton } from "./help/PageGuideButton";
import { PageTourOverlay } from "./help/PageTourOverlay";
import { useState } from "react";
import { AchievementsWatcher } from "./gamification/AchievementsWatcher";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: LayoutDashboard, label: "Suscripciones", path: "/subscriptions" },
        { icon: Calendar, label: "Calendario", path: "/calendar" },
        { icon: Target, label: "Presupuesto", path: "/budget" },
      ],
    },
    {
      title: "ANÁLISIS",
      items: [
        { icon: BarChart3, label: "Estadísticas", path: "/analytics" },
        { icon: TrendingUp, label: "Tendencias", path: "/trends" },
        { icon: FileText, label: "Reportes", path: "/reports" },
      ],
    },
    {
      title: "GESTIÓN",
      items: [
        { icon: Users, label: "Compartidas", path: "/sharing" },
        { icon: Archive, label: "Archivadas", path: "/archived" },
        { icon: Clock, label: "Recordatorios", path: "/reminders" },
      ],
    },
    {
      title: "HERRAMIENTAS",
      items: [
        { icon: Lightbulb, label: "Recomendaciones", path: "/recommendations" },
        { icon: Calculator, label: "Calculadora", path: "/calculator" },
      ],
    },
    {
      title: "CUENTA",
      items: [
        { icon: Bell, label: "Notificaciones", path: "/notifications" },
        { icon: Trophy, label: "Logros", path: "/profile/achievements" },
        { icon: CircleHelp, label: "Ayuda", path: "/help" },
      ],
    },
  ];

  const userName = user?.displayName?.trim() || "Usuario";
  const userEmail = user?.email || "Sin correo";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="trimit-shell flex min-h-screen transition-colors">
      <div className="trimit-mobile-topbar fixed top-0 left-0 right-0 h-16 backdrop-blur z-50 flex items-center justify-between px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="trimit-mobile-topbar-btn w-10 h-10 rounded-lg grid place-items-center"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleNavigate("/dashboard")}
          className="text-sm font-semibold trimit-sidebar-text"
        >
          Trimit
        </button>
        <button
          onClick={() => handleNavigate("/profile")}
          className="w-10 h-10 rounded-full overflow-hidden border trimit-sidebar-border bg-[var(--trimit-app-accent)] text-white grid place-items-center text-xs font-semibold"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <span>{userInitials || "U"}</span>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="trimit-sidebar absolute left-0 top-0 h-full w-[84vw] max-w-[320px] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold trimit-sidebar-text">Menú</p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="trimit-sidebar-item w-9 h-9 rounded-lg grid place-items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {menuSections.map((section, idx) => (
              <div key={idx} className="mb-5">
                <p className="trimit-sidebar-section text-xs uppercase tracking-wider mb-2 px-2">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                          active ? "trimit-sidebar-item-active" : "trimit-sidebar-item"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="space-y-2 pt-2 trimit-sidebar-bottom">
              <button
                onClick={() => handleNavigate("/settings")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm trimit-sidebar-item"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm trimit-sidebar-item"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="trimit-sidebar hidden md:block fixed left-0 top-0 h-full w-64 shadow-2xl z-50 overflow-y-auto transition-all duration-300">
        <div className="p-6">
          {/* Logo */}
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-center cursor-pointer border-0 bg-transparent p-0 leading-none transform transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/")}
            aria-label="Ir al inicio"
          >
            <img
              src={logoImage}
              alt="Trimit"
              className="trimit-sidebar-logo block h-20 w-auto select-none scale-125 origin-center"
            />
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="trimit-sidebar-user w-full mb-6 rounded-xl border p-3 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Foto de perfil"
                   className="w-10 h-10 rounded-full object-cover border trimit-sidebar-border"
                />
              ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--trimit-app-accent)] text-white flex items-center justify-center text-sm font-semibold">
                  {userInitials || "U"}
                </div>
              )}
              <div className="min-w-0">
                 <p className="trimit-sidebar-text text-sm font-medium truncate">{userName}</p>
                 <p className="trimit-sidebar-text-muted text-xs truncate">{userEmail}</p>
              </div>
            </div>
          </button>

          {/* Menu Sections */}
          <nav className="space-y-6">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                 <p className="trimit-sidebar-section px-3 text-xs font-semibold uppercase tracking-wider mb-3">
                  {section.title}
                </p>
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => navigate(item.path)}
                      className={`
                        motion-nav-button
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        text-sm font-medium transition-all duration-300
                        transform hover:translate-x-1
                        ${
                          active
                             ? "trimit-sidebar-item-active"
                             : "trimit-sidebar-item"
                         }
                       `}
                    >
                      <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="trimit-sidebar-bottom sticky bottom-0 p-6 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={() => navigate("/settings")}
            className={`motion-nav-button w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium transform hover:translate-x-1 ${
              isActive("/settings")
                ? "trimit-sidebar-item-active"
                : "trimit-sidebar-item"
             }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>

          <button
            onClick={toggleTheme}
            className="motion-nav-button trimit-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium transform hover:translate-x-1"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Modo oscuro</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="motion-nav-button trimit-sidebar-item trimit-sidebar-item-danger w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium transform hover:translate-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-content pt-16 md:pt-0 md:ml-64 flex-1 min-h-screen">
        <PageTransition>
          <Outlet />
        </PageTransition>
        <PageGuideButton />
        <PageTourOverlay />
        <AchievementsWatcher />
      </main>
    </div>
  );
}
