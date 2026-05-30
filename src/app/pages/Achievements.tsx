import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Archive,
  Bell,
  Calendar,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  ACHIEVEMENTS,
  getAchievementProgress,
  type AchievementIconKey,
  type AchievementMetrics,
  type UserAchievement,
  subscribeToUserAchievements,
} from "../services/achievements";
import { subscribeToUserPayments } from "../services/payments";
import { subscribeToUserReminders } from "../services/reminders";
import { subscribeToSharedGroups } from "../services/sharing";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

const iconByKey: Record<AchievementIconKey, typeof Star> = {
  star: Star,
  target: Target,
  calendar: Calendar,
  dollar: DollarSign,
  chart: TrendingUp,
  bell: Bell,
  users: Users,
  archive: Archive,
  sparkles: Sparkles,
  shield: ShieldCheck,
};

const rarityStyles = {
  common: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20",
  rare: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
  epic: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20",
} as const;

export default function Achievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
  const [metrics, setMetrics] = useState<AchievementMetrics>({
    subscriptionsTotal: 0,
    paymentsTotal: 0,
    remindersEnabledTotal: 0,
    sharedGroupsTotal: 0,
    archivedSubscriptionsTotal: 0,
    detectedSubscriptionsTotal: 0,
    categoriesTotal: 0,
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubAchievements = subscribeToUserAchievements(
      user.uid,
      (data) => {
        setUnlocked(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    const unsubSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      (subscriptions) => {
        const categories = new Set(
          subscriptions.map((sub) => sub.category.trim().toLowerCase()).filter(Boolean),
        );
        setMetrics((prev) => ({
          ...prev,
          subscriptionsTotal: subscriptions.length,
          archivedSubscriptionsTotal: subscriptions.filter(
            (sub) => sub.status === "suspended" || sub.status === "forgotten",
          ).length,
          detectedSubscriptionsTotal: subscriptions.filter(
            (sub) =>
              sub.source === "gmail-detected" ||
              sub.source === "email-detected" ||
              sub.source === "bank-statement",
          ).length,
          categoriesTotal: categories.size,
        }));
      },
      (err) => setError(err.message),
    );
    const unsubPayments = subscribeToUserPayments(
      user.uid,
      (payments) => setMetrics((prev) => ({ ...prev, paymentsTotal: payments.length })),
      (err) => setError(err.message),
    );
    const unsubReminders = subscribeToUserReminders(
      user.uid,
      (reminders) =>
        setMetrics((prev) => ({
          ...prev,
          remindersEnabledTotal: reminders.filter((item) => item.enabled).length,
        })),
      (err) => setError(err.message),
    );
    const unsubSharing = subscribeToSharedGroups(
      user.uid,
      (groups) => setMetrics((prev) => ({ ...prev, sharedGroupsTotal: groups.length })),
      (err) => setError(err.message),
    );

    return () => {
      unsubAchievements();
      unsubSubscriptions();
      unsubPayments();
      unsubReminders();
      unsubSharing();
    };
  }, [user]);

  const unlockedMap = useMemo(
    () => new Map(unlocked.map((achievement) => [achievement.id, achievement])),
    [unlocked],
  );

  const cards = useMemo(
    () =>
      ACHIEVEMENTS.map((achievement) => {
        const unlockedData = unlockedMap.get(achievement.id);
        const progress = getAchievementProgress(achievement, metrics);
        return { achievement, unlockedData, progress };
      }),
    [metrics, unlockedMap],
  );

  const unlockedCount = unlocked.length;
  const completionRate = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingState title="Cargando logros..." description="Preparando progreso gamificado." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <EmptyState
          title="Inicia sesión para ver logros"
          description="Los logros se activan con tu progreso personal."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8" data-tour="achievements-header">
        <h1 className="text-3xl mb-2 dark:text-white">Logros</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Desbloquea insignias mientras mejoras el control de tus suscripciones.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar logros"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8"
        data-tour="achievements-progress"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Desbloqueados</p>
            <Trophy className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-semibold text-emerald-600">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Completado</p>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-semibold text-blue-600">{completionRate}%</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Último logro</p>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-sm font-medium dark:text-white">
            {unlocked[0]?.title || "Aún sin desbloquear"}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
        data-tour="achievements-list"
      >
        {cards.map(({ achievement, unlockedData, progress }) => {
          const Icon = iconByKey[achievement.icon] || Trophy;
          const unlockedStyle = unlockedData
            ? rarityStyles[achievement.rarity]
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 opacity-80";
          return (
            <div
              key={achievement.id}
              className={`rounded-xl border p-5 shadow-sm transition-all ${unlockedStyle}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-white/80 dark:bg-black/20 grid place-items-center">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    unlockedData
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {unlockedData ? "Desbloqueado" : "Bloqueado"}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-4">
                {achievement.description}
              </p>

              {unlockedData ? (
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Desbloqueado el{" "}
                  {format(unlockedData.unlockedAt, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              ) : (
                <div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {progress.current}/{achievement.target}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

