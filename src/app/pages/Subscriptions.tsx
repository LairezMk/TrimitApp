import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { FileUp, Loader2, MailSearch, Plus, Search } from "lucide-react";
import { SubscriptionCard } from "../components/SubscriptionCard";
import type { Subscription } from "../types/subscription";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";
import { detectSubscriptionsFromGmail, saveDetectedSubscriptionsDrafts } from "../services/gmailDetection";
import { detectSubscriptionsFromBankStatement } from "../services/bankStatementDetection";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";

export default function Subscriptions() {
  const navigate = useNavigate();
  const { user, requestGmailAccessToken } = useAuth();
  const { formatMoney } = useCurrencyDisplay();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectingByEmail, setDetectingByEmail] = useState(false);
  const [detectingByStatement, setDetectingByStatement] = useState(false);
  const statementInputRef = useRef<HTMLInputElement | null>(null);

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
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const handleEditSubscription = (subscription: Subscription) => {
    navigate(`/subscriptions/${subscription.id}/edit`);
  };

  const totalMonthly = subscriptions
    .filter((sub) => sub.status !== "suspended")
    .reduce((sum, sub) => sum + sub.amount, 0);

  const activeCount = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;
  const forgottenCount = subscriptions.filter(
    (sub) => sub.status === "forgotten"
  ).length;

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDetectByEmail = async () => {
    if (!user) {
      setError("Debes iniciar sesión para detectar suscripciones por correo.");
      return;
    }

    setDetectingByEmail(true);
    setError(null);

    try {
      const accessToken = await requestGmailAccessToken();
      const detected = await detectSubscriptionsFromGmail(accessToken);
      saveDetectedSubscriptionsDrafts(detected);
      navigate("/subscriptions/gmail-confirmation");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron detectar suscripciones desde el correo.";
      setError(message);
    } finally {
      setDetectingByEmail(false);
    }
  };

  const handleStatementFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setDetectingByStatement(true);
    setError(null);

    try {
      const detected = await detectSubscriptionsFromBankStatement(file);
        if (!detected.length) {
          setError(
            "No encontramos suscripciones en el extracto. Prueba con un archivo más detallado o con mejor formato.",
          );
          return;
        }
      saveDetectedSubscriptionsDrafts(detected);
      navigate("/subscriptions/gmail-confirmation");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo analizar el extracto bancario.";
      setError(message);
    } finally {
      setDetectingByStatement(false);
      event.target.value = "";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mis Suscripciones</h1>
        <p className="text-gray-500">
          Gestiona y controla todas tus suscripciones en un solo lugar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8" data-tour="subscriptions-stats">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 motion-card-grow">
          <p className="text-gray-500 text-sm mb-2">Gasto mensual total</p>
          <p className="text-3xl text-emerald-600">{formatMoney(totalMonthly, "COP")}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 motion-card-grow">
          <p className="text-gray-500 text-sm mb-2">Suscripciones activas</p>
          <p className="text-3xl">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 motion-card-grow">
          <p className="text-gray-500 text-sm mb-2">Suscripciones olvidadas</p>
          <p className="text-3xl text-amber-600">{forgottenCount}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Ocurrió un error"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {(detectingByEmail || detectingByStatement) && (
        <div className="mb-5 md:mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 mt-0.5 text-emerald-600 animate-spin" />
          <div className="text-sm text-emerald-800">
            {detectingByEmail
              ? "Escaneando correos y detectando suscripciones..."
              : "Analizando extracto bancario y aplicando reglas de detección..."}
          </div>
        </div>
      )}

      {/* Filters, Search and Actions */}
      <div
        className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-5 md:mb-6"
        data-tour="subscriptions-filters"
      >
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar suscripciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterStatus("all")}
                className={`motion-filter-chip px-4 py-2 rounded-md text-sm transition-colors ${
                  filterStatus === "all"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`motion-filter-chip px-4 py-2 rounded-md text-sm transition-colors ${
                  filterStatus === "active"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setFilterStatus("forgotten")}
                className={`motion-filter-chip px-4 py-2 rounded-md text-sm transition-colors ${
                  filterStatus === "forgotten"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Olvidadas
              </button>
            </div>
            <input
              ref={statementInputRef}
              type="file"
              accept=".pdf,.xls,.xlsx,.csv"
              className="hidden"
              onChange={handleStatementFileChange}
            />
            <Button
              onClick={() => statementInputRef.current?.click()}
              disabled={detectingByStatement || detectingByEmail}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              {detectingByStatement ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4 mr-2" />
                  Subir extracto (PDF/Excel)
                </>
              )}
            </Button>
            <Button
              onClick={handleDetectByEmail}
              disabled={detectingByStatement || detectingByEmail}
              className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
            >
              {detectingByEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detectando...
                </>
              ) : (
                <>
                  <MailSearch className="w-4 h-4 mr-2" />
                  Detectar por correo
                </>
              )}
            </Button>
            <Button
              onClick={() => navigate("/subscriptions/add")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva
            </Button>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6" data-tour="subscriptions-grid">
        {loading && <LoadingState title="Cargando suscripciones..." />}
        {filteredSubscriptions.map((subscription, index) => (
          <div
            key={subscription.id}
            className="motion-stagger-item"
            style={{ animationDelay: `${Math.min(index * 70, 700)}ms` }}
          >
            <SubscriptionCard
              subscription={subscription}
              onClick={() => handleEditSubscription(subscription)}
            />
          </div>
        ))}
        {!loading && filteredSubscriptions.length === 0 && (
          <EmptyState
            title="No hay suscripciones registradas"
            description="Agrega tu primera suscripción para comenzar a gestionar tus pagos."
            actionLabel="Crear suscripción"
            onAction={() => navigate("/subscriptions/add")}
          />
        )}
      </div>
    </div>
  );
}
