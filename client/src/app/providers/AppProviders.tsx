 import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "../../features/auth/store/auth.store";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}