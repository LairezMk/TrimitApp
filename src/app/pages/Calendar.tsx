import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";
import { useAuth } from "../contexts/AuthContext";
import {
  createUserPayment,
  subscribeToUserPayments,
  type UserPayment,
} from "../services/payments";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import type { Subscription } from "../types/subscription";

type DisplayPayment = {
  id: string;
  subscription: Subscription;
  date: Date;
  amount: number;
  status: "paid" | "upcoming";
  source: "manual" | "projected" | "imported";
};

function toCurrencySymbol(currency: string) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "EUR ";
  if (currency === "COP") return "COP ";
  return `${currency} `;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export default function Calendar() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "upcoming">("all");

  const [newSubscriptionId, setNewSubscriptionId] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    let subscriptionsReady = false;
    let paymentsReady = false;
    const finishLoadingIfReady = () => {
      if (subscriptionsReady && paymentsReady) {
        setLoading(false);
      }
    };

    const unsubscribeSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data);
        if (!newSubscriptionId && data.length > 0) {
          setNewSubscriptionId(data[0].id);
          setNewAmount(String(data[0].amount));
        }
        subscriptionsReady = true;
        finishLoadingIfReady();
      },
      (err) => {
        setError(err.message);
        subscriptionsReady = true;
        finishLoadingIfReady();
      },
    );

    const unsubscribePayments = subscribeToUserPayments(
      user.uid,
      (data) => {
        setPayments(data);
        paymentsReady = true;
        finishLoadingIfReady();
      },
      (err) => {
        setError(err.message);
        paymentsReady = true;
        finishLoadingIfReady();
      },
    );

    return () => {
      unsubscribeSubscriptions();
      unsubscribePayments();
    };
  }, [user, newSubscriptionId]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "active"),
    [subscriptions],
  );

  const paidTimeline = useMemo<DisplayPayment[]>(
    () =>
      payments.map((payment) => ({
        id: payment.id,
        subscription:
          subscriptions.find((sub) => sub.id === payment.subscriptionId) || {
            id: payment.subscriptionId,
            name: payment.subscriptionName,
            category: payment.category,
            amount: payment.amount,
            currency: payment.currency,
            status: "active",
            isRecurring: true,
            nextPaymentDate: payment.paymentDate,
            icon: payment.subscriptionName.charAt(0).toUpperCase() || "S",
            color: "bg-emerald-500",
          },
        date: payment.paymentDate,
        amount: payment.amount,
        status: "paid",
        source: payment.source,
      })),
    [payments, subscriptions],
  );

  const upcomingProjected = useMemo<DisplayPayment[]>(
    () =>
      activeSubscriptions.map((subscription) => ({
        id: `projected-${subscription.id}`,
        subscription,
        date: subscription.nextPaymentDate,
        amount: subscription.amount,
        status: "upcoming",
        source: "projected",
      })),
    [activeSubscriptions],
  );

  const allPayments = useMemo(
    () =>
      [...paidTimeline, ...upcomingProjected].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      ),
    [paidTimeline, upcomingProjected],
  );

  const filteredPayments =
    filter === "all" ? allPayments : allPayments.filter((payment) => payment.status === filter);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const getUpcomingForDate = (date: Date) =>
    upcomingProjected.filter((payment) => isSameDay(payment.date, date));

  const getPaidForDate = (date: Date) =>
    paidTimeline.filter((payment) => isSameDay(payment.date, date));

  const getTotalForDate = (date: Date) =>
    [...getUpcomingForDate(date), ...getPaidForDate(date)].reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

  const previousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days: Array<number | null> = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedUpcoming = selectedDate ? getUpcomingForDate(selectedDate) : [];
  const selectedPaid = selectedDate ? getPaidForDate(selectedDate) : [];
  const selectedDayTotal = [...selectedUpcoming, ...selectedPaid].reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const monthlyUpcoming = useMemo(
    () =>
      upcomingProjected.filter(
        (payment) =>
          payment.date.getMonth() === currentDate.getMonth() &&
          payment.date.getFullYear() === currentDate.getFullYear(),
      ),
    [upcomingProjected, currentDate],
  );
  const monthlyPaid = useMemo(
    () =>
      paidTimeline.filter(
        (payment) =>
          payment.date.getMonth() === currentDate.getMonth() &&
          payment.date.getFullYear() === currentDate.getFullYear(),
      ),
    [paidTimeline, currentDate],
  );

  const totalPaid = paidTimeline.reduce((sum, payment) => sum + payment.amount, 0);
  const totalUpcoming = upcomingProjected.reduce((sum, payment) => sum + payment.amount, 0);
  const nextUpcoming = upcomingProjected
    .slice()
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const getDaysUntilPayment = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const hasCalendarData = activeSubscriptions.length > 0 || payments.length > 0;

  const handleAddPayment = async () => {
    if (!user) return;
    const selected = subscriptions.find((subscription) => subscription.id === newSubscriptionId);
    if (!selected || !newAmount || !newDate) return;

    setAddingPayment(true);
    setError(null);
    try {
      await createUserPayment(user.uid, {
        subscriptionId: selected.id,
        subscriptionName: selected.name,
        category: selected.category,
        amount: Number(newAmount),
        currency: selected.currency,
        paymentDate: new Date(newDate),
        source: "manual",
        status: "paid",
      });
    } catch (err) {
      const text = err instanceof Error ? err.message : "No se pudo registrar el pago.";
      setError(text);
    } finally {
      setAddingPayment(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Calendario y Pagos</h1>
        <p className="text-gray-500">
          Gestiona calendario, próximos cobros y pagos realizados en un solo lugar.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar información"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        <div
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          data-tour="calendar-main"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!loading && !hasCalendarData ? (
            <EmptyState
              title="No hay actividad financiera"
              description="Agrega suscripciones activas o registra pagos para llenar el calendario."
            />
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm text-gray-500 py-2">
                    {day}
                  </div>
                ))}

                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day,
                  );
                  const upcomingInDay = getUpcomingForDate(date);
                  const paidInDay = getPaidForDate(date);
                  const hasActivity = upcomingInDay.length > 0 || paidInDay.length > 0;
                  const total = getTotalForDate(date);
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentDate.getMonth() &&
                    selectedDate.getFullYear() === currentDate.getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square p-2 rounded-lg transition-all ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-lg"
                          : hasActivity
                            ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="h-full flex flex-col items-center justify-center">
                        <span className={`text-sm mb-1 ${isSelected ? "text-white" : "text-gray-900"}`}>
                          {day}
                        </span>
                        {hasActivity && (
                          <>
                            <div className="flex gap-1 mb-1">
                              {upcomingInDay.length > 0 && (
                                <span
                                  className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`}
                                  title="Próximos"
                                />
                              )}
                              {paidInDay.length > 0 && (
                                <span
                                  className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-100" : "bg-slate-500"}`}
                                  title="Pagados"
                                />
                              )}
                            </div>
                            <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-emerald-700"}`}>
                              ${total.toFixed(0)}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Próximos pagos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>Pagos registrados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded" />
                    <span>Día seleccionado</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            data-tour="calendar-day-detail"
          >
            <h3 className="font-medium mb-4">
              {selectedDate
                ? `Actividad del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                : "Selecciona un día"}
            </h3>

            {loading ? (
              <LoadingState title="Cargando calendario..." description="Preparando actividad por fecha." />
            ) : selectedDate ? (
              selectedUpcoming.length === 0 && selectedPaid.length === 0 ? (
                <EmptyState
                  title="Sin actividad ese día"
                  description="No hay pagos programados ni registrados para la fecha seleccionada."
                />
              ) : (
                <>
                  {selectedUpcoming.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-600 mb-2">Próximos</p>
                      <div className="space-y-2">
                        {selectedUpcoming.map((payment) => (
                          <div key={payment.id} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                            <div className={`w-9 h-9 ${payment.subscription.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                              {payment.subscription.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{payment.subscription.name}</p>
                              <p className="text-xs text-gray-500 truncate">{payment.subscription.category}</p>
                            </div>
                            <p className="text-sm font-medium">
                              {toCurrencySymbol(payment.subscription.currency)}
                              {payment.amount.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPaid.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wide text-slate-600 mb-2">Pagados</p>
                      <div className="space-y-2">
                        {selectedPaid.map((payment) => (
                          <div key={payment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-9 h-9 ${payment.subscription.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                              {payment.subscription.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{payment.subscription.name}</p>
                              <p className="text-xs text-gray-500 truncate">{payment.subscription.category}</p>
                            </div>
                            <p className="text-sm font-medium">
                              {toCurrencySymbol(payment.subscription.currency)}
                              {payment.amount.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-gray-600">Total del día</span>
                    <span className="text-xl font-medium text-emerald-600">${selectedDayTotal.toFixed(2)}</span>
                  </div>
                </>
              )
            ) : (
              <EmptyState
                title="Selecciona un día"
                description="Elige una fecha del calendario para ver pagos del día."
              />
            )}
          </div>

          <div
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-sm text-white"
            data-tour="calendar-summary"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-medium">Resumen mensual</h3>
            </div>
            <p className="text-2xl mb-2">
              ${monthlyUpcoming.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
            </p>
            <p className="text-emerald-100 text-sm">
              {monthlyUpcoming.length} próximos • {monthlyPaid.length} pagados
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3" data-tour="payments-stats">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-500 text-xs">Total pagado</p>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xl text-red-600">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-500 text-xs">Próximos pagos</p>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl text-emerald-600">${totalUpcoming.toFixed(2)}</p>
              {nextUpcoming && (
                <p className="text-xs text-gray-500 mt-1">
                  {nextUpcoming.subscription.name} • {getDaysUntilPayment(nextUpcoming.date)} días
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8 mb-6"
        data-tour="payments-register"
      >
        <div className="flex items-center gap-3 mb-4">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg">Registrar pago</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={newSubscriptionId}
            onChange={(e) => {
              setNewSubscriptionId(e.target.value);
              const selected = subscriptions.find((sub) => sub.id === e.target.value);
              if (selected) setNewAmount(String(selected.amount));
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
          >
            {subscriptions.map((subscription) => (
              <option key={subscription.id} value={subscription.id}>
                {subscription.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Monto"
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
          />
          <button
            onClick={handleAddPayment}
            disabled={addingPayment || !subscriptions.length}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {addingPayment ? "Guardando..." : "Agregar pago"}
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
        data-tour="payments-filters"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Filtrar por:</span>
          </div>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {(["all", "paid", "upcoming"] as const).map((targetFilter) => (
              <button
                key={targetFilter}
                onClick={() => setFilter(targetFilter)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === targetFilter ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                {targetFilter === "all"
                  ? "Todos"
                  : targetFilter === "paid"
                    ? "Pagados"
                    : "Próximos"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100" data-tour="payments-timeline">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl">Cronología de pagos</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="p-6">
              <LoadingState title="Cargando pagos..." />
            </div>
          )}

          {!loading &&
            filteredPayments.map((payment, index) => {
              const isUpcoming = payment.status === "upcoming";
              const daysUntil = isUpcoming ? getDaysUntilPayment(payment.date) : null;
              return (
                <div
                  key={payment.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isUpcoming ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isUpcoming
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isUpcoming ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      {index < filteredPayments.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-12 h-12 ${payment.subscription.color} rounded-xl flex items-center justify-center text-white text-lg shrink-0`}
                        >
                          {payment.subscription.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{payment.subscription.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{payment.subscription.category}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <p className="font-medium text-lg">
                          {toCurrencySymbol(payment.subscription.currency)}
                          {payment.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{format(payment.date, "d 'de' MMMM, yyyy", { locale: es })}</span>
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

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isUpcoming ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isUpcoming ? "Programado" : "Pagado"}
                    </span>
                  </div>
                </div>
              );
            })}

          {!loading && filteredPayments.length === 0 && (
            <div className="p-6">
              <EmptyState
                title="No hay pagos para este filtro"
                description="Prueba con otro filtro o registra tu primer pago manual."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

