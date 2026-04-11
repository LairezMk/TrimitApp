import { useEffect, useState } from "react";
import type { Subscription, SubscriptionRule } from "../types/subscription";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  Bell,
  X,
  Save,
} from "lucide-react";

interface EditSubscriptionSheetProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

export function EditSubscriptionSheet({
  subscription,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditSubscriptionSheetProps) {
  const [editedSubscription, setEditedSubscription] =
    useState<Subscription>(subscription);
  const [showAddRule, setShowAddRule] = useState(false);

  useEffect(() => {
    setEditedSubscription(subscription);
  }, [subscription]);

  const handleSave = () => {
    onSave(editedSubscription);
  };

  const handleAddRule = () => {
    const newRule: SubscriptionRule = {
      id: Date.now().toString(),
      type: "alert",
      condition: "before_payment",
      value: "3 días antes",
    };

    setEditedSubscription({
      ...editedSubscription,
      rules: [...(editedSubscription.rules || []), newRule],
    });
    setShowAddRule(false);
  };

  const handleRemoveRule = (ruleId: string) => {
    setEditedSubscription({
      ...editedSubscription,
      rules: editedSubscription.rules?.filter((r) => r.id !== ruleId) || [],
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${editedSubscription.color} rounded-lg flex items-center justify-center text-white`}
            >
              {editedSubscription.icon}
            </div>
            Editar Suscripción
          </SheetTitle>
          <SheetDescription>
            Modifica los detalles de tu suscripción y crea reglas
            personalizadas
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={editedSubscription.name}
              onChange={(e) =>
                setEditedSubscription({
                  ...editedSubscription,
                  name: e.target.value,
                })
              }
              placeholder="Nombre de la suscripción"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto mensual</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={editedSubscription.amount}
                onChange={(e) =>
                  setEditedSubscription({
                    ...editedSubscription,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={editedSubscription.category}
              onChange={(e) =>
                setEditedSubscription({
                  ...editedSubscription,
                  category: e.target.value,
                })
              }
              placeholder="Ej: Entretenimiento, Productividad"
            />
          </div>

          {/* Is Recurring */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="recurring">Pago recurrente</Label>
              <p className="text-sm text-gray-500">
                Se renueva automáticamente cada mes
              </p>
            </div>
            <Switch
              id="recurring"
              checked={editedSubscription.isRecurring}
              onCheckedChange={(checked) =>
                setEditedSubscription({
                  ...editedSubscription,
                  isRecurring: checked,
                })
              }
            />
          </div>

          {/* Next Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="nextPayment">Próximo pago</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="nextPayment"
                type="date"
                value={
                  editedSubscription.nextPaymentDate
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) =>
                  setEditedSubscription({
                    ...editedSubscription,
                    nextPaymentDate: new Date(e.target.value),
                  })
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "active", label: "Activa", color: "emerald" },
                { value: "forgotten", label: "Olvidada", color: "amber" },
                { value: "suspended", label: "Suspendida", color: "cyan" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    setEditedSubscription({
                      ...editedSubscription,
                      status: status.value as Subscription["status"],
                    })
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    editedSubscription.status === status.value
                      ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={editedSubscription.notes || ""}
              onChange={(e) =>
                setEditedSubscription({
                  ...editedSubscription,
                  notes: e.target.value,
                })
              }
              placeholder="Añade notas sobre esta suscripción..."
              rows={3}
            />
          </div>

          {/* Rules Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Reglas y alertas
                </h3>
                <p className="text-sm text-gray-500">
                  Crea reglas para gestionar esta suscripción
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddRule(!showAddRule)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            </div>

            {/* Show Add Rule Form */}
            {showAddRule && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label>Tipo de regla</Label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option value="alert">
                      Alerta - Notificarme antes del pago
                    </option>
                    <option value="cancel">
                      Cancelar - Recordarme cancelar
                    </option>
                    <option value="notify">
                      Notificar - Enviar recordatorio
                    </option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddRule}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Crear regla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddRule(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Rules */}
            <div className="space-y-2">
              {editedSubscription.rules?.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      {rule.type === "alert"
                        ? "Alerta de pago"
                        : rule.type === "cancel"
                        ? "Recordatorio de cancelación"
                        : "Notificación"}
                    </p>
                    <p className="text-xs text-emerald-600">{rule.value}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveRule(rule.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar cambios
            </Button>
            <Button
              onClick={() => onDelete(editedSubscription.id)}
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
