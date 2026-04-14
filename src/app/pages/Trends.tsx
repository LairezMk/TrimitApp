import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { subscribeToUserPayments, type UserPayment } from "../services/payments";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState } from "../components/PageStates";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("es-CO", { month: "short" });
}

export default function Trends() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubSubs = subscribeToUserSubscriptions(
      user.uid,
      (data) => setSubscriptions(data),
      (err) => setError(err.message),
    );
    const unsubPayments = subscribeToUserPayments(
      user.uid,
      (data) => setPayments(data),
      (err) => setError(err.message),
    );

    return () => {
      unsubSubs();
      unsubPayments();
    };
  }, [user]);

  const trendData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 8 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (7 - index), 1);
      return {
        key: monthKey(date),
        month: monthLabel(date),
        gasto: 0,
        subscriptions: 0,
      };
    });

    const lookup = new Map(months.map((month) => [month.key, month]));
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

    for (const payment of payments.filter((entry) => entry.status === "paid")) {
      const key = monthKey(payment.paymentDate);
      const target = lookup.get(key);
      if (target) {
        target.gasto += payment.amount;
      }
    }

    for (const month of months) {
      month.subscriptions = activeSubscriptions.length;
    }

    return months;
  }, [payments, subscriptions]);

  const currentMonth = trendData[trendData.length - 1]?.gasto || 0;
  const previousMonth = trendData[trendData.length - 2]?.gasto || 0;
  const percentageChange =
    previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

  const averageSpend =
    trendData.length > 0
      ? trendData.reduce((sum, item) => sum + item.gasto, 0) / trendData.length
      : 0;
  const monthlyProjectedSpend = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((sum, sub) => sum + sub.amount, 0);

  const minSpendPoint =
    trendData.length > 0 ? trendData.slice().sort((a, b) => a.gasto - b.gasto)[0] : null;
  const maxSpendPoint =
    trendData.length > 0 ? trendData.slice().sort((a, b) => b.gasto - a.gasto)[0] : null;

  const insights = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.status === "active");
    const byCategory = new Map<string, number>();
    for (const sub of active) {
      byCategory.set(sub.category, (byCategory.get(sub.category) || 0) + sub.amount);
    }
    const topCategory = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0];

    const trendType = percentageChange >= 0 ? "increase" : "decrease";
    const changeAmount = Math.abs(currentMonth - previousMonth);

    return [
      {
        type: trendType,
        title: percentageChange >= 0 ? "Incremento mensual" : "Disminución mensual",
        description: `Comparado al mes anterior, el gasto cambió ${percentageChange.toFixed(1)}%.`,
        impact: `${percentageChange >= 0 ? "+" : "-"}$${changeAmount.toFixed(2)}`,
      },
      {
        type: "neutral",
        title: "Categoría dominante",
        description: topCategory
          ? `La categoría con mayor gasto es ${topCategory[0]}.`
          : "Aún no hay categorías con gasto.",
        impact: topCategory ? `$${topCategory[1].toFixed(2)}` : "$0.00",
      },
      {
        type: "neutral",
        title: "Pagos registrados",
        description: `Se han registrado ${payments.length} pagos en total.`,
        impact: `$${payments.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}`,
      },
    ] as const;
  }, [subscriptions, payments, percentageChange, currentMonth, previousMonth]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Tendencias y Análisis</h1>
        <p className="text-gray-500">Patrones basados en tus datos reales</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar tendencias"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {!subscriptions.length && !payments.length && (
        <div className="mb-6">
          <EmptyState
            title="Sin tendencia disponible"
            description="Necesitas suscripciones o pagos para generar análisis de tendencias."
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <Activity className="w-8 h-8 mb-2" />
          <p className="text-emerald-100 text-sm">Gasto este mes</p>
          <p className="text-3xl font-bold">${currentMonth.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-emerald-100 text-sm mt-1">
            {percentageChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange.toFixed(1)}% vs anterior
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Promedio 8 meses</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${averageSpend.toFixed(2)}
          </p>
          <p className="text-gray-400 text-xs mt-1">por mes</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Mes más bajo</p>
          <p className="text-3xl font-bold text-emerald-600">
            ${minSpendPoint?.gasto.toFixed(2) || "0.00"}
          </p>
          <p className="text-gray-400 text-xs mt-1">{minSpendPoint?.month || "--"}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Mes más alto</p>
          <p className="text-3xl font-bold text-red-600">
            ${maxSpendPoint?.gasto.toFixed(2) || "0.00"}
          </p>
          <p className="text-gray-400 text-xs mt-1">{maxSpendPoint?.month || "--"}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Evolución de Gastos</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="gasto"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Insights del Mes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {insights.map((insight, index) => (
            <div
              key={`${insight.title}-${index}`}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3 mb-3">
                {insight.type === "increase" ? (
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  </div>
                ) : insight.type === "decrease" ? (
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 dark:text-white">{insight.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {insight.description}
                  </p>
                  <p className="text-lg font-bold text-emerald-600">{insight.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Número de Suscripciones</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="subscriptions"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-purple-200 dark:border-slate-600">
        <div className="flex items-start gap-4">
          <Calendar className="w-8 h-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
              Predicción para el próximo mes
            </h3>
            <p className="text-purple-800 dark:text-purple-100 text-sm">
              Según tus pagos recientes y suscripciones activas, el gasto estimado para el
              siguiente mes es de{" "}
              <span className="font-bold">${(averageSpend + monthlyProjectedSpend * 0.15).toFixed(2)}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
