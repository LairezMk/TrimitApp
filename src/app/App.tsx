import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GlobalMotionEffects } from "./components/motion/GlobalMotionEffects";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalMotionEffects />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
