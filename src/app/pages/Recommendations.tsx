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
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import {
  findBestMarketOffer,
  findLocalAlternatives,
  getMarketOfferStats,
  getMarketOffers,
  type MarketOffer,
} from "../services/marketOffers";
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
  currency: string;
}

function getBillingCycleLabel(offer: MarketOffer) {
  return offer.billingCycle === "annual" ? "mes equiv." : "mes";
}

function getSourceConfidenceLabel(offer: MarketOffer) {
  if (offer.sourceConfidence === "official") {
    return "Fuente oficial";
  }
  if (offer.sourceConfidence === "market-reference") {
    return "Referencia local";
  }
  return "Estimado";
}

function getRecommendationPriceText(offer: MarketOffer, formatMoney: (amount: number, sourceCurrency?: string) => string) {
  const suffix = offer.billingCycle === "annual" ? "mes equiv." : "mes";
  return `${formatMoney(offer.monthlyPrice, offer.currency)}/${suffix}`;
}

export default function Recommendations() {
  const { user } = useAuth();
  const { formatMoney, convertMoney, preferredCurrency } = useCurrencyDisplay();
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
      const monthlyAmount = convertMoney(sub.amount, sub.currency);

      const highMonthlyThreshold = convertMoney(
        sub.category.toLowerCase().includes("productividad") ? 70000 : 50000,
        "COP",
      );

      if (monthlyAmount >= highMonthlyThreshold) {
        items.push({
          id: `opt-${sub.id}`,
          title: `Revisa plan de ${sub.name}`,
          description: `Tu plan actual está por encima del rango típico colombiano (${formatMoney(sub.amount, sub.currency)}/mes). Revisa si existe plan anual, básico o familiar antes del próximo cobro.`,
          savings: Number((monthlyAmount * 0.15 * 12).toFixed(2)),
          currency: preferredCurrency,
          effort: "Fácil",
          impact: "Medio",
          category: "Optimización",
          kind: "optimization",
          color: "emerald",
          subscriptionId: sub.id,
        });
      }

      const shareableCatalog = getMarketOffers();
      const familyOffer = name.includes("spotify")
        ? shareableCatalog.find((offer) => offer.id === "spotify-family-co")
        : name.includes("netflix")
        ? shareableCatalog.find((offer) => offer.id === "netflix-premium-co")
        : null;
      const shareableSeats = familyOffer?.seats && familyOffer.seats > 1 ? familyOffer.seats : 4;
      if (name.includes("spotify") || name.includes("youtube") || name.includes("netflix")) {
        const sharePrice = familyOffer
          ? convertMoney(familyOffer.monthlyPrice, familyOffer.currency) / shareableSeats
          : monthlyAmount / shareableSeats;
        const yearlySharedSavings = Math.max(0, (monthlyAmount - sharePrice) * 12);
        items.push({
          id: `share-${sub.id}`,
          title: `Comparte ${sub.name} con plan familiar`,
          description: familyOffer?.seats
            ? `En Colombia, ${familyOffer.provider} ${familyOffer.planName} cuesta ${formatMoney(familyOffer.monthlyPrice, familyOffer.currency)} y permite hasta ${familyOffer.seats} perfiles/cuentas. El costo por persona puede quedar cerca de ${formatMoney(sharePrice, preferredCurrency)}/mes.`
            : "Si lo compartes con familia o amigos dentro de las reglas del servicio, el costo por persona suele bajar notablemente.",
          savings: Number(yearlySharedSavings.toFixed(2)),
          currency: preferredCurrency,
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
          savings: Number((monthlyAmount * 12).toFixed(2)),
          currency: preferredCurrency,
          effort: "Fácil",
          impact: "Alto",
          category: "Cancelación",
          kind: "cancel",
          color: "red",
          subscriptionId: sub.id,
        });
      }

      const bestOffer = findBestMarketOffer(sub.name, sub.category);
      const bestOfferMonthly = bestOffer
        ? convertMoney(bestOffer.monthlyPrice, bestOffer.currency)
        : 0;
      if (bestOffer && bestOfferMonthly < monthlyAmount) {
        items.push({
          id: `market-${sub.id}-${bestOffer.id}`,
          title: `Plan colombiano más barato para ${sub.name}`,
          description: `${bestOffer.provider} ${bestOffer.planName} está registrado en la base local por ${getRecommendationPriceText(bestOffer, formatMoney)}. Fuente: ${bestOffer.source}.`,
          savings: Number(((monthlyAmount - bestOfferMonthly) * 12).toFixed(2)),
          currency: preferredCurrency,
          effort: "Medio",
          impact: "Alto",
          category: "Oferta mercado",
          kind: "market-offer",
          color: "purple",
          subscriptionId: sub.id,
          offer: bestOffer,
        });
      }

      const alternative = findLocalAlternatives(sub.category, bestOffer?.provider || sub.name)[0];
      const alternativeMonthly = alternative
        ? convertMoney(alternative.monthlyPrice, alternative.currency)
        : 0;
      if (
        alternative &&
        alternativeMonthly > 0 &&
        alternativeMonthly < monthlyAmount * 0.82 &&
        ["entretenimiento", "música", "musica", "productividad"].some((category) =>
          sub.category.toLowerCase().includes(category),
        )
      ) {
        items.push({
          id: `alt-${sub.id}-${alternative.id}`,
          title: `Alternativa local más barata que ${sub.name}`,
          description: `${alternative.provider} ${alternative.planName} cuesta ${getRecommendationPriceText(alternative, formatMoney)} en Colombia. No reemplaza necesariamente el catálogo, pero sirve para comparar tu gasto.`,
          savings: Number(((monthlyAmount - alternativeMonthly) * 12).toFixed(2)),
          currency: preferredCurrency,
          effort: "Medio",
          impact: "Medio",
          category: "Alternativa local",
          kind: "market-offer",
          color: "purple",
          subscriptionId: sub.id,
          offer: alternative,
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
  }, [subscriptions, formatMoney, convertMoney, preferredCurrency]);

  const visibleRecommendations = recommendations.filter(
    (item) => statusByRecommendationId[item.id] !== "dismissed",
  );
  const totalPotentialSavings = visibleRecommendations.reduce(
    (sum, rec) => sum + convertMoney(rec.savings, rec.currency),
    0,
  );
  const marketOffers = getMarketOffers();
  const marketStats = getMarketOfferStats();
  const marketOffersByCategory = marketOffers.reduce<Record<string, MarketOffer[]>>((groups, offer) => {
    const group = groups[offer.category] || [];
    groups[offer.category] = [...group, offer];
    return groups;
  }, {});

  const markStatus = (id: string, status: RecommendationStatus) => {
    setStatusByRecommendationId((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Recomendaciones</h1>
          <p className="text-gray-500">
            Análisis con precios de referencia para Colombia y tus suscripciones activas
          </p>
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

      <div
        className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 md:p-8 text-white shadow-lg mb-8"
        data-tour="recommendations-summary"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-10 h-10" />
              <h2 className="text-2xl font-bold">Ahorro Potencial</h2>
            </div>
            <p className="text-emerald-100 text-lg mb-4">
              Basado en tus suscripciones actuales y precios locales curados
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold">{formatMoney(totalPotentialSavings)}</span>
              <span className="text-emerald-100">/año</span>
            </div>
            <p className="text-emerald-100 text-xs mt-2">
              Último análisis: {lastRefreshAt.toLocaleString("es-CO")} · Catálogo actualizado:{" "}
              {marketStats.lastUpdatedAt || "sin fecha"}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-emerald-100 text-sm mb-1">Recomendaciones activas</p>
            <p className="text-4xl font-bold">{visibleRecommendations.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-8" data-tour="recommendations-list">
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
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className={`w-14 h-14 ${colorClasses.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-7 h-7 ${colorClasses.text}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-start gap-2">
                          <h3 className="min-w-0 text-xl font-semibold leading-snug dark:text-white sm:text-lg">
                            {rec.title}
                          </h3>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${colorClasses.badge}`}>
                            {rec.category}
                          </span>
                          {status !== "new" && (
                            <span className="shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
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

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
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

                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5 lg:min-w-40 lg:text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ahorro anual</p>
                         <p className={`text-3xl font-bold ${colorClasses.text}`}>
                           {formatMoney(rec.savings, rec.currency)}
                         </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex sm:flex-wrap">
                      <button
                        onClick={() => markStatus(rec.id, "applied")}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                        Aplicar recomendación
                      </button>
                      <button
                        onClick={() => markStatus(rec.id, "later")}
                        className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Recordar después
                      </button>
                      <button
                        onClick={() => markStatus(rec.id, "dismissed")}
                        className="min-h-11 rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

      <div className="mb-8" data-tour="recommendations-market">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold dark:text-white">Base de precios Colombia</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {marketStats.colombian} precios locales, {marketStats.official} con fuente oficial directa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
            <span className="rounded-full border border-emerald-300/40 px-3 py-1 dark:border-emerald-500/30">
              COP primero
            </span>
            <span className="rounded-full border border-emerald-300/40 px-3 py-1 dark:border-emerald-500/30">
              Colombia
            </span>
            <span className="rounded-full border border-emerald-300/40 px-3 py-1 dark:border-emerald-500/30">
              Sin scraping en cliente
            </span>
          </div>
        </div>

        <div className="space-y-7">
          {Object.entries(marketOffersByCategory).map(([category, offers]) => (
            <section key={category}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">
                          {offer.provider}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{offer.planName}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          offer.sourceConfidence === "official"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                            : offer.sourceConfidence === "market-reference"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
                        }`}
                      >
                        {getSourceConfidenceLabel(offer)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                        {formatMoney(offer.monthlyPrice, offer.currency)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        /{getBillingCycleLabel(offer)}
                        {offer.annualPrice ? ` · pago anual ${formatMoney(offer.annualPrice, offer.currency)}` : ""}
                      </p>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {offer.seats && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {offer.seats} {offer.seats === 1 ? "cuenta" : "cuentas"}
                        </span>
                      )}
                      {offer.features?.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {offer.notes && (
                      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{offer.notes}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Actualizado {offer.sourceUpdatedAt}
                      </span>
                      <a
                        href={offer.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
                      >
                        Fuente
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Cómo se actualiza esta base
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-100">
          <li>• Los precios visibles se guardan como catálogo curado para Colombia, con fuente y fecha de revisión.</li>
          <li>• El scraping en vivo no se ejecuta desde el navegador para evitar bloqueos CORS y problemas legales de los sitios.</li>
          <li>• La siguiente mejora natural es mover esta actualización a Cloud Functions con caché y snapshots en Firestore.</li>
        </ul>
      </div>
    </div>
  );
}
