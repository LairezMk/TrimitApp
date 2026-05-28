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

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function sanitizePdfText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfLine(text: string, maxLength = 88) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function createPdfDocument(lines: Array<{ text: string; size?: number; gap?: number }>) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 48;
  const bottomMargin = 48;
  const pages: string[] = [];
  let y = pageHeight - margin;
  let streamLines: string[] = [];

  const flushPage = () => {
    pages.push(`BT\n${streamLines.join("\n")}\nET`);
    streamLines = [];
    y = pageHeight - margin;
  };

  for (const line of lines) {
    const size = line.size ?? 10;
    const leading = Math.ceil(size * 1.45) + (line.gap ?? 0);

    if (y - leading < bottomMargin && streamLines.length) {
      flushPage();
    }

    streamLines.push(`/F1 ${size} Tf 1 0 0 1 ${margin} ${y} Tm (${sanitizePdfText(line.text)}) Tj`);
    y -= leading;
  }

  if (streamLines.length) {
    flushPage();
  }

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const pageIds: number[] = [];
  let nextId = 4;

  pages.forEach((stream) => {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const maxObjectId = nextId - 1;
  const offsets = Array(maxObjectId + 1).fill(0);
  let pdf = "%PDF-1.4\n";

  for (let id = 1; id <= maxObjectId; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${maxObjectId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxObjectId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
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
    downloadBlob(csv, "reporte-pagos.csv", "text/csv;charset=utf-8;");
  };

  const handleExportPdf = () => {
    const generatedAt = new Date();
    const lines: Array<{ text: string; size?: number; gap?: number }> = [
      { text: "Trimit - Reporte financiero", size: 18, gap: 8 },
      {
        text: `Generado el ${generatedAt.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`,
        size: 10,
        gap: 12,
      },
      { text: "Resumen", size: 14, gap: 4 },
      { text: `Reporte mensual: ${formatMoney(totalCurrentMonth)}` },
      { text: `Reporte trimestral: ${formatMoney(quarterTotal)}` },
      { text: `Proyeccion mensual: ${formatMoney(projectedMonthly)}` },
      { text: `Variacion frente al mes anterior: ${monthVariation >= 0 ? "+" : ""}${monthVariation.toFixed(1)}%`, gap: 12 },
      { text: "Desglose por categoria", size: 14, gap: 4 },
    ];

    if (categoryBreakdown.length) {
      categoryBreakdown.forEach((category) => {
        lines.push({
          text: `${category.name}: ${formatMoney(category.amount)} (${category.percentage.toFixed(1)}%)`,
        });
      });
    } else {
      lines.push({ text: "Aun no hay pagos suficientes para generar desglose." });
    }

    lines.push({ text: "Suscripciones activas", size: 14, gap: 4 });
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").slice(0, 14);
    if (activeSubscriptions.length) {
      activeSubscriptions.forEach((subscription) => {
        lines.push({
          text: `${subscription.name} - ${subscription.category} - ${formatMoney(convertMoney(subscription.amount, subscription.currency))}`,
        });
      });
    } else {
      lines.push({ text: "No hay suscripciones activas registradas." });
    }

    lines.push({ text: "Pagos recientes", size: 14, gap: 4 });
    const recentPayments = [...payments]
      .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
      .slice(0, 18);

    if (recentPayments.length) {
      recentPayments.forEach((payment) => {
        const paymentLine = `${payment.paymentDate.toLocaleDateString("es-CO")} - ${payment.subscriptionName} - ${payment.category} - ${formatMoney(
          convertMoney(payment.amount, payment.currency),
        )} - ${payment.status}`;
        wrapPdfLine(paymentLine).forEach((text) => lines.push({ text }));
      });
    } else {
      lines.push({ text: "No hay pagos registrados todavia." });
    }

    const pdf = createPdfDocument(lines);
    const filename = `reporte-trimit-${generatedAt.toISOString().slice(0, 10)}.pdf`;
    downloadBlob(pdf, filename, "application/pdf");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Reportes</h1>
          <p className="text-gray-500">Análisis detallado basado en tus datos reales</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-cyan-700"
          >
            <FileText className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-white shadow-lg transition-colors hover:bg-emerald-600"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
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
