import { useState, useEffect, FormEvent } from "react";
import { Button, Input, Layout, message } from "antd";
import { useRouter } from "next/router";
import { useAuth } from "../context";
import styled from "styled-components";
import { client } from "@/services/client";

const { Content } = Layout;

const Container = styled(Layout)`
  height: calc(100vh - 46px - 64px);  
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.form`
  padding: 20px 50px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 20px;
`;

const Title = styled.h2`
  text-align: center;
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FullContainer = styled.div`
  display: flex;
  width: 100%;
`;

const ResetPasswordCode = () => {
	const { isLoggedIn } = useAuth();
	const router = useRouter();
	const { email } = router.query;

	const [code, setCode] = useState("");
	const [hasError, setHasError] = useState<boolean>(false);

	useEffect(() => {
		if (isLoggedIn) {
			router.push("/textgrader/");
		}
	}, [isLoggedIn, router]);

	const handleCheckCode = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const { data } = await client.post("/verify-code", { email, code });

			if (data.access_token) {
				localStorage.setItem("resetPasswordAccessToken", data.access_token);
				router.push("/redefinir-senha/");
			}
		} catch (error) {
			setHasError(true);
			message.error("Código Incorreto.");
		}
	};

	return (
		<Container>
			<title>Redefinir senha</title>

			<FormContainer onSubmit={handleCheckCode}>
				<Title>Redefinir senha</Title>

				<InputGroup>
					<Input.OTP
						status={hasError ? "error" : undefined}
						type="text"
						size="large"
						value={code}
						formatter={(value) => {
							setHasError(false);
							setCode(value.replace(/\D/g, ""));
							return value.replace(/\D/g, "")}
						}
						length={5}
					/>
				</InputGroup>

				<FullContainer>
					<Button disabled={!code || code.length < 5} block type="primary" htmlType="submit">
						Continuar
					</Button>
				</FullContainer>
			</FormContainer>
		</Container>
	);
};

export default ResetPasswordCode;
