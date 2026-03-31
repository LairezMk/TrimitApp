import { Outlet, useNavigate, useLocation } from "react-router";
import logoImage from "../../assets/0d23369e4a896d703eefe2aaa97e96c4234407d6.png";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Target,
  BarChart3,
  TrendingUp,
  FileText,
  Tag,
  Users,
  Archive,
  Clock,
  Lightbulb,
  Calculator,
  Bell,
  LogOut,
  Moon,
  Sun,
  Home,
  Plus,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: LayoutDashboard, label: "Suscripciones", path: "/subscriptions" },
        { icon: Calendar, label: "Calendario", path: "/calendar" },
        { icon: CreditCard, label: "Pagos", path: "/payments" },
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
        { icon: Tag, label: "Categorías", path: "/categories" },
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
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black shadow-2xl z-50 overflow-y-auto transition-all duration-300">
        <div className="p-6">
          {/* Logo */}
          <div 
            className="mb-8 cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/")}
          >
            <img 
              src={logoImage} 
              alt="Trimit" 
              className="h-12 w-auto mx-auto brightness-0 invert" 
            />
          </div>

          {/* Menu Sections */}
          <nav className="space-y-6">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        text-sm font-medium transition-all duration-300
                        transform hover:translate-x-1
                        ${
                          active
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                            : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
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
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 to-transparent border-t border-slate-700/50 p-6 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 text-sm font-medium transform hover:translate-x-1"
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
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 text-sm font-medium transform hover:translate-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
