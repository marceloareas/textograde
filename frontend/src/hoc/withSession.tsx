import { ComponentType, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/config/config";

const redirectToLogin = async (): Promise<void> => {
    if (typeof window === "object") {
        await localStorage.removeItem("accessToken");
        await localStorage.removeItem("refreshToken");
        await localStorage.removeItem("metadata");

        window.location.href = "/login";
    }
};

const withSession = <P extends object>(
    WrappedComponent: ComponentType<P>
): ((props: P) => JSX.Element) => {
    const ComponentWithSession = (props: P) => {
        const [isLoggedIn, setIsLoggedIn] = useState(false);

        useEffect(() => {
            const checkSession = async () => {
                const tokenFromStorage = localStorage.getItem("accessToken");

                if (tokenFromStorage) {
                    try {
                        await axios.get(`${API_URL}/profile`, {
                            headers: { Authorization: `Bearer ${tokenFromStorage}` },
                        });

                        setIsLoggedIn(true);
                    } catch (error) {
                        redirectToLogin();
                        setIsLoggedIn(false);
                    }
                } else {
                    redirectToLogin();
                        setIsLoggedIn(false);
                }
            };

            checkSession();
            
            return () => {
                setIsLoggedIn(false);
            };
        }, [])

        return <>
            {isLoggedIn ? <WrappedComponent {...props} /> : <></>}
        </>;
    };
    ComponentWithSession.displayName = `withSession(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
    return ComponentWithSession;
};

export default withSession;