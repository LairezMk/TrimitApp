import { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import logoImage from "../../../assets/0d23369e4a896d703eefe2aaa97e96c4234407d6.png";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../ui/button";

interface MarketingPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const footerGroups = [
  {
    title: "Producto",
    links: [
      { label: "Caracteristicas", to: "/features" },
      { label: "Seguridad", to: "/security" },
    ],
  },
  {
    title: "Compania",
    links: [
      { label: "Acerca de", to: "/about" },
      { label: "Blog", to: "/blog" },
      { label: "Contacto", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", to: "/privacy" },
      { label: "Terminos", to: "/terms" },
      { label: "Cookies", to: "/cookies" },
    ],
  },
];

export default function MarketingPageLayout({
  title,
  subtitle,
  children,
}: MarketingPageLayoutProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors motion-page">
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/")}
              title="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={logoImage} alt="Trimit" className="h-16 sm:h-20 w-auto dark:hidden" />
              <img
                src={logoImage}
                alt="Trimit"
                className="h-16 sm:h-20 w-auto hidden dark:block"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(95%) sepia(100%) saturate(0%) hue-rotate(180deg) brightness(103%) contrast(103%)",
                }}
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="motion-nav-button p-2 md:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              )}
            </button>
            <Button
              onClick={() => navigate("/auth")}
              className="motion-nav-button bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 sm:px-6 py-2"
            >
              Iniciar sesion
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
          <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl animate-pulse [animation-delay:1.2s]" />
          <div className="container mx-auto px-4 lg:px-8 py-16 sm:py-20 relative">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight dark:text-white motion-stagger-item">
              {title}
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl motion-stagger-item [animation-delay:100ms]">
              {subtitle}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-10 sm:py-14">{children}</section>
      </main>

      <footer className="py-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <img src={logoImage} alt="Trimit" className="h-20 w-auto mb-3 dark:hidden" />
              <img
                src={logoImage}
                alt="Trimit"
                className="h-20 w-auto mb-3 hidden dark:block"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(95%) sepia(100%) saturate(0%) hue-rotate(180deg) brightness(103%) contrast(103%)",
                }}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion clara de suscripciones para personas y equipos.
              </p>
            </div>

            {footerGroups.map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold mb-3 dark:text-white">{group.title}</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {group.links.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            © 2026 Trimit. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
