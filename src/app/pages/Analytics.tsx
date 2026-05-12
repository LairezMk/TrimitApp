import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { subscribeToUserPayments, type UserPayment } from "../services/payments";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

const CATEGORY_COLORS = ["#ef4444", "#3b82f6", "#f97316", "#22c55e", "#8b5cf6", "#06b6d4"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("es-CO", { month: "short" });
}

export default function Analytics() {
  const { user } = useAuth();
  const { formatMoney } = useCurrencyDisplay();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubSubs = subscribeToUserSubscriptions(
      user.uid,
      (data) => setSubscriptions(data),
      (err) => setError(err.message),
    );

    const unsubPayments = subscribeToUserPayments(
      user.uid,
      (data) => {
        setPayments(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      unsubSubs();
      unsubPayments();
    };
  }, [user]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "active"),
    [subscriptions],
  );

  const monthlyProjectedSpend = useMemo(
    () => activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
    [activeSubscriptions],
  );

  const paidTotal = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const sub of activeSubscriptions) {
      grouped.set(sub.category, (grouped.get(sub.category) || 0) + sub.amount);
    }

    return Array.from(grouped.entries()).map(([name, value], index) => ({
      name,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [activeSubscriptions]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
      return {
        key: monthKey(date),
        month: monthLabel(date),
        gasto: 0,
      };
    });

    const map = new Map(months.map((item) => [item.key, item]));

    for (const payment of payments.filter((entry) => entry.status === "paid")) {
      const key = monthKey(payment.paymentDate);
      const target = map.get(key);
      if (target) {
        target.gasto += payment.amount;
      }
    }

    return months;
  }, [payments]);

  const avgMonthlyPaid = useMemo(() => {
    if (!monthlyData.length) {
      return 0;
    }
    const sum = monthlyData.reduce((acc, row) => acc + row.gasto, 0);
    return sum / monthlyData.length;
  }, [monthlyData]);

  const highestCategory = useMemo(() => {
    if (!categoryData.length) {
      return null;
    }
    return categoryData.slice().sort((a, b) => b.value - a.value)[0];
  }, [categoryData]);

  const currentMonth = monthlyData[monthlyData.length - 1]?.gasto || 0;
  const previousMonth = monthlyData[monthlyData.length - 2]?.gasto || 0;
  const monthVariation =
    previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Análisis y Estadísticas</h1>
        <p className="text-gray-500">Visualiza tus gastos y patrones reales</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar estadísticas"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <LoadingState title="Cargando estadísticas..." />
        </div>
      )}

      {!loading && !activeSubscriptions.length && !payments.length && (
        <div className="mb-6">
          <EmptyState
            title="Aún no hay datos para estadísticas"
            description="Agrega suscripciones y registra pagos para ver gráficos y métricas reales."
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-emerald-100 text-sm">Gasto mensual proyectado</p>
          <p className="text-3xl font-bold">{formatMoney(monthlyProjectedSpend, "COP")}</p>
          <p className="text-emerald-100 text-xs mt-2">
            {activeSubscriptions.length} suscripciones activas
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-500 text-sm">Promedio mensual pagado</p>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(avgMonthlyPaid, "COP")}</p>
          <p className="text-gray-500 text-xs mt-2">Últimos 6 meses</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-500 text-sm">Pagos registrados</p>
          <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
          <p className="text-gray-500 text-xs mt-2">Total pagado: {formatMoney(paidTotal, "COP")}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <PieChartIcon className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-gray-500 text-sm">Mayor categoría</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatMoney(highestCategory?.value || 0, "COP")}
          </p>
          <p className="text-gray-500 text-xs mt-2">{highestCategory?.name || "Sin datos"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Tendencia mensual (pagos reales)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="gasto" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Distribución por categoría activa</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Comparación de gastos mensuales</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="gasto" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>

        <p className="mt-4 text-sm text-gray-600">
          Variación del mes actual vs anterior:{" "}
          <span className={monthVariation >= 0 ? "text-emerald-600" : "text-red-600"}>
            {monthVariation >= 0 ? "+" : ""}
            {monthVariation.toFixed(1)}%
          </span>
        </p>
      </div>

    </div>
  );
}
