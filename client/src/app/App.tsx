import LoadingScreen from "../components/ui/LoadingScreen";
import { useAuth } from "../features/auth/store/auth.store";
import AppRouter from "./router/AppRouter";

export default function App() {
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  return <AppRouter />;
}