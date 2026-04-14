import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import type { Subscription } from "../types/subscription";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

export default function Calendar() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
        setSubscriptions(data.filter((sub) => sub.status === "active"));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getSubscriptionsForDate = (date: Date) => {
    return subscriptions.filter((sub) => {
      const subDate = sub.nextPaymentDate;
      return (
        subDate.getDate() === date.getDate() &&
        subDate.getMonth() === date.getMonth() &&
        subDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTotalForDate = (date: Date) => {
    return getSubscriptionsForDate(date).reduce(
      (sum, sub) => sum + sub.amount,
      0
    );
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDateSubs = selectedDate
    ? getSubscriptionsForDate(selectedDate)
    : [];

  const monthlySubscriptions = useMemo(
    () =>
      subscriptions.filter((sub) => {
        const subDate = sub.nextPaymentDate;
        return (
          subDate.getMonth() === currentDate.getMonth() &&
          subDate.getFullYear() === currentDate.getFullYear()
        );
      }),
    [subscriptions, currentDate],
  );

  const hasCalendarData = subscriptions.length > 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Calendario de Pagos</h1>
        <p className="text-gray-500">
          Visualiza todos tus pagos programados en el calendario
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {/* Calendar */}
        <div
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          data-tour="calendar-main"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4">
              <ErrorState
                title="Error al cargar el calendario"
                message={error}
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {!loading && !hasCalendarData ? (
            <EmptyState
              title="No hay suscripciones para calendario"
              description="Agrega suscripciones activas para ver pagos en el calendario."
            />
          ) : (
            <>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm text-gray-500 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              );
              const subscriptions = getSubscriptionsForDate(date);
              const total = getTotalForDate(date);
              const hasPayments = subscriptions.length > 0;
              const isSelected =
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentDate.getMonth();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square p-2 rounded-lg transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-lg"
                      : hasPayments
                      ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="h-full flex flex-col items-center justify-center">
                    <span
                      className={`text-sm mb-1 ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {day}
                    </span>
                    {hasPayments && (
                      <>
                        <div className="flex -space-x-1 mb-1">
                          {subscriptions.slice(0, 3).map((sub, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 ${sub.color} rounded-full border-2 ${
                                isSelected
                                  ? "border-emerald-500"
                                  : "border-white"
                              } flex items-center justify-center text-[8px] text-white`}
                            >
                              {sub.icon}
                            </div>
                          ))}
                        </div>
                        <span
                          className={`text-[10px] ${
                            isSelected
                              ? "text-emerald-100"
                              : "text-emerald-600"
                          }`}
                        >
                          ${total.toFixed(0)}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div>
                <span>Día con pagos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span>Día seleccionado</span>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Sidebar - Selected Date Details */}
        <div className="space-y-6">
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            data-tour="calendar-day-detail"
          >
            <h3 className="font-medium mb-4">
              {selectedDate
                ? `Pagos del ${selectedDate.getDate()} de ${
                    monthNames[selectedDate.getMonth()]
                  }`
                : "Selecciona un día"}
            </h3>

            {loading ? (
              <LoadingState title="Cargando calendario..." description="Preparando pagos por fecha." />
            ) : selectedDateSubs.length > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {selectedDateSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-10 h-10 ${sub.color} rounded-lg flex items-center justify-center text-white text-sm`}
                      >
                        {sub.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{sub.name}</p>
                        <p className="text-xs text-gray-500">{sub.category}</p>
                      </div>
                      <p className="font-medium">
                        ${sub.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-gray-600">Total del día</span>
                  <span className="text-xl font-medium text-emerald-600">
                    $
                    {selectedDateSubs
                      .reduce((sum, sub) => sum + sub.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </>
            ) : selectedDate ? (
              <EmptyState
                title="Sin pagos ese día"
                description="No hay pagos programados para la fecha seleccionada."
              />
            ) : (
              <EmptyState
                title="Selecciona un día"
                description="Elige una fecha del calendario para ver los pagos programados."
              />
            )}
          </div>

          {/* Monthly Summary */}
          <div
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-sm text-white"
            data-tour="calendar-summary"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-medium">Resumen del mes</h3>
            </div>
            <p className="text-3xl mb-4">
              $
              {monthlySubscriptions
                .reduce((sum, sub) => sum + sub.amount, 0)
                .toFixed(2)}
            </p>
            <p className="text-emerald-100 text-sm">
              {monthlySubscriptions.length}{" "}
              pagos programados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
