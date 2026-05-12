import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Calculator as CalculatorIcon,
  ChartSpline,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { subscribeToUserPayments } from "../services/payments";
import type { Subscription } from "../types/subscription";
import type { UserPayment } from "../services/payments";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

function projectWithInflation(baseAnnual: number, years: number, inflationRate: number) {
  if (years <= 0) {
    return 0;
  }
  if (inflationRate <= 0) {
    return baseAnnual * years;
  }
  return (baseAnnual * (Math.pow(1 + inflationRate, years) - 1)) / inflationRate;
}

function opportunityCostFutureValue(monthlyContribution: number, annualReturnRate: number, years: number) {
  const months = Math.max(0, Math.round(years * 12));
  if (months === 0 || monthlyContribution <= 0) {
    return 0;
  }

  const monthlyRate = annualReturnRate / 12;
  if (monthlyRate <= 0) {
    return monthlyContribution * months;
  }

  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

type SimulationPreset = {
  name: string;
  category: string;
  amount: number;
  currency: "COP" | "USD" | "EUR";
  color: string;
};

const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    name: "Netflix",
    category: "Entretenimiento",
    amount: 38900,
    currency: "COP",
    color: "bg-red-500",
  },
  {
    name: "Spotify",
    category: "Música",
    amount: 24900,
    currency: "COP",
    color: "bg-emerald-500",
  },
  {
    name: "Internet hogar",
    category: "Internet",
    amount: 67900,
    currency: "COP",
    color: "bg-blue-500",
  },
];

export default function Calculator() {
  const { user } = useAuth();
  const { formatMoney } = useCurrencyDisplay();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [yearsHorizon, setYearsHorizon] = useState(5);
  const [inflationPercent, setInflationPercent] = useState(6);
  const [returnPercent, setReturnPercent] = useState(9);
  const [splitParticipants, setSplitParticipants] = useState(2);
  const [simulatedSubscriptions, setSimulatedSubscriptions] = useState<Subscription[]>([]);
  const [simName, setSimName] = useState("");
  const [simCategory, setSimCategory] = useState("Entretenimiento");
  const [simAmount, setSimAmount] = useState("");
  const [simCurrency, setSimCurrency] = useState<"COP" | "USD" | "EUR">("COP");
  const [selectedForCancellation, setSelectedForCancellation] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        const activeSubscriptions = data.filter((item) => item.status === "active");
        setSubscriptions(activeSubscriptions);
      },
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
      unsubSubscriptions();
      unsubPayments();
    };
  }, [user]);

  const allSubscriptions = useMemo(
    () => [...subscriptions, ...simulatedSubscriptions],
    [subscriptions, simulatedSubscriptions],
  );

  useEffect(() => {
    setSelectedForCancellation((prev) => {
      const next = Object.fromEntries(
        allSubscriptions.map((subscription) => [subscription.id, prev[subscription.id] ?? false]),
      );
      return next;
    });
  }, [allSubscriptions]);

  const dominantCurrency = useMemo(() => {
    if (allSubscriptions.length === 0) {
      return "COP";
    }
    const countByCurrency = allSubscriptions.reduce<Record<string, number>>((acc, subscription) => {
      const code = toCurrencyCode(subscription.currency);
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(countByCurrency).sort((a, b) => b[1] - a[1])[0]?.[0] || "COP";
  }, [allSubscriptions]);

  const monthlyBaseline = allSubscriptions.reduce((sum, item) => sum + item.amount, 0);
  const annualBaseline = monthlyBaseline * 12;

  const selectedSubscriptions = allSubscriptions.filter(
    (subscription) => selectedForCancellation[subscription.id],
  );
  const monthlyCancellation = selectedSubscriptions.reduce((sum, item) => sum + item.amount, 0);
  const annualCancellation = monthlyCancellation * 12;

  const inflationRate = inflationPercent / 100;
  const expectedReturnRate = returnPercent / 100;

  const projectedBaseline = projectWithInflation(annualBaseline, yearsHorizon, inflationRate);
  const projectedCancellationSavings = projectWithInflation(
    annualCancellation,
    yearsHorizon,
    inflationRate,
  );
  const projectedRemaining = Math.max(0, projectedBaseline - projectedCancellationSavings);

  const projectedBySharing =
    splitParticipants > 1 ? monthlyBaseline * (1 - 1 / splitParticipants) : 0;

  const opportunityCost = opportunityCostFutureValue(
    monthlyCancellation,
    expectedReturnRate,
    yearsHorizon,
  );

  const recentPayments = payments.filter((payment) => {
    const now = Date.now();
    const diffDays = (now - payment.paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 90;
  });
  const averageMonthlyPaid =
    recentPayments.length > 0
      ? recentPayments.reduce((sum, payment) => sum + payment.amount, 0) / 3
      : annualBaseline / 12;
  const emergencyFundTarget = averageMonthlyPaid * 6;
  const monthsToEmergencyFund =
    monthlyCancellation > 0 ? emergencyFundTarget / monthlyCancellation : null;

  const toggleSubscriptionSelection = (subscriptionId: string) => {
    setSelectedForCancellation((prev) => ({
      ...prev,
      [subscriptionId]: !prev[subscriptionId],
    }));
  };

  const addSimulatedSubscription = () => {
    const amount = Number(simAmount);
    if (!simName.trim() || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const simulated: Subscription = {
      id: `sim-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      name: simName.trim(),
      category: simCategory.trim() || "Otros",
      amount,
      currency: simCurrency,
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date(),
      icon: simName.trim().charAt(0).toUpperCase() || "S",
      color: "bg-cyan-500",
      source: "manual",
      notes: "Suscripción simulada desde calculadora",
    };

    setSimulatedSubscriptions((prev) => [simulated, ...prev]);
    setSimName("");
    setSimAmount("");
  };

  const addPresetSimulation = (preset: SimulationPreset) => {
    const simulated: Subscription = {
      id: `sim-${Date.now()}-${preset.name}`,
      name: preset.name,
      category: preset.category,
      amount: preset.amount,
      currency: preset.currency,
      status: "active",
      isRecurring: true,
      nextPaymentDate: new Date(),
      icon: preset.name.charAt(0).toUpperCase(),
      color: preset.color,
      source: "manual",
      notes: "Preset simulado desde calculadora",
    };
    setSimulatedSubscriptions((prev) => [simulated, ...prev]);
  };

  const removeSimulatedSubscription = (subscriptionId: string) => {
    setSimulatedSubscriptions((prev) =>
      prev.filter((subscription) => subscription.id !== subscriptionId),
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingState title="Cargando datos para la calculadora..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <ErrorState title="No se pudo cargar la calculadora" message={error} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Calculadora inteligente</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Proyecciones con tus datos reales: inflación, ahorro por cancelación, reparto y costo
          de oportunidad.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Simulación rápida (con o sin suscripciones reales)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <input
            value={simName}
            onChange={(event) => setSimName(event.target.value)}
            placeholder="Nombre (ej. Internet Fibra)"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <input
            value={simCategory}
            onChange={(event) => setSimCategory(event.target.value)}
            placeholder="Categoría"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={simAmount}
            onChange={(event) => setSimAmount(event.target.value)}
            placeholder="Monto"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <select
            value={simCurrency}
            onChange={(event) => setSimCurrency(event.target.value as "COP" | "USD" | "EUR")}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <button
            onClick={addSimulatedSubscription}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar prueba
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SIMULATION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => addPresetSimulation(preset)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-gray-200"
            >
              + {preset.name} ({formatMoney(preset.amount, preset.currency)})
            </button>
          ))}
        </div>

        {simulatedSubscriptions.length > 0 && (
          <div className="mt-4 space-y-2">
            {simulatedSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm dark:text-gray-200">
                  {subscription.name} · {subscription.category} ·{" "}
                  {formatMoney(subscription.amount, subscription.currency)}
                </span>
                <button
                  onClick={() => removeSimulatedSubscription(subscription.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Eliminar simulación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
        <StatCard
          icon={CircleDollarSign}
          label="Gasto mensual actual"
          value={formatMoney(monthlyBaseline, dominantCurrency)}
          gradient
        />
        <StatCard
          icon={ChartSpline}
          label={`Proyección ${yearsHorizon} años`}
          value={formatMoney(projectedBaseline, dominantCurrency)}
        />
        <StatCard
          icon={TrendingDown}
          label="Ahorro potencial (cancelación)"
          value={formatMoney(projectedCancellationSavings, dominantCurrency)}
        />
        <StatCard
          icon={PiggyBank}
          label="Costo de oportunidad"
          value={formatMoney(opportunityCost, dominantCurrency)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5 text-emerald-500" />
            Parámetros de simulación
          </h2>
          <div className="space-y-4">
            <SliderRow
              label={`Horizonte (${yearsHorizon} años)`}
              min={1}
              max={15}
              step={1}
              value={yearsHorizon}
              onChange={(value) => setYearsHorizon(value)}
            />
            <SliderRow
              label={`Inflación anual (${inflationPercent}%)`}
              min={0}
              max={20}
              step={0.5}
              value={inflationPercent}
              onChange={(value) => setInflationPercent(value)}
            />
            <SliderRow
              label={`Retorno de inversión (${returnPercent}%)`}
              min={0}
              max={20}
              step={0.5}
              value={returnPercent}
              onChange={(value) => setReturnPercent(value)}
            />
            <SliderRow
              label={`Participantes al compartir (${splitParticipants})`}
              min={1}
              max={8}
              step={1}
              value={splitParticipants}
              onChange={(value) => setSplitParticipants(value)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-500" />
            Resultados clave
          </h2>
          <div className="space-y-4">
            <ResultRow
              label="Gasto restante proyectado"
              value={formatMoney(projectedRemaining, dominantCurrency)}
              tone="neutral"
            />
            <ResultRow
              label="Ahorro mensual si compartes todo"
              value={formatMoney(projectedBySharing, dominantCurrency)}
              tone="positive"
            />
            <ResultRow
              label="Meta fondo de emergencia (6 meses)"
              value={formatMoney(emergencyFundTarget, dominantCurrency)}
              tone="neutral"
            />
            <ResultRow
              label="Tiempo para llegar a la meta"
              value={
                monthsToEmergencyFund
                  ? `${Math.ceil(monthsToEmergencyFund)} meses`
                  : "Selecciona suscripciones a cancelar"
              }
              tone={monthsToEmergencyFund ? "positive" : "neutral"}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          ¿Qué pasaría si cancelas estas suscripciones?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Selecciona una o varias para simular ahorro inmediato y acumulado.
        </p>

        {allSubscriptions.length === 0 ? (
          <EmptyState
            title="Aún no hay suscripciones para calcular"
            description="Agrega una suscripción de prueba arriba para comenzar a simular."
          />
        ) : (
          <div className="space-y-3">
            {allSubscriptions.map((subscription) => (
              <label
                key={subscription.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedForCancellation[subscription.id])}
                    onChange={() => toggleSubscriptionSelection(subscription.id)}
                    className="h-4 w-4"
                  />
                  <div
                    className={`w-9 h-9 ${subscription.color} rounded-lg text-white text-sm font-semibold flex items-center justify-center`}
                  >
                    {subscription.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {subscription.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {subscription.category}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMoney(subscription.amount, subscription.currency)}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 p-4">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Cancelando lo seleccionado, ahorrarías{" "}
            <strong>{formatMoney(monthlyCancellation, dominantCurrency)}</strong> al mes y{" "}
            <strong>{formatMoney(projectedCancellationSavings, dominantCurrency)}</strong> en{" "}
            {yearsHorizon} años (considerando inflación del {inflationPercent}%).
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  gradient?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-6 shadow-sm border ${
        gradient
          ? "bg-gradient-to-br from-emerald-500 to-cyan-600 text-white border-transparent"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <Icon className={`w-7 h-7 mb-2 ${gradient ? "text-emerald-100" : "text-emerald-500"}`} />
      <p className={`text-sm ${gradient ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${gradient ? "text-white" : "text-gray-900 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-emerald-500"
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`font-semibold ${
          tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
