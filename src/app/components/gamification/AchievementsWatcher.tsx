import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Bell,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToUserPayments } from "../../services/payments";
import { subscribeToUserReminders } from "../../services/reminders";
import { subscribeToSharedGroups } from "../../services/sharing";
import { subscribeToUserSubscriptions } from "../../services/subscriptions";
import {
  getUnlockableAchievementIds,
  type AchievementIconKey,
  type AchievementMetrics,
  type AchievementId,
  type UserAchievement,
  subscribeToUserAchievements,
  unlockAchievement,
} from "../../services/achievements";

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

export function AchievementsWatcher() {
  const { user } = useAuth();
  const [toastQueue, setToastQueue] = useState<UserAchievement[]>([]);
  const [visibleToast, setVisibleToast] = useState<UserAchievement | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<Set<AchievementId>>(new Set());

  const [metrics, setMetrics] = useState<AchievementMetrics>({
    subscriptionsTotal: 0,
    paymentsTotal: 0,
    remindersEnabledTotal: 0,
    sharedGroupsTotal: 0,
    archivedSubscriptionsTotal: 0,
    detectedSubscriptionsTotal: 0,
    categoriesTotal: 0,
  });

  const [ready, setReady] = useState({
    subscriptions: false,
    payments: false,
    reminders: false,
    sharing: false,
    achievements: false,
  });

  const unlockingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setMetrics({
        subscriptionsTotal: 0,
        paymentsTotal: 0,
        remindersEnabledTotal: 0,
        sharedGroupsTotal: 0,
        archivedSubscriptionsTotal: 0,
        detectedSubscriptionsTotal: 0,
        categoriesTotal: 0,
      });
      setUnlockedIds(new Set());
      setReady({
        subscriptions: false,
        payments: false,
        reminders: false,
        sharing: false,
        achievements: false,
      });
      return;
    }

    setMetrics({
      subscriptionsTotal: 0,
      paymentsTotal: 0,
      remindersEnabledTotal: 0,
      sharedGroupsTotal: 0,
      archivedSubscriptionsTotal: 0,
      detectedSubscriptionsTotal: 0,
      categoriesTotal: 0,
    });
    setUnlockedIds(new Set());
    setReady({
      subscriptions: false,
      payments: false,
      reminders: false,
      sharing: false,
      achievements: false,
    });

    const unsubscribeSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      (subscriptions) => {
        const categories = new Set(
          subscriptions.map((sub) => sub.category.trim().toLowerCase()).filter(Boolean),
        );
        const archived = subscriptions.filter(
          (sub) => sub.status === "suspended" || sub.status === "forgotten",
        ).length;
        const detected = subscriptions.filter(
          (sub) =>
            sub.source === "gmail-detected" ||
            sub.source === "email-detected" ||
            sub.source === "bank-statement",
        ).length;
        setMetrics((prev) => ({
          ...prev,
          subscriptionsTotal: subscriptions.length,
          archivedSubscriptionsTotal: archived,
          detectedSubscriptionsTotal: detected,
          categoriesTotal: categories.size,
        }));
        setReady((prev) => ({ ...prev, subscriptions: true }));
      },
      () => setReady((prev) => ({ ...prev, subscriptions: true })),
    );

    const unsubscribePayments = subscribeToUserPayments(
      user.uid,
      (payments) => {
        setMetrics((prev) => ({ ...prev, paymentsTotal: payments.length }));
        setReady((prev) => ({ ...prev, payments: true }));
      },
      () => setReady((prev) => ({ ...prev, payments: true })),
    );

    const unsubscribeReminders = subscribeToUserReminders(
      user.uid,
      (reminders) => {
        setMetrics((prev) => ({
          ...prev,
          remindersEnabledTotal: reminders.filter((item) => item.enabled).length,
        }));
        setReady((prev) => ({ ...prev, reminders: true }));
      },
      () => setReady((prev) => ({ ...prev, reminders: true })),
    );

    const unsubscribeSharing = subscribeToSharedGroups(
      user.uid,
      (groups) => {
        setMetrics((prev) => ({ ...prev, sharedGroupsTotal: groups.length }));
        setReady((prev) => ({ ...prev, sharing: true }));
      },
      () => setReady((prev) => ({ ...prev, sharing: true })),
    );

    const unsubscribeAchievements = subscribeToUserAchievements(
      user.uid,
      (achievements) => {
        setUnlockedIds(new Set(achievements.map((achievement) => achievement.id)));
        setReady((prev) => ({ ...prev, achievements: true }));
      },
      () => setReady((prev) => ({ ...prev, achievements: true })),
    );

    return () => {
      unsubscribeSubscriptions();
      unsubscribePayments();
      unsubscribeReminders();
      unsubscribeSharing();
      unsubscribeAchievements();
    };
  }, [user]);

  const canEvaluate = useMemo(
    () =>
      user &&
      ready.subscriptions &&
      ready.payments &&
      ready.reminders &&
      ready.sharing &&
      ready.achievements,
    [user, ready],
  );

  useEffect(() => {
    if (!user || !canEvaluate || unlockingRef.current) {
      return;
    }

    const unlockable = getUnlockableAchievementIds(metrics).filter(
      (achievementId) => !unlockedIds.has(achievementId),
    );
    if (unlockable.length === 0) {
      return;
    }

    unlockingRef.current = true;
    let mounted = true;

    void (async () => {
      try {
        for (const achievementId of unlockable) {
          const result = await unlockAchievement(user.uid, achievementId, metrics);
          if (!mounted || !result.unlocked) {
            continue;
          }
          setToastQueue((prev) => [...prev, result.achievement]);
        }
      } finally {
        unlockingRef.current = false;
      }
    })();

    return () => {
      mounted = false;
      unlockingRef.current = false;
    };
  }, [canEvaluate, metrics, unlockedIds, user]);

  useEffect(() => {
    if (visibleToast || toastQueue.length === 0) {
      return;
    }
    const [next, ...rest] = toastQueue;
    setVisibleToast(next);
    setToastQueue(rest);
  }, [toastQueue, visibleToast]);

  useEffect(() => {
    if (!visibleToast) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setVisibleToast(null);
    }, 4200);
    return () => window.clearTimeout(timeout);
  }, [visibleToast]);

  if (!visibleToast) {
    return null;
  }

  const Icon = iconByKey[visibleToast.icon] || Star;

  return (
    <div className="fixed right-4 bottom-4 z-[120] max-w-sm w-[92vw] sm:w-[360px]">
      <div className="rounded-xl border border-emerald-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-2xl p-4 animate-[trimit-page-enter_320ms_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-100 dark:bg-emerald-900/35 grid place-items-center shrink-0">
            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Logro desbloqueado
            </p>
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {visibleToast.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {visibleToast.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

