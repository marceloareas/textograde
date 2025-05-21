import { getResetPasswordAccessToken } from "@/context";
import axios from "axios";

const resetPasswordClient = axios.create({
    baseURL: "http://localhost:5000",
});

resetPasswordClient.interceptors.request.use(
    async config => {
        const token = await getResetPasswordAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers["Cache-Control"] = "no-cache";
        }
        return config;
    },
    error => Promise.reject(error)
);

export { resetPasswordClient };
