import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Copy,
  Mail,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Wallet,
  CircleCheckBig,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import type { Subscription } from "../types/subscription";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import {
  createSharedGroup,
  deleteSharedGroup,
  subscribeToSharedGroups,
  updateSharedGroup,
  type SharedSubscriptionGroup,
} from "../services/sharing";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

function parseMemberNames(raw: string) {
  return raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item, index, array) => Boolean(item) && array.indexOf(item) === index);
}

export default function Sharing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatMoney, convertMoney, preferredCurrency } = useCurrencyDisplay();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [groups, setGroups] = useState<SharedSubscriptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newSubscriptionId, setNewSubscriptionId] = useState("");
  const [newMembers, setNewMembers] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [processingGroupId, setProcessingGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data.filter((subscription) => subscription.status === "active"));
      },
      (err) => setError(err.message),
    );

    const unsubGroups = subscribeToSharedGroups(
      user.uid,
      (data) => {
        setGroups(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      unsubSubscriptions();
      unsubGroups();
    };
  }, [user]);

  useEffect(() => {
    if (!newSubscriptionId && subscriptions.length > 0) {
      setNewSubscriptionId(subscriptions[0].id);
    }
  }, [subscriptions, newSubscriptionId]);

  const groupCards = useMemo(() => {
    const byId = new Map(subscriptions.map((subscription) => [subscription.id, subscription]));
    return groups
      .map((group) => {
        const subscription = byId.get(group.subscriptionId);
        if (!subscription) {
          return null;
        }
        const memberCount = group.memberNames.length + 1;
        const monthlyAmount = convertMoney(subscription.amount, subscription.currency);
        const yourShare = monthlyAmount / memberCount;
        const savings = monthlyAmount - yourShare;
        return { group, subscription, memberCount, yourShare, savings };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [groups, subscriptions, convertMoney]);

  const totalShared = groupCards.length;
  const totalMembers = groupCards.reduce((sum, item) => sum + item.memberCount, 0);
  const totalYourShare = groupCards.reduce((sum, item) => sum + item.yourShare, 0);
  const totalSavings = groupCards.reduce((sum, item) => sum + item.savings, 0);

  const handleCreateGroup = async () => {
    if (!user) {
      return;
    }

    const memberNames = parseMemberNames(newMembers);
    if (!newSubscriptionId || memberNames.length === 0) {
      setError("Selecciona una suscripción e ingresa al menos un integrante.");
      return;
    }

    setCreating(true);
    setError(null);
    setFeedback(null);
    try {
      await createSharedGroup(user.uid, {
        subscriptionId: newSubscriptionId,
        memberNames,
        notes: newNotes.trim(),
      });
      setNewMembers("");
      setNewNotes("");
      setFeedback("Suscripción compartida creada correctamente.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el grupo.";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (group: SharedSubscriptionGroup, member: string) => {
    if (!user || !member.trim()) {
      return;
    }

    const memberNames = parseMemberNames([...group.memberNames, member.trim()].join(","));
    setProcessingGroupId(group.id);
    setError(null);
    setFeedback(null);
    try {
      await updateSharedGroup(user.uid, group.id, {
        subscriptionId: group.subscriptionId,
        memberNames,
        notes: group.notes || "",
      });
      setFeedback("Integrante agregado correctamente.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo agregar el integrante.";
      setError(message);
    } finally {
      setProcessingGroupId(null);
    }
  };

  const handleRemoveMember = async (group: SharedSubscriptionGroup, memberToRemove: string) => {
    if (!user) {
      return;
    }

    const memberNames = group.memberNames.filter((member) => member !== memberToRemove);
    setProcessingGroupId(group.id);
    setError(null);
    setFeedback(null);
    try {
      await updateSharedGroup(user.uid, group.id, {
        subscriptionId: group.subscriptionId,
        memberNames,
        notes: group.notes || "",
      });
      setFeedback("Integrante eliminado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el integrante.";
      setError(message);
    } finally {
      setProcessingGroupId(null);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) {
      return;
    }
    setProcessingGroupId(groupId);
    setError(null);
    setFeedback(null);
    try {
      await deleteSharedGroup(user.uid, groupId);
      setFeedback("Grupo compartido eliminado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el grupo.";
      setError(message);
    } finally {
      setProcessingGroupId(null);
    }
  };

  const handleCopyLink = async (groupId: string) => {
    const url = `${window.location.origin}/sharing?group=${groupId}`;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Enlace copiado al portapapeles.");
    } catch {
      setError("No se pudo copiar el enlace.");
    }
  };

  const handleReminder = (subscriptionName: string, amount: number, currency: string) => {
    const subject = encodeURIComponent(`Recordatorio de pago - ${subscriptionName}`);
    const body = encodeURIComponent(
      `Hola, este es un recordatorio del pago compartido de ${subscriptionName}. Tu parte corresponde a ${formatMoney(amount, currency)}.`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Suscripciones Compartidas</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Crea grupos de pago compartido sobre tus suscripciones activas.
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <ErrorState title="No se pudo completar la acción" message={error} />
        </div>
      )}
      {feedback && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <Wallet className="w-8 h-8 mb-2" />
          <p className="text-emerald-100 text-sm">Ahorro mensual total</p>
          <p className="text-3xl font-bold">{formatMoney(totalSavings)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Compartidas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalShared}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Miembros totales</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalMembers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Tu pago mensual</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatMoney(totalYourShare)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Crear compartida</h2>
          <button
            type="button"
            onClick={() => navigate("/subscriptions/add")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/20"
          >
            <Plus className="h-4 w-4" />
            Nueva suscripción
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
              Suscripción
            </label>
            <select
              value={newSubscriptionId}
              onChange={(event) => setNewSubscriptionId(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              {subscriptions.length === 0 && <option value="">No tienes activas</option>}
              {subscriptions.map((subscription) => (
                <option key={subscription.id} value={subscription.id}>
                  {subscription.name} · {formatMoney(subscription.amount, subscription.currency)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
              Integrantes (separados por coma o salto de línea)
            </label>
            <textarea
              value={newMembers}
              onChange={(event) => setNewMembers(event.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white resize-none"
              placeholder="Ana Pérez, Carlos Ruiz"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={newNotes}
              onChange={(event) => setNewNotes(event.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white resize-none"
              placeholder="Grupo familiar"
            />
          </div>
        </div>
        <button
          onClick={handleCreateGroup}
          disabled={creating || subscriptions.length === 0}
          className="mt-4 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creando..." : "Crear compartida"}
        </button>
      </div>

      {loading && <LoadingState title="Cargando compartidas..." />}

      {!loading && groupCards.length === 0 && (
        <EmptyState
          icon={Users}
          title="Aún no tienes grupos compartidos"
          description="Crea un grupo para dividir costos con familia o amigos."
        />
      )}

      <div className="space-y-4">
        {groupCards.map(({ group, subscription, memberCount, yourShare, savings }) => (
          <SharedCard
            key={group.id}
            group={group}
            subscription={subscription}
            memberCount={memberCount}
            yourShare={yourShare}
            savings={savings}
            processing={processingGroupId === group.id}
            onDelete={() => handleDeleteGroup(group.id)}
            onCopy={() => handleCopyLink(group.id)}
            onReminder={() => handleReminder(subscription.name, yourShare, preferredCurrency)}
            onAddMember={(member) => handleAddMember(group, member)}
            onRemoveMember={(member) => handleRemoveMember(group, member)}
          />
        ))}
      </div>
    </div>
  );
}

function SharedCard({
  group,
  subscription,
  memberCount,
  yourShare,
  savings,
  processing,
  onDelete,
  onCopy,
  onReminder,
  onAddMember,
  onRemoveMember,
}: {
  group: SharedSubscriptionGroup;
  subscription: Subscription;
  memberCount: number;
  yourShare: number;
  savings: number;
  processing: boolean;
  onDelete: () => void;
  onCopy: () => void;
  onReminder: () => void;
  onAddMember: (name: string) => void;
  onRemoveMember: (name: string) => void;
}) {
  const { formatMoney } = useCurrencyDisplay();
  const [newMemberName, setNewMemberName] = useState("");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 ${subscription.color} rounded-xl flex items-center justify-center text-white text-lg font-semibold`}
          >
            {subscription.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {memberCount} participantes · Tu parte:{" "}
              {formatMoney(yourShare)}
            </p>
          </div>
        </div>
        <div className="text-sm text-emerald-600 font-semibold">
          Ahorras {formatMoney(savings)}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Integrantes</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Actualizado {group.updatedAt.toLocaleDateString("es-CO")}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Tú (Administrador)
            </span>
            <CircleCheckBig className="w-4 h-4 text-emerald-500" />
          </div>
          {group.memberNames.map((member) => (
            <div
              key={member}
              className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-lg"
            >
              <span className="text-sm text-gray-700 dark:text-gray-200">{member}</span>
              <button
                onClick={() => onRemoveMember(member)}
                disabled={processing}
                className="text-red-500 hover:text-red-600 disabled:opacity-50"
                title="Eliminar integrante"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newMemberName}
            onChange={(event) => setNewMemberName(event.target.value)}
            placeholder="Nuevo integrante"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm"
          />
          <button
            onClick={() => {
              onAddMember(newMemberName);
              setNewMemberName("");
            }}
            disabled={processing || !newMemberName.trim()}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 inline-flex items-center gap-1 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {group.notes && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <strong>Notas:</strong> {group.notes}
        </p>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onReminder}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium inline-flex items-center justify-center gap-2 dark:text-gray-200"
        >
          <Mail className="w-4 h-4" />
          Enviar recordatorio
        </button>
        <button
          onClick={onCopy}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium inline-flex items-center justify-center gap-2 dark:text-gray-200"
        >
          <Copy className="w-4 h-4" />
          Copiar enlace
        </button>
        <button
          onClick={onDelete}
          disabled={processing}
          className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
