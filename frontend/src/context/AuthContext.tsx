import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { API_URL } from "../config/config";
import { message } from "antd";

// Constantes para evitar strings hardcoded
const LOGIN_ROUTE = "/login";
const HOME_ROUTE = "/textgrader/";

// Tipos para os dados retornados pela API
interface LoginResponse {
  access_token: string;
  nomeUsuario: string;
  tipoUsuario: "admin" | "professor" | "aluno";
}

interface ProfileResponse {
  nomeUsuario: string;
  tipoUsuario: "admin" | "professor" | "aluno";
}

// Tipo do contexto de autenticação
type AuthContextType = {
  isLoggedIn: boolean;
  nomeUsuario: string;
  tipoUsuario: "admin" | "professor" | "aluno" | "";
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getAccessToken = async (): Promise<string | null> => {
  try {
      const isClient = typeof window === "object";
      return isClient ? window.localStorage.getItem("accessToken") : null;
  } catch (err) {
      throw new Error("Could not retrieve refresh token");
  }
};

// Função utilitária para lidar com o token no localStorage
const getAuthToken = async () => await getAccessToken();
const setAuthToken = (token: string) =>
  localStorage.setItem("accessToken", token);
const removeAuthToken = () => localStorage.removeItem("accessToken");

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<
    "admin" | "professor" | "aluno" | ""
  >("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const isMounted = useRef(true);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, {
        email,
        password,
      });

      // Salva o token e atualiza o estado
      setAuthToken(data.access_token);
      setToken(data.access_token);
      setIsLoggedIn(true);
      setNomeUsuario(data.nomeUsuario);
      setTipoUsuario(data.tipoUsuario);

      // Redireciona para a página principal
      router.push(HOME_ROUTE);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(
          error.response?.data?.error ||
            "Erro ao realizar login! Por favor, tente novamente."
        );
      } else {
        message.error("Ocorreu um erro inesperado");
        console.error("Erro inesperado:", error);
      }
    }
  }, [router]);

  // Função de logout
  const logout = useCallback(() => {
    removeAuthToken();
    setToken(null);
    setIsLoggedIn(false);
    setNomeUsuario("");
    setTipoUsuario("");
    router.replace(LOGIN_ROUTE);
  }, [router]);

  // Checa o token no carregamento inicial
  useEffect(() => {
    const fetchToken = async () => {
      const tokenFromStorage = await getAuthToken();
  
      if (tokenFromStorage) {
        setToken(tokenFromStorage);
  
        axios
          .get<ProfileResponse>(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${tokenFromStorage}` },
          })
          .then((response) => {
            if (isMounted.current) {
              setIsLoggedIn(true);
              setNomeUsuario(response.data.nomeUsuario);
              setTipoUsuario(response.data.tipoUsuario);
            }
          })
          .catch(() => {
            if (isMounted.current) logout();
          });
      }
    };

    fetchToken();

    return () => {
      isMounted.current = false;
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        nomeUsuario,
        tipoUsuario,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
