import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiErrorMessage } from "../../../lib/api";
import { storage } from "../../../lib/storage";
import type { AuthUser, LoginPayload, RegisterPayload } from "../../../types";
import { getCurrentUser, login, register } from "../api/auth.api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  authError: string | null;
  loginUser: (payload: LoginPayload) => Promise<AuthUser>;
  registerUser: (payload: RegisterPayload) => Promise<AuthUser>;
  logoutUser: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadCurrentUser = useCallback(async () => {
    const token = storage.getToken();

    if (!token) {
      setUser(null);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      storage.removeToken();
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const loginUser = useCallback(async (payload: LoginPayload) => {
    try {
      setAuthError(null);

      const authData = await login(payload);
      storage.setToken(authData.token);
      setUser(authData.user);

      return authData.user;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setAuthError(message);
      throw error;
    }
  }, []);

  const registerUser = useCallback(async (payload: RegisterPayload) => {
    try {
      setAuthError(null);

      const authData = await register(payload);
      storage.setToken(authData.token);
      setUser(authData.user);

      return authData.user;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setAuthError(message);
      throw error;
    }
  }, []);

  const logoutUser = useCallback(() => {
    storage.removeToken();
    setUser(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      authError,
      loginUser,
      registerUser,
      logoutUser,
      clearAuthError,
    }),
    [
      user,
      isCheckingAuth,
      authError,
      loginUser,
      registerUser,
      logoutUser,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}