import { getAccessToken } from "@/context";
import axios from "axios";

const client = axios.create({
    baseURL: "http://localhost:5000",
});

client.interceptors.request.use(
    async config => {
        const token = await getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers["Cache-Control"] = "no-cache";
        }
        return config;
    },
    error => Promise.reject(error)
);

export { client };
