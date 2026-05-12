import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Calendar, Camera, KeyRound, Mail, MapPin, Phone, Save, Trophy, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";

interface ProfileForm {
  displayName: string;
  phone: string;
  location: string;
  photoURL: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  const { formatMoney, convertMoney } = useCurrencyDisplay();
  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    phone: "",
    location: "",
    photoURL: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data() as Record<string, unknown> | undefined;

        setForm({
          displayName:
            (data?.displayName as string | undefined) ||
            user.displayName ||
            "Usuario",
          phone: (data?.phone as string | undefined) || "",
          location: (data?.location as string | undefined) || "",
          photoURL:
            (data?.photoURL as string | undefined) ||
            user.photoURL ||
            "",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToUserSubscriptions(
      user.uid,
      (subscriptions) => {
        const active = subscriptions.filter((sub) => sub.status === "active");
        setActiveCount(active.length);
        setMonthlyTotal(active.reduce((sum, sub) => sum + convertMoney(sub.amount, sub.currency), 0));
      },
      () => undefined,
    );
  }, [user, convertMoney]);

  const avatarFallback = useMemo(() => {
    const name = form.displayName.trim() || user?.displayName || "Usuario";
    const parts = name.split(" ").filter(Boolean);
    return (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
  }, [form.displayName, user?.displayName]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await updateProfile(user, {
        displayName: form.displayName.trim() || "Usuario",
        photoURL: form.photoURL.trim() || null,
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: form.displayName.trim() || "Usuario",
          phone: form.phone.trim(),
          location: form.location.trim(),
          photoURL: form.photoURL.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setMessage("Perfil actualizado correctamente.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo guardar.";
      setMessage(text);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!newPassword.trim()) {
      setPasswordMessage("Ingresa una nueva contrasena.");
      return;
    }

    if (newPassword.trim().length < 8) {
      setPasswordMessage("La nueva contrasena debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("La confirmacion de contrasena no coincide.");
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage("Contrasena actualizada correctamente.");
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "No se pudo actualizar la contrasena.";
      setPasswordMessage(text);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-6 lg:p-8 text-gray-500">Cargando perfil...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Modifica tu información personal y visual de la cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {form.photoURL ? (
                  <img
                    src={form.photoURL}
                    alt="Foto de perfil"
                    className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-semibold">
                    {avatarFallback}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid place-items-center">
                  <Camera className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {form.displayName || "Usuario"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || "Sin correo"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  <span className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre visible
                  </span>
                </label>
                <input
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  URL de foto de perfil
                </label>
                <input
                  value={form.photoURL}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, photoURL: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </span>
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación
                  </span>
                </label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {message && (
                <p className="text-sm text-gray-600 dark:text-gray-300 self-center">
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 inline-flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Seguridad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  Contrasena actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Solo requerida para cuentas con email y contrasena"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  Nueva contrasena
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">
                  Confirmar nueva contrasena
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <KeyRound className="w-4 h-4" />
                {changingPassword ? "Actualizando..." : "Cambiar contrasena"}
              </button>
              {passwordMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-300 self-center">
                  {passwordMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Resumen de cuenta
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Suscripciones activas
                </span>
                <span className="font-semibold text-emerald-600">{activeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Gasto mensual
                </span>
                <span className="font-semibold">
                  {formatMoney(monthlyTotal, "COP")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Correo
                </span>
                <span className="text-sm inline-flex items-center gap-1 text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  Activo
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              Miembro desde{" "}
              {format(
                new Date(user?.metadata.creationTime || Date.now()),
                "MMMM yyyy",
                { locale: es },
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gamificación</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Sigue tu progreso en logros
                </p>
              </div>
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <button
              onClick={() => navigate("/profile/achievements")}
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm"
            >
              Ver logros
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
