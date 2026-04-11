import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  Calendar,
  TrendingDown,
  TrendingUp,
  Filter,
} from "lucide-react";
import type { Subscription } from "../types/subscription";

interface Payment {
  id: string;
  subscription: Subscription;
  date: Date;
  amount: number;
  status: "paid" | "upcoming";
}

// Mock data - Pagos pasados
const PAST_PAYMENTS: Payment[] = [
  {
    id: "p1",
    subscription: {
      id: "1",
      name: "Netflix",
      category: "Entretenimiento",
      amount: 19.61,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-28"),
      icon: "N",
      color: "bg-red-500",
    },
    date: new Date("2026-01-28"),
    amount: 19.61,
    status: "paid",
  },
  {
    id: "p2",
    subscription: {
      id: "6",
      name: "Amazon Prime",
      category: "Entretenimiento",
      amount: 14.99,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-22"),
      icon: "A",
      color: "bg-sky-500",
    },
    date: new Date("2026-01-22"),
    amount: 14.99,
    status: "paid",
  },
  {
    id: "p3",
    subscription: {
      id: "8",
      name: "Notion",
      category: "Productividad",
      amount: 10.0,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-27"),
      icon: "N",
      color: "bg-gray-800",
    },
    date: new Date("2026-01-27"),
    amount: 10.0,
    status: "paid",
  },
  {
    id: "p4",
    subscription: {
      id: "2",
      name: "Gym Active",
      category: "Salud",
      amount: 10.4,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-03-05"),
      icon: "G",
      color: "bg-orange-500",
    },
    date: new Date("2026-02-05"),
    amount: 10.4,
    status: "paid",
  },
  {
    id: "p5",
    subscription: {
      id: "4",
      name: "Adobe Creative Cloud",
      category: "Productividad",
      amount: 54.99,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-03-01"),
      icon: "A",
      color: "bg-red-600",
    },
    date: new Date("2026-02-01"),
    amount: 54.99,
    status: "paid",
  },
  {
    id: "p6",
    subscription: {
      id: "1",
      name: "Netflix",
      category: "Entretenimiento",
      amount: 19.61,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-28"),
      icon: "N",
      color: "bg-red-500",
    },
    date: new Date("2025-12-28"),
    amount: 19.61,
    status: "paid",
  },
];

// Mock data - Pagos futuros
const UPCOMING_PAYMENTS: Payment[] = [
  {
    id: "u1",
    subscription: {
      id: "6",
      name: "Amazon Prime",
      category: "Entretenimiento",
      amount: 14.99,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-22"),
      icon: "A",
      color: "bg-sky-500",
    },
    date: new Date("2026-02-22"),
    amount: 14.99,
    status: "upcoming",
  },
  {
    id: "u2",
    subscription: {
      id: "3",
      name: "Disney+",
      category: "Entretenimiento",
      amount: 21.96,
      currency: "$",
      status: "forgotten",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-25"),
      icon: "D",
      color: "bg-blue-600",
    },
    date: new Date("2026-02-25"),
    amount: 21.96,
    status: "upcoming",
  },
  {
    id: "u3",
    subscription: {
      id: "8",
      name: "Notion",
      category: "Productividad",
      amount: 10.0,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-27"),
      icon: "N",
      color: "bg-gray-800",
    },
    date: new Date("2026-02-27"),
    amount: 10.0,
    status: "upcoming",
  },
  {
    id: "u4",
    subscription: {
      id: "1",
      name: "Netflix",
      category: "Entretenimiento",
      amount: 19.61,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-02-28"),
      icon: "N",
      color: "bg-red-500",
    },
    date: new Date("2026-02-28"),
    amount: 19.61,
    status: "upcoming",
  },
  {
    id: "u5",
    subscription: {
      id: "4",
      name: "Adobe Creative Cloud",
      category: "Productividad",
      amount: 54.99,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-03-01"),
      icon: "A",
      color: "bg-red-600",
    },
    date: new Date("2026-03-01"),
    amount: 54.99,
    status: "upcoming",
  },
  {
    id: "u6",
    subscription: {
      id: "2",
      name: "Gym Active",
      category: "Salud",
      amount: 10.4,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-03-05"),
      icon: "G",
      color: "bg-orange-500",
    },
    date: new Date("2026-03-05"),
    amount: 10.4,
    status: "upcoming",
  },
  {
    id: "u7",
    subscription: {
      id: "5",
      name: "Spotify",
      category: "Música",
      amount: 9.99,
      currency: "$",
      status: "suspended",
      isRecurring: true,
      nextPaymentDate: new Date("2026-03-10"),
      icon: "S",
      color: "bg-green-500",
    },
    date: new Date("2026-03-10"),
    amount: 9.99,
    status: "upcoming",
  },
  {
    id: "u8",
    subscription: {
      id: "7",
      name: "YouTube Premium",
      category: "Entretenimiento",
      amount: 11.99,
      currency: "$",
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date("2026-03-15"),
      icon: "Y",
      color: "bg-red-500",
    },
    date: new Date("2026-03-15"),
    amount: 11.99,
    status: "upcoming",
  },
];

export default function Payments() {
  const [filter, setFilter] = useState<"all" | "paid" | "upcoming">("all");

  // Combinar y ordenar todos los pagos por fecha
  const allPayments = [...PAST_PAYMENTS, ...UPCOMING_PAYMENTS].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const filteredPayments =
    filter === "all"
      ? allPayments
      : allPayments.filter((p) => p.status === filter);

  const totalPaid = PAST_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  const totalUpcoming = UPCOMING_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);

  const getDaysUntilPayment = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Historial de Pagos</h1>
        <p className="text-gray-500">
          Revisa tus pagos realizados y los próximos programados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Total pagado</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl text-red-600">${totalPaid.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {PAST_PAYMENTS.length} pagos realizados
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Próximos pagos</p>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl text-emerald-600">${totalUpcoming.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {UPCOMING_PAYMENTS.length} pagos programados
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-sm text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-100 text-sm">Próximo pago</p>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl">
            {getDaysUntilPayment(UPCOMING_PAYMENTS[0].date)} días
          </p>
          <p className="text-xs text-emerald-100 mt-1">
            {UPCOMING_PAYMENTS[0].subscription.name} - $
            {UPCOMING_PAYMENTS[0].amount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Filtrar por:</span>
          </div>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filter === "all" ? "bg-white dark:bg-gray-800 shadow-sm dark:text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filter === "paid" ? "bg-white dark:bg-gray-800 shadow-sm dark:text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Pagados
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filter === "upcoming" ? "bg-white dark:bg-gray-800 shadow-sm dark:text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Payments Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl dark:text-white">Cronología de Pagos</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredPayments.map((payment, index) => {
            const isUpcoming = payment.status === "upcoming";
            const daysUntil = isUpcoming
              ? getDaysUntilPayment(payment.date)
              : null;

            return (
              <div
                key={payment.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isUpcoming ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isUpcoming
                          ? "bg-emerald-100 text-emerald-600"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {isUpcoming ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>
                    {index < filteredPayments.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Subscription info */}
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${payment.subscription.color} rounded-xl flex items-center justify-center text-white text-lg`}
                      >
                        {payment.subscription.icon}
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-white">
                          {payment.subscription.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.subscription.category}
                        </p>
                      </div>
                    </div>

                    {/* Date and amount */}
                    <div className="text-right">
                      <p className="font-medium text-lg dark:text-white">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(payment.date, "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      {isUpcoming && daysUntil !== null && (
                        <p
                          className={`text-xs mt-1 ${
                            daysUntil <= 3
                              ? "text-red-600 font-medium"
                              : daysUntil <= 7
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {daysUntil === 0
                            ? "Hoy"
                            : daysUntil === 1
                            ? "Mañana"
                            : daysUntil < 0
                            ? "Vencido"
                            : `En ${daysUntil} días`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isUpcoming
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {isUpcoming ? "Programado" : "Pagado"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary footer */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-emerald-100 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Total de pagos mostrados
            </p>
            <p className="text-2xl dark:text-white">
              $
              {filteredPayments
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Cantidad de pagos</p>
            <p className="text-2xl dark:text-white">{filteredPayments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
