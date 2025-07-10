import { useState, useEffect, FormEvent } from "react";
import { Button, Input, Layout, message } from "antd";
import { useRouter } from "next/router";
import { useAuth } from "../context";
import styled from "styled-components";
import { resetPasswordClient } from "@/services/resetPasswordClient";

const Container = styled(Layout)`
  height: calc(100vh - 46px - 64px);  
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.form`
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  width: 350px;
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
`;

const FullContainer = styled.div`
  display: flex;
  width: 100%;
`;

const ResetPassword = () => {
	const { isLoggedIn } = useAuth();
	const router = useRouter();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [hasError, setHasError] = useState<boolean>(false);

	useEffect(() => {
		if (isLoggedIn) {
			router.push("/textgrader/");
		}
	}, [isLoggedIn, router]);

	const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
		if (!password || !confirmPassword) {
			message.warning("Por favor, preencha todos os campos.");
			return;
		}

		if (password !== confirmPassword) {
			message.warning("As senhas não são iguais.");
			setHasError(true);
			return;
		}

		try {
			const { data } = await resetPasswordClient.post("/reset-password", {
				new_password: password,
			});

			if (data.status) {
				message.success("Senha redefinida com sucesso!");
				localStorage.removeItem("resetPasswordAccessToken");
				router.push("/login");
			}
		} catch (error) {
			message.error(
				"Ocorreu um erro ao redefinir sua senha. Verifique se os dados estão corretos."
			);
		}
	};

	return (
		<Container>
			<title>Confirme o código</title>

			<FormContainer onSubmit={handleChangePassword}>
				<Title>Redefina sua senha</Title>

				<InputGroup>
					<Input.Password
						placeholder="Digite sua nova Senha"
						status={hasError ? "error" : undefined}
						value={password}
						onChange={(e) => {
						setHasError(false);
						setPassword(e.target.value)
						}}
					/>
				</InputGroup>

				<InputGroup>
					<Input.Password 
						placeholder="Confirme sua nova Senha"
						status={hasError ? "error" : undefined}
						value={confirmPassword}
						onChange={(e) => {
						setHasError(false);
						setConfirmPassword(e.target.value)
						}}
					/>
				</InputGroup>

				<FullContainer>
					<Button block type="primary" htmlType="submit">
						Redefinir senha
					</Button>
				</FullContainer>
			</FormContainer>
		</Container>
	);
};

export default ResetPassword;
