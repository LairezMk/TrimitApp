import { useEffect, useMemo, useState } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Calendar,
  CreditCard,
  PieChart,
  Plus
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import type { Subscription } from "../types/subscription";
import { EmptyState, LoadingState } from "../components/PageStates";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const totalMonthly = subscriptions
    .filter((s) => s.status !== "suspended")
    .reduce((acc, s) => acc + s.amount, 0);

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const forgottenCount = subscriptions.filter((s) => s.status === "forgotten").length;

  const recentSubscriptions = useMemo(
    () =>
      [...subscriptions]
        .sort(
          (a, b) =>
            a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime(),
        )
        .slice(0, 4),
    [subscriptions],
  );

  const stats = [
    {
      title: "Gasto mensual total",
      value: `$${totalMonthly.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: loading ? "Cargando..." : `${subscriptions.length} suscripciones registradas`,
      changeType: "positive"
    },
    {
      title: "Suscripciones activas",
      value: String(activeCount),
      icon: CreditCard,
      color: "bg-blue-500",
      change: "Estado activo",
      changeType: "neutral"
    },
    {
      title: "Suscripciones olvidadas",
      value: String(forgottenCount),
      icon: Calendar,
      color: "bg-amber-500",
      change: "Requiere atención",
      changeType: "warning"
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        data-tour="dashboard-header"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de Control
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y controla todas tus suscripciones en un solo lugar
          </p>
        </div>
        <Button
          onClick={() => navigate("/subscriptions/add")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Suscripción
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6" data-tour="dashboard-stats">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={idx} 
              className="motion-card-grow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white dark:bg-slate-900/70 border border-gray-100 dark:border-white/70"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'warning' ? 'text-amber-600' :
                      'text-gray-600'
                    }`}>
                      {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Subscriptions */}
      <Card
        className="shadow-lg bg-white dark:bg-slate-900/70 border border-gray-100 dark:border-white/70"
        data-tour="dashboard-recent"
      >
        <CardHeader className="border-b border-gray-100 dark:border-white/20">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold dark:text-white">
              Suscripciones Recientes
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => navigate("/subscriptions")}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Ver todas <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {loading && <LoadingState title="Cargando suscripciones..." />}
            {recentSubscriptions.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-white/15 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate("/subscriptions")}
              >
                <div className="flex items-center gap-4">
                  <div className={`${sub.color} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {sub.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {sub.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sub.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${sub.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs ${
                    sub.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {sub.status === "active" ? "Activa" : sub.status === "forgotten" ? "Olvidada" : "Suspendida"}
                  </p>
                </div>
              </div>
            ))}
            {!loading && recentSubscriptions.length === 0 && (
              <EmptyState
                title="Aún no tienes suscripciones"
                description="Registra una suscripción para desbloquear el resumen del dashboard."
                actionLabel="Crear suscripción"
                onAction={() => navigate("/subscriptions/add")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6" data-tour="dashboard-actions">
        <Card 
          className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-slate-900/70 dark:to-slate-800/70 border border-gray-100 dark:border-white/70"
          onClick={() => navigate("/calendar")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-4 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Calendario de Pagos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Próximo pago en 3 días
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900/70 dark:to-slate-800/70 border border-gray-100 dark:border-white/70"
          onClick={() => navigate("/analytics")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-4 rounded-xl">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Análisis Detallado
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualiza tus gastos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
