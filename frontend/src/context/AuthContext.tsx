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

const LOGIN_ROUTE = "/login";
const HOME_ROUTE = "/textgrader/";

interface LoginResponse {
	access_token: string;
	nomeUsuario: string;
	tipoUsuario: "admin" | "professor" | "aluno";
}

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

const getAuthToken = async () => await getAccessToken();
const setAuthToken = (token: string) => localStorage.setItem("accessToken", token);
const removeAuthToken = () => localStorage.removeItem("accessToken");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [nomeUsuario, setNomeUsuario] = useState("");
	const [tipoUsuario, setTipoUsuario] = useState<
		"admin" | "professor" | "aluno" | ""
	>("");
	const [token, setToken] = useState<string | null>(null);
	const router = useRouter();
	const isMounted = useRef(true);

	const login = useCallback(async (email: string, password: string) => {
		const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, {
			email,
			password,
		});

		setAuthToken(data.access_token);
		setToken(data.access_token);
		setIsLoggedIn(true);
		setNomeUsuario(data.nomeUsuario);
		setTipoUsuario(data.tipoUsuario);

		router.push(HOME_ROUTE);
	}, [router]);

	const logout = useCallback(() => {
		removeAuthToken();
		setToken(null);
		setIsLoggedIn(false);
		setNomeUsuario("");
		setTipoUsuario("");
		router.replace(LOGIN_ROUTE);
	}, [router]);

	useEffect(() => {
		const fetchToken = async () => {
		const tokenFromStorage = await getAuthToken();

		if (tokenFromStorage) {
			setToken(tokenFromStorage);
			
			try {
				const profile = await axios.get(`${API_URL}/profile`, {
					headers: { Authorization: `Bearer ${tokenFromStorage}` },
				});

				setIsLoggedIn(true);
				setNomeUsuario(profile.data.nomeUsuario);
				setTipoUsuario(profile.data.tipoUsuario);
			} catch (error) {
				if (isMounted.current) logout();
			}
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

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
