import { Button } from "../components/ui/button";
import logoImage from "../../assets/0d23369e4a896d703eefe2aaa97e96c4234407d6.png";
import { useNavigate } from "react-router";
import { useTheme } from "../contexts/ThemeContext";
import { 
  CheckCircle2, 
  TrendingDown, 
  Bell, 
  Calendar, 
  PieChart, 
  Shield,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Eye,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  Menu,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showDevMenu, setShowDevMenu] = useState(false);
  
  const handleCTA = () => {
    // Redirigir al formulario de registro
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScn7fIHROr0874UGZrPLwhJbdRybQ_Q46eiyYZZxsq2s8QXIQ/viewform?usp=header', '_blank');
  };

  const pages = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Suscripciones", path: "/subscriptions" },
    { name: "Agregar Suscripción", path: "/subscriptions/add" },
    { name: "Calendario", path: "/calendar" },
    { name: "Analíticas", path: "/analytics" },
    { name: "Presupuesto", path: "/budget" },
    { name: "Categorías", path: "/categories" },
    { name: "Métodos de Pago", path: "/payment-methods" },
    { name: "Pagos", path: "/payments" },
    { name: "Reportes", path: "/reports" },
    { name: "Tendencias", path: "/trends" },
    { name: "Recomendaciones", path: "/recommendations" },
    { name: "Recordatorios", path: "/reminders" },
    { name: "Notificaciones", path: "/notifications" },
    { name: "Calculadora", path: "/calculator" },
    { name: "Archivados", path: "/archived" },
    { name: "Compartir", path: "/sharing" },
    { name: "Perfil", path: "/profile" },
    { name: "Configuración", path: "/settings" },
    { name: "Ayuda", path: "/help" },
  ];

  const features = [
    {
      icon: Eye,
      title: "Visibilidad Total",
      description: "Ve todas tus suscripciones en un solo lugar. Netflix, Spotify, gimnasios... todo junto, sin sorpresas."
    },
    {
      icon: Bell,
      title: "Alertas Antes de Cada Cobro",
      description: "Te avisamos 3 días antes de cada renovación. Así puedes cancelar a tiempo y no perder más dinero."
    },
    {
      icon: BarChart3,
      title: "Reportes Visuales",
      description: "Gráficos simples que te muestran dónde se va tu plata cada mes y qué puedes recortar."
    },
    {
      icon: Calendar,
      title: "Calendario de Cobros",
      description: "Mira en un calendario cuándo y cuánto te van a cobrar. Planea tu mes sin sustos."
    },
    {
      icon: Target,
      title: "Metas de Ahorro",
      description: "Define cuánto quieres gastar al mes en suscripciones y recibe alertas si te pasas del límite."
    },
    {
      icon: Lightbulb,
      title: "Recomendaciones Inteligentes",
      description: "Te sugerimos qué suscripciones cancelar según lo que realmente usas. Ahorro automático."
    }
  ];

  const stats = [
    { number: "$280.000", label: "Ahorro promedio anual" },
    { number: "4-5", label: "Suscripciones promedio por persona" }
  ];

  const steps = [
    {
      number: "01",
      title: "Agrega tus suscripciones",
      description: "Manual o automático. Solo toma 2 minutos."
    },
    {
      number: "02",
      title: "Trimit las organiza",
      description: "Detectamos cobros duplicados y servicios que no usas."
    },
    {
      number: "03",
      title: "Empieza a ahorrar",
      description: "Cancela lo que no necesitas y recupera tu dinero."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Floating Dev Menu Button */}
      <button
        onClick={() => setShowDevMenu(!showDevMenu)}
        className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110"
        title="Menú de Desarrollo"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Dev Menu Overlay */}
      {showDevMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDevMenu(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">🚀 Menú de Desarrollo - Todas las Páginas</h2>
              <button
                onClick={() => setShowDevMenu(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pages.map((page) => (
                <button
                  key={page.path}
                  onClick={() => {
                    navigate(page.path);
                    setShowDevMenu(false);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg px-4 py-3 text-sm font-medium transition-all hover:scale-105 shadow-lg"
                >
                  {page.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 transition-colors">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center py-2 md:py-3">
            {/* Logo - versión clara */}
            <img src={logoImage} alt="Trimit" className="h-16 sm:h-20 md:h-32 lg:h-36 w-auto dark:hidden" />
            {/* Logo - versión oscura con letras blancas */}
            <img src={logoImage} alt="Trimit" className="h-16 sm:h-20 md:h-32 lg:h-36 w-auto hidden dark:block" style={{ filter: 'brightness(0) saturate(100%) invert(95%) sepia(100%) saturate(0%) hue-rotate(180deg) brightness(103%) contrast(103%)' }} />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                Características
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                Cómo funciona
              </a>
              <a href="#benefits" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                Beneficios
              </a>
              <a href="#team" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                Nuestro Equipo
              </a>
            </nav>
            <div className="flex gap-2 md:gap-3 items-center">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 md:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                )}
              </button>
              
              <button
                className="hidden sm:block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 md:px-6 py-1.5 md:py-2.5 text-sm md:text-lg"
                onClick={() => navigate('/subscriptions')}
              >
                Iniciar sesión
              </button>
              <Button
                onClick={handleCTA}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 sm:px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg shadow-lg shadow-emerald-500/30"
              >
                Comenzar gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-48 pb-20 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Diseñado para usuarios en Latinoamérica
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight dark:text-white">
                Deja de perder dinero al mes en suscripciones invisibles
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Trimit detecta automáticamente tus suscripciones, te avisa antes de cada cobro y te ayuda a cancelar lo que no necesitas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleCTA}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-8 py-6 text-lg font-semibold shadow-xl shadow-emerald-500/30"
                >
                  Comenzar gratis
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-600 dark:text-gray-400">Sin tarjeta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-600 dark:text-gray-400">Gratis 30 días</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-600 dark:text-gray-400">Cancela cuando quieras</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Tus Suscripciones</h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { name: "Netflix", category: "Entretenimiento", amount: "$44.900", color: "bg-red-500" },
                    { name: "Spotify", category: "Música", amount: "$24.900", color: "bg-green-500" },
                    { name: "Gym", category: "Salud", amount: "$89.000", color: "bg-orange-500" },
                    { name: "Adobe CC", category: "Productividad", amount: "$95.000", color: "bg-red-600" }
                  ].map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${sub.color} rounded-lg flex items-center justify-center text-white font-semibold`}>
                          {sub.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm dark:text-white">{sub.name}</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{sub.category}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{sub.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-emerald-100 text-sm">Estás gastando cada mes</p>
                      <p className="text-3xl font-bold">$253.800</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-emerald-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">
              Todo lo que necesitas para controlar tus gastos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para ayudarte a ahorrar y gestionar mejor tu dinero
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">Cómo funciona Trimit</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comienza a ahorrar en solo 3 pasos simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-30"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-emerald-500 to-cyan-500">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <h2 className="text-4xl font-bold">
                Recupera el control de tu dinero
              </h2>
              <p className="text-xl text-emerald-50">
                La mayoría de las personas pagan por servicios que no usan. Trimit te ayuda a identificarlos y cancelarlos antes de que drenen tu cuenta.
              </p>
              
              <div className="space-y-4">
                {[
                  "Identifica tus suscripciones automáticamente con tu correo",
                  "Recibe alertas antes de cada renovación",
                  "Compara precios y encuentra alternativas más baratas"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <p className="text-lg">{benefit}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleCTA}
                className="bg-white hover:bg-gray-100 text-emerald-600 rounded-lg px-8 py-6 text-lg font-semibold shadow-xl w-full sm:w-auto"
              >
                Empieza a ahorrar hoy
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "100% Seguro", desc: "Encriptación de nivel bancario" },
                { icon: Zap, title: "Rápido", desc: "Configuración en menos de 2 minutos" },
                { icon: DollarSign, title: "Ahorro Real", desc: "Recupera el control de tus gastos" },
                { icon: Users, title: "Para Todos", desc: "Fácil de usar, sin complicaciones" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                    <Icon className="w-8 h-8 text-white mb-3" />
                    <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                    <p className="text-emerald-100 text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Juntos trabajamos en construir una solución que permita a las personas tener mayor control sobre sus suscripciones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Jonathan Gaviria Ocampo",
                role: "Backend & Pruebas",
                description: "Responsable del desarrollo backend y las pruebas del sistema, asegurando que la plataforma funcione correctamente y que la detección de suscripciones sea confiable."
              },
              {
                name: "Samuel Herrera Marin",
                role: "Frontend & Diseño",
                description: "Encargado del desarrollo frontend y el diseño de la interfaz, trabajando en que la aplicación sea intuitiva, visualmente clara y fácil de usar."
              },
              {
                name: "Juan David Correa",
                role: "Marketing & Estrategia",
                description: "Responsable del marketing, la documentación y la validación del proyecto, enfocándose en analizar el mercado y definir la estrategia del producto."
              }
            ].map((member, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 mx-auto">
                  {member.name.split(' ')[0][0]}{member.name.split(' ')[1][0]}
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 text-center font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              ¿Listo para tomar el control?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están ahorrando dinero con Trimit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleCTA}
                className="bg-white hover:bg-gray-100 text-emerald-600 rounded-lg px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Comenzar gratis
              </Button>
            </div>
            <p className="text-emerald-100 text-sm mt-6">
              Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={logoImage} alt="Trimit" className="h-24 md:h-28 lg:h-32 w-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Control total de tus suscripciones en un solo lugar.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Producto</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Características</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Precios</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Seguridad</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Compañía</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Acerca de</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacidad</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Términos</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© 2026 Trimit. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}