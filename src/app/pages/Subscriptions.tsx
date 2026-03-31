import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { EditSubscriptionSheet } from "../components/EditSubscriptionSheet";
import type { Subscription } from "../types/subscription";

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    category: "Entretenimiento",
    amount: 19.61,
    currency: "$",
    status: "active",
    isRecurring: true,
    nextPaymentDate: new Date("2026-02-28"),
    icon: "N",
    color: "bg-red-500",
  },
  {
    id: "2",
    name: "Gym Active",
    category: "Salud",
    amount: 10.4,
    currency: "$",
    status: "active",
    isRecurring: true,
    nextPaymentDate: new Date("2026-03-05"),
    icon: "G",
    color: "bg-orange-500",
  },
  {
    id: "3",
    name: "Disney+",
    category: "Entretenimiento",
    amount: 21.96,
    currency: "$",
    status: "forgotten",
    isRecurring: true,
    nextPaymentDate: new Date("2026-02-25"),
    icon: "D",
    color: "bg-blue-600",
  },
  {
    id: "4",
    name: "Adobe Creative Cloud",
    category: "Productividad",
    amount: 54.99,
    currency: "$",
    status: "active",
    isRecurring: true,
    nextPaymentDate: new Date("2026-03-01"),
    icon: "A",
    color: "bg-red-600",
  },
  {
    id: "5",
    name: "Spotify",
    category: "Música",
    amount: 9.99,
    currency: "$",
    status: "suspended",
    isRecurring: true,
    nextPaymentDate: new Date("2026-03-10"),
    icon: "S",
    color: "bg-green-500",
  },
  {
    id: "6",
    name: "Amazon Prime",
    category: "Entretenimiento",
    amount: 14.99,
    currency: "$",
    status: "active",
    isRecurring: true,
    nextPaymentDate: new Date("2026-02-22"),
    icon: "A",
    color: "bg-sky-500",
  },
  {
    id: "7",
    name: "YouTube Premium",
    category: "Entretenimiento",
    amount: 11.99,
    currency: "$",
    status: "active",
    isRecurring: true,
    nextPaymentDate: new Date("2026-03-15"),
    icon: "Y",
    color: "bg-red-500",
  },
  {
    id: "8",
    name: "Notion",
    category: "Productividad",
    amount: 10.0,
    currency: "$",
    status: "active",
    isRecurring: true,
    nextPaymentDate: new Date("2026-02-27"),
    icon: "N",
    color: "bg-gray-800",
  },
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsEditSheetOpen(true);
  };

  const handleSaveSubscription = (updatedSubscription: Subscription) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === updatedSubscription.id ? updatedSubscription : sub
      )
    );
    setIsEditSheetOpen(false);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    setIsEditSheetOpen(false);
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mis Suscripciones</h1>
        <p className="text-gray-500">
          Gestiona y controla todas tus suscripciones en un solo lugar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Gasto mensual total</p>
          <p className="text-3xl text-emerald-600">${totalMonthly.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Suscripciones activas</p>
          <p className="text-3xl">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Suscripciones olvidadas</p>
          <p className="text-3xl text-amber-600">{forgottenCount}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filterStatus === "all"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filterStatus === "active"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setFilterStatus("forgotten")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filterStatus === "forgotten"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Olvidadas
              </button>
            </div>
            <Button
              onClick={() => navigate("/dashboard/add-subscription")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva
            </Button>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onClick={() => handleEditSubscription(subscription)}
          />
        ))}
      </div>

      {/* Edit Subscription Sheet */}
      {selectedSubscription && (
        <EditSubscriptionSheet
          subscription={selectedSubscription}
          isOpen={isEditSheetOpen}
          onClose={() => setIsEditSheetOpen(false)}
          onSave={handleSaveSubscription}
          onDelete={handleDeleteSubscription}
        />
      )}
    </div>
  );
}