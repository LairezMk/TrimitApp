import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Layout from "./components/Layout";
import AuthPage from "./pages/Auth";
import AuthGuard from "./components/auth/AuthGuard";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import AddSubscription from "./pages/AddSubscription";
import SubscriptionDetail from "./pages/SubscriptionDetail";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Budget from "./pages/Budget";
import Categories from "./pages/Categories";
import PaymentMethods from "./pages/PaymentMethods";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Trends from "./pages/Trends";
import Recommendations from "./pages/Recommendations";
import Reminders from "./pages/Reminders";
import Notifications from "./pages/Notifications";
import Calculator from "./pages/Calculator";
import Archived from "./pages/Archived";
import Sharing from "./pages/Sharing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    Component: AuthGuard,
    children: [
      {
        Component: Layout,
        children: [
          {
            path: "/dashboard",
            Component: Dashboard,
          },
          {
            path: "/subscriptions",
            Component: Subscriptions,
          },
          {
            path: "/subscriptions/add",
            Component: AddSubscription,
          },
          {
            path: "/subscriptions/:id",
            Component: SubscriptionDetail,
          },
          {
            path: "/calendar",
            Component: Calendar,
          },
          {
            path: "/analytics",
            Component: Analytics,
          },
          {
            path: "/budget",
            Component: Budget,
          },
          {
            path: "/categories",
            Component: Categories,
          },
          {
            path: "/payment-methods",
            Component: PaymentMethods,
          },
          {
            path: "/payments",
            Component: Payments,
          },
          {
            path: "/reports",
            Component: Reports,
          },
          {
            path: "/trends",
            Component: Trends,
          },
          {
            path: "/recommendations",
            Component: Recommendations,
          },
          {
            path: "/reminders",
            Component: Reminders,
          },
          {
            path: "/notifications",
            Component: Notifications,
          },
          {
            path: "/calculator",
            Component: Calculator,
          },
          {
            path: "/archived",
            Component: Archived,
          },
          {
            path: "/sharing",
            Component: Sharing,
          },
          {
            path: "/profile",
            Component: Profile,
          },
          {
            path: "/settings",
            Component: Settings,
          },
          {
            path: "/help",
            Component: Help,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: Landing,
  },
]);
