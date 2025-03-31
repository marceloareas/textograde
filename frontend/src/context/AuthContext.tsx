import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { API_URL } from "../config/config";
import { message } from "antd";

// Define o tipo do contexto de autenticação
type AuthContextType = {
  isLoggedIn: boolean;
  nomeUsuario: string;
  tipoUsuario: "admin" | "professor" | "aluno" | "";
  token: string | null; // Adicionando a propriedade 'token'
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para obter o token armazenado nos cookies
const getAuthToken = () => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="));
  return token ? token.split("=")[1] : null;
};

// Fornecendo o contexto de autenticação para a aplicação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<
    "admin" | "professor" | "aluno" | ""
  >("");
  const [token, setToken] = useState<string | null>(null); // Estado para o token
  const router = useRouter();

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Salva o token de autenticação no cookie e no estado
      document.cookie = `auth_token=${data.access_token}; path=/`;
      setToken(data.access_token);

      // Atualiza os dados do usuário
      setIsLoggedIn(true);
      setNomeUsuario(data.nomeUsuario);
      setTipoUsuario(data.tipoUsuario);

      // Redireciona para a página principal
      router.push("/textgrader/");
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
  };

  // Função de logout
  const logout = useCallback(() => {
    document.cookie = `auth_token=; path=/; max-age=0`; // Remove o token
    setToken(null); // Limpa o token no estado
    setIsLoggedIn(false);
    setNomeUsuario("");
    setTipoUsuario("");
    router.push("/login");
  }, [router]);

  // Checa o token no carregamento inicial
  useEffect(() => {
    const tokenFromCookie = getAuthToken();

    if (tokenFromCookie) {
      setToken(tokenFromCookie); // Atualiza o token se encontrado
      axios
        .get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${tokenFromCookie}` },
        })
        .then((response) => {
          setIsLoggedIn(true);
          setNomeUsuario(response.data.nomeUsuario);
          setTipoUsuario(response.data.tipoUsuario); // Atualiza o tipo de usuário
        })
        .catch(() => logout()); // Caso o token seja inválido, faz logout
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
