import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, MailPlus, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createUserSubscriptionIfNotExists } from "../services/subscriptions";
import {
  clearDetectedSubscriptionsDrafts,
  detectSubscriptionsFromGmail,
  saveDetectedSubscriptionsDrafts,
  readDetectedSubscriptionsDrafts,
  type DetectedSubscriptionDraft,
} from "../services/gmailDetection";
import { dateFromInputValue } from "../utils/date";

export default function GmailSubscriptionConfirmation() {
  const navigate = useNavigate();
  const { user, requestGmailAccessToken } = useAuth();
  const [drafts, setDrafts] = useState<DetectedSubscriptionDraft[]>(
    readDetectedSubscriptionsDrafts(),
  );
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(readDetectedSubscriptionsDrafts().map((item) => [item.id, true])),
  );
  const [saving, setSaving] = useState(false);
  const [scanningAnother, setScanningAnother] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasBankSource = useMemo(
    () => drafts.some((item) => item.source === "bank-statement"),
    [drafts],
  );

  const selectedCount = useMemo(
    () => drafts.filter((item) => selected[item.id]).length,
    [drafts, selected],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (
    id: string,
    key: keyof DetectedSubscriptionDraft,
    value: string | number | boolean,
  ) => {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const handleSkip = () => {
    clearDetectedSubscriptionsDrafts();
    navigate("/dashboard");
  };

  const mergeDetectedDrafts = (
    current: DetectedSubscriptionDraft[],
    incoming: DetectedSubscriptionDraft[],
  ) => {
    const byName = new Map<string, DetectedSubscriptionDraft>();
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    for (const draft of [...current, ...incoming]) {
      const key = normalize(draft.name);
      const existing = byName.get(key);
      if (!existing || draft.confidence > existing.confidence) {
        byName.set(key, draft);
      }
    }

    return Array.from(byName.values()).sort((a, b) => b.confidence - a.confidence);
  };

  const handleScanAnotherEmail = async () => {
    if (!user) {
      setError("Debes iniciar sesión para detectar suscripciones por correo.");
      return;
    }

    setScanningAnother(true);
    setError(null);

    try {
      const accessToken = await requestGmailAccessToken();
      const detected = await detectSubscriptionsFromGmail(accessToken);
      const merged = mergeDetectedDrafts(drafts, detected);
      setDrafts(merged);
      setSelected((prev) => ({
        ...prev,
        ...Object.fromEntries(merged.map((item) => [item.id, prev[item.id] ?? true])),
      }));
      saveDetectedSubscriptionsDrafts(merged);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron detectar suscripciones desde el correo.";
      setError(message);
    } finally {
      setScanningAnother(false);
    }
  };

  const handleImport = async () => {
    if (!user) {
      setError("Debes iniciar sesión para continuar.");
      return;
    }

    const toImport = drafts.filter((item) => selected[item.id]);
    if (!toImport.length) {
      setError("Selecciona al menos una suscripción para importar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let createdCount = 0;
      let duplicateCount = 0;

      for (const item of toImport) {
        const sourceLabel =
          item.source === "bank-statement" ? "extracto bancario" : "correo";

        const result = await createUserSubscriptionIfNotExists(user.uid, {
          name: item.name.trim(),
          category: item.category,
          amount: Number(item.amount || 0),
          currency: item.currency || "$",
          status: "active",
          isRecurring: item.isRecurring,
          nextPaymentDate: dateFromInputValue(item.nextPaymentDate),
          icon: (item.icon.trim() || item.name.charAt(0) || "S").toUpperCase(),
          color: item.color || "bg-emerald-500",
          notes: `Detectada desde ${sourceLabel}. Referencia: ${item.subject}`,
          source: item.source,
        });

        if (result.created) {
          createdCount += 1;
        } else {
          duplicateCount += 1;
        }
      }

      if (!createdCount && duplicateCount) {
        setError("Las suscripciones seleccionadas ya existen y no se duplicaron.");
        return;
      }

      clearDetectedSubscriptionsDrafts();
      navigate("/subscriptions");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo importar.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <button
        onClick={handleSkip}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Omitir por ahora
      </button>

      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Detección automática</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Revisamos la información detectada y te proponemos posibles
          suscripciones para importar con seguridad.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 p-4 flex items-start gap-3">
        <Mail className="w-5 h-5 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        <div className="text-sm text-emerald-800 dark:text-emerald-300">
          Detectamos <strong>{drafts.length}</strong> coincidencias desde{" "}
          <strong>{hasBankSource ? "extracto bancario/correo" : "correo"}</strong>.
          Revisa montos y próxima renovación antes de importar.
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleScanAnotherEmail}
          disabled={scanningAnother || saving}
          className="w-full sm:w-auto px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {scanningAnother ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Escaneando...
            </>
          ) : (
            <>
              <MailPlus className="w-4 h-4" />
              Escanear otro correo
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:self-center">
          Úsalo para autorizar otra cuenta Gmail y sumar sus resultados sin duplicados.
        </p>
      </div>

      {drafts.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-gray-600 dark:text-gray-300">
          No encontramos suscripciones claras para importar.
        </div>
      )}

      <div className="space-y-4">
        {drafts.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(selected[item.id])}
                  onChange={() => toggleSelect(item.id)}
                  className="h-5 w-5"
                />
                <div
                  className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center text-white`}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Confianza de detección: {item.confidence}%
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>De: {item.from}</p>
                <p className="truncate max-w-[420px]">Asunto: {item.subject}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input
                  value={item.name}
                  onChange={(e) => handleFieldChange(item.id, "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                <input
                  value={item.category}
                  onChange={(e) =>
                    handleFieldChange(item.id, "category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) =>
                    handleFieldChange(item.id, "amount", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Próxima renovación
                </label>
                <input
                  type="date"
                  value={item.nextPaymentDate}
                  onChange={(e) =>
                    handleFieldChange(item.id, "nextPaymentDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <button
          onClick={handleSkip}
          className="md:w-40 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Omitir
        </button>
        <button
          onClick={handleImport}
          disabled={saving || drafts.length === 0}
          className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            "Importando..."
          ) : (
            <>
              <Save className="w-4 h-4" />
              Importar seleccionadas ({selectedCount})
            </>
          )}
        </button>
        <button
          onClick={() =>
            setSelected(
              Object.fromEntries(drafts.map((item) => [item.id, true])),
            )
          }
          className="md:w-52 px-6 py-3 border border-emerald-300 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors inline-flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Seleccionar todo
        </button>
      </div>
    </div>
  );
}
