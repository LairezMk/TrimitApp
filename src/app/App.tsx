import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyDisplayProvider } from "./contexts/CurrencyDisplayContext";
import { GlobalMotionEffects } from "./components/motion/GlobalMotionEffects";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyDisplayProvider>
          <GlobalMotionEffects />
          <RouterProvider router={router} />
        </CurrencyDisplayProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
