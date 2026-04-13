import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  TrendingDown,
  Users,
  Calendar,
  Star,
  Check,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { findBestMarketOffer, getMarketOffers, type MarketOffer } from "../services/marketOffers";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState } from "../components/PageStates";

type RecommendationKind = "optimization" | "sharing" | "cancel" | "market-offer";
type RecommendationStatus = "new" | "applied" | "dismissed" | "later";

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  savings: number;
  effort: "Fácil" | "Medio" | "Alto";
  impact: "Alto" | "Medio" | "Bajo";
  category: string;
  kind: RecommendationKind;
  color: "emerald" | "blue" | "red" | "purple";
  subscriptionId?: string;
  offer?: MarketOffer;
}

export default function Recommendations() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusByRecommendationId, setStatusByRecommendationId] = useState<
    Record<string, RecommendationStatus>
  >({});
  const [lastRefreshAt, setLastRefreshAt] = useState<Date>(new Date());

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data.filter((sub) => sub.status !== "suspended"));
        setLastRefreshAt(new Date());
      },
      (err) => setError(err.message),
    );
  }, [user]);

  const recommendations = useMemo<RecommendationItem[]>(() => {
    const items: RecommendationItem[] = [];
    const now = new Date();

    for (const sub of subscriptions) {
      const name = sub.name.toLowerCase();

      if (sub.amount >= 18) {
        items.push({
          id: `opt-${sub.id}`,
          title: `Revisa plan de ${sub.name}`,
          description: `Tu plan actual es alto (${sub.amount.toFixed(
            2,
          )}/mes). Evalúa un plan anual o básico.`,
          savings: Number((sub.amount * 0.15 * 12).toFixed(2)),
          effort: "Fácil",
          impact: "Medio",
          category: "Optimización",
          kind: "optimization",
          color: "emerald",
          subscriptionId: sub.id,
        });
      }

      if (name.includes("spotify") || name.includes("youtube") || name.includes("netflix")) {
        items.push({
          id: `share-${sub.id}`,
          title: `Comparte ${sub.name} con plan familiar`,
          description:
            "Si lo compartes con familia o amigos, el costo por persona suele bajar notablemente.",
          savings: Number((sub.amount * 0.35 * 12).toFixed(2)),
          effort: "Medio",
          impact: "Alto",
          category: "Compartir",
          kind: "sharing",
          color: "blue",
          subscriptionId: sub.id,
        });
      }

      const daysUntil = Math.ceil((sub.nextPaymentDate.getTime() - now.getTime()) / 86400000);
      if (sub.status === "forgotten" || daysUntil < 0) {
        items.push({
          id: `cancel-${sub.id}`,
          title: `Cancela o pausa ${sub.name}`,
          description:
            "La suscripción aparece olvidada o con cobro vencido. Revisa si aún la necesitas.",
          savings: Number((sub.amount * 12).toFixed(2)),
          effort: "Fácil",
          impact: "Alto",
          category: "Cancelación",
          kind: "cancel",
          color: "red",
          subscriptionId: sub.id,
        });
      }

      const bestOffer = findBestMarketOffer(sub.name, sub.category);
      if (bestOffer && bestOffer.monthlyPrice < sub.amount) {
        items.push({
          id: `market-${sub.id}-${bestOffer.id}`,
          title: `Oferta detectada para ${sub.name}`,
          description: `En el mercado existe ${bestOffer.provider} ${bestOffer.planName} por ${bestOffer.monthlyPrice.toFixed(
            2,
          )}/${bestOffer.billingCycle === "monthly" ? "mes" : "año"}.`,
          savings: Number(((sub.amount - bestOffer.monthlyPrice) * 12).toFixed(2)),
          effort: "Medio",
          impact: "Alto",
          category: "Oferta mercado",
          kind: "market-offer",
          color: "purple",
          subscriptionId: sub.id,
          offer: bestOffer,
        });
      }
    }

    const dedup = new Map<string, RecommendationItem>();
    for (const item of items) {
      if (!dedup.has(item.id)) {
        dedup.set(item.id, item);
      }
    }

    return Array.from(dedup.values()).sort((a, b) => b.savings - a.savings);
  }, [subscriptions]);

  const visibleRecommendations = recommendations.filter(
    (item) => statusByRecommendationId[item.id] !== "dismissed",
  );
  const totalPotentialSavings = visibleRecommendations.reduce((sum, rec) => sum + rec.savings, 0);
  const marketOffers = getMarketOffers();

  const markStatus = (id: string, status: RecommendationStatus) => {
    setStatusByRecommendationId((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Recomendaciones</h1>
          <p className="text-gray-500">Análisis en tiempo real de tus suscripciones y ofertas</p>
        </div>
        <button
          onClick={() => setLastRefreshAt(new Date())}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar análisis
        </button>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar recomendaciones"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-10 h-10" />
              <h2 className="text-2xl font-bold">Ahorro Potencial</h2>
            </div>
            <p className="text-emerald-100 text-lg mb-4">
              Basado en tus suscripciones actuales y comparación de mercado
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">${totalPotentialSavings.toFixed(0)}</span>
              <span className="text-emerald-100">/año</span>
            </div>
            <p className="text-emerald-100 text-xs mt-2">
              Último análisis: {lastRefreshAt.toLocaleString("es-CO")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm mb-1">Recomendaciones activas</p>
            <p className="text-4xl font-bold">{visibleRecommendations.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Recomendaciones Personalizadas</h2>

        <div className="space-y-4">
          {visibleRecommendations.map((rec) => {
            const status = statusByRecommendationId[rec.id] || "new";
            const colorClasses = {
              emerald: { bg: "bg-emerald-100", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
              blue: { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
              red: { bg: "bg-red-100", text: "text-red-600", badge: "bg-red-100 text-red-700" },
              purple: { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
            }[rec.color];

            const IconComponent =
              rec.kind === "sharing"
                ? Users
                : rec.kind === "cancel"
                ? X
                : rec.kind === "market-offer"
                ? Calendar
                : TrendingDown;

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${colorClasses.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-7 h-7 ${colorClasses.text}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg dark:text-white">{rec.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                            {rec.category}
                          </span>
                          {status !== "new" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {status === "applied"
                                ? "Aplicada"
                                : status === "later"
                                ? "Pendiente"
                                : "Nueva"}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{rec.description}</p>

                        {rec.offer && (
                          <a
                            href={rec.offer.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mb-3"
                          >
                            Ver oferta en {rec.offer.source}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Esfuerzo:</span>
                            <span
                              className={`font-medium ${
                                rec.effort === "Fácil"
                                  ? "text-emerald-600"
                                  : rec.effort === "Medio"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {rec.effort}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Impacto:</span>
                            <div className="flex gap-1">
                              {[...Array(rec.impact === "Alto" ? 3 : rec.impact === "Medio" ? 2 : 1)].map(
                                (_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ahorro anual</p>
                        <p className={`text-3xl font-bold ${colorClasses.text}`}>${rec.savings.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => markStatus(rec.id, "applied")}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Aplicar recomendación
                      </button>
                      <button
                        onClick={() => markStatus(rec.id, "later")}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Recordar después
                      </button>
                      <button
                        onClick={() => markStatus(rec.id, "dismissed")}
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {visibleRecommendations.length === 0 && (
            <EmptyState
              title="No hay recomendaciones activas"
              description="Agrega más suscripciones para mejorar el análisis y recibir sugerencias."
            />
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Base de ofertas de mercado</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marketOffers.slice(0, 6).map((offer) => (
            <div
              key={offer.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-2">
                <p className="font-semibold text-lg text-gray-900 dark:text-white">
                  {offer.provider} - {offer.planName}
                </p>
                <p className="text-sm text-emerald-600 font-medium">
                  {offer.monthlyPrice.toFixed(2)} {offer.currency} /{" "}
                  {offer.billingCycle === "monthly" ? "mes" : "año"}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Categoría: {offer.category}
              </p>
              <a
                href={offer.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
              >
                Ver fuente
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Cómo conectarlo a ofertas reales del mercado
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-100">
          <li>• Opción 1: mantener un catálogo curado en Firestore y actualizarlo desde un panel admin.</li>
          <li>• Opción 2: usar un backend (Cloud Functions) que consuma APIs de precios y guarde snapshots.</li>
          <li>• Opción 3: scraping legal con jobs programados solo para sitios permitidos y con caché.</li>
          <li>• No hay librería única que resuelva “suscripciones + ofertas globales” automáticamente end-to-end.</li>
          <li>• Recomendado: Cloud Functions + Firestore + proveedor de datos de precios según país.</li>
        </ul>
      </div>
    </div>
  );
}
