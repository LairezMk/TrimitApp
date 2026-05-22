import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, FileText, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserPayments, type UserPayment } from "../services/payments";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState } from "../components/PageStates";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("es-CO", { month: "short" });
}

function createCsvContent(payments: UserPayment[]) {
  const headers = ["Fecha", "Suscripción", "Categoría", "Monto", "Moneda", "Estado", "Origen"];
  const rows = payments.map((p) => [
    p.paymentDate.toISOString().slice(0, 10),
    p.subscriptionName,
    p.category,
    p.amount.toFixed(2),
    p.currency,
    p.status,
    p.source,
  ]);
  return [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function Reports() {
  const { user } = useAuth();
  const { formatMoney, convertMoney } = useCurrencyDisplay();
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubPayments = subscribeToUserPayments(
      user.uid,
      (data) => setPayments(data),
      (err) => setError(err.message),
    );
    const unsubSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      (data) => setSubscriptions(data),
      (err) => setError(err.message),
    );

    return () => {
      unsubPayments();
      unsubSubscriptions();
    };
  }, [user]);

  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: monthKey(date),
        month: monthLabel(date),
        actual: 0,
      };
    });
    const byKey = new Map(months.map((m) => [m.key, m]));

    for (const payment of payments.filter((entry) => entry.status === "paid")) {
      const key = monthKey(payment.paymentDate);
      const target = byKey.get(key);
      if (target) {
        target.actual += convertMoney(payment.amount, payment.currency);
      }
    }

    return months.map((month, index, arr) => ({
      month: month.month,
      actual: Number(month.actual.toFixed(2)),
      previous: Number((arr[index - 1]?.actual || 0).toFixed(2)),
    }));
  }, [payments]);

  const totalCurrentMonth = monthlyComparison[monthlyComparison.length - 1]?.actual || 0;
  const totalPreviousMonth = monthlyComparison[monthlyComparison.length - 2]?.actual || 0;
  const monthVariation =
    totalPreviousMonth > 0
      ? ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth) * 100
      : 0;

  const quarterTotal = monthlyComparison.slice(-3).reduce((sum, item) => sum + item.actual, 0);
  const yearlyPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, payment) => sum + convertMoney(payment.amount, payment.currency), 0);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const payment of payments.filter((entry) => entry.status === "paid")) {
      totals.set(
        payment.category,
        (totals.get(payment.category) || 0) + convertMoney(payment.amount, payment.currency),
      );
    }
    const total = Array.from(totals.values()).reduce((sum, amount) => sum + amount, 0);
    const colors = ["bg-red-500", "bg-blue-500", "bg-orange-500", "bg-green-500", "bg-gray-500", "bg-purple-500"];

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: colors[index % colors.length],
      }));
  }, [payments]);

  const projectedMonthly = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((sum, sub) => sum + convertMoney(sub.amount, sub.currency), 0);

  const handleExportCsv = () => {
    const csv = createCsvContent(payments);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-pagos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Reportes</h1>
          <p className="text-gray-500">Análisis detallado basado en tus datos reales</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar reportes"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {!payments.length && !subscriptions.length && (
        <div className="mb-6">
          <EmptyState
            title="No hay datos para reportes"
            description="Registra pagos y suscripciones para generar reportes detallados."
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Reporte Mensual</h3>
              <p className="text-sm text-gray-500">Mes actual</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatMoney(totalCurrentMonth)}
          </p>
          <p
            className={`text-sm flex items-center gap-1 ${
              monthVariation >= 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {monthVariation >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {monthVariation >= 0 ? "+" : ""}
            {monthVariation.toFixed(1)}% vs mes anterior
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Reporte Trimestral</h3>
              <p className="text-sm text-gray-500">Últimos 3 meses</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatMoney(quarterTotal)}
          </p>
          <p className="text-sm text-blue-600">Gasto real trimestral</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Proyección Mensual</h3>
              <p className="text-sm text-gray-500">Suscripciones activas</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatMoney(projectedMonthly)}
          </p>
          <p className="text-sm text-purple-600">Pagos recurrentes estimados</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Comparación Mes a Mes</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#10b981" name="Mes Actual" />
            <Bar dataKey="previous" fill="#93c5fd" name="Mes Anterior" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Desglose por Categoría</h2>

        <div className="space-y-4">
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay pagos suficientes para generar desglose.</p>
          ) : (
            categoryBreakdown.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${category.color} rounded-full`} />
                    <span className="font-medium dark:text-white">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold dark:text-white">{formatMoney(category.amount)}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${category.color} h-full rounded-full`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-slate-600 dark:bg-slate-800">
        <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Resumen anual real</h3>
        <p className="text-sm text-emerald-800 dark:text-emerald-100">
          Has registrado <strong>{formatMoney(yearlyPaid)}</strong> en pagos completados.
        </p>
      </div>
    </div>
  );
}
