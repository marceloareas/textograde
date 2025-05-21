import { useState, useEffect, FormEvent } from "react";
import { Button, Checkbox, Input, Layout, message } from "antd";
import axios from "axios";
import router from "next/router";
import { useAuth } from "@/context";
import { API_URL } from "@/config/config";
import { CenteredButton, CheckboxGroup, FormWrapper, InputWrapper } from "./styles";

const Cadastro = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [nomeUsuario, setNomeUsuario] = useState("");
	const [isProfessor, setIsProfessor] = useState(false);
	const [isAluno, setIsAluno] = useState(false);
	const [tipoUsuario, setTipoUsuario] = useState("");
	const { isLoggedIn } = useAuth();

	useEffect(() => {
		if (isLoggedIn) {
			router.push("/textgrader/");
		}
	}, [isLoggedIn]);

	const handleCheckboxChange = (type: string) => {
		if (type === "professor") {
			setIsProfessor(!isProfessor);
			setIsAluno(false);
			setTipoUsuario(type);
		} else if (type === "aluno") {
			setIsAluno(!isAluno);
			setIsProfessor(false);
			setTipoUsuario(type);
		}
	};

	const handleCadastro = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

		if (!emailRegex.test(email)) {
			message.error("Por favor, insira um email válido.");
			return;
		}

		try {
			const response = await axios.post(`${API_URL}/register`, {
				email,
				password,
				nomeUsuario,
				tipoUsuario,
			});

			message.success(response.data.message);

			setEmail("");
			setPassword("");
			setTipoUsuario("");
			setNomeUsuario("");
			router.push("/login");
		} catch (error) {
			message.error("Erro ao cadastrar usuário");
		}
	};

	const isDisabled = !isProfessor && !isAluno;

	return (
		<Layout
			style={{
				height: "calc(100vh - 46px - 64px)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
		<FormWrapper onSubmit={handleCadastro}>
			<h2 style={{ marginBottom: 40 }}>Cadastro</h2>

			<CheckboxGroup>
				<Checkbox
					checked={isProfessor}
					onChange={() => handleCheckboxChange("professor")}
				>
					Professor
				</Checkbox>
				<Checkbox
					checked={isAluno}
					onChange={() => handleCheckboxChange("aluno")}
				>
					Aluno
				</Checkbox>
			</CheckboxGroup>

			<InputWrapper>
				<Input
					required
					placeholder="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					disabled={isDisabled}
				/>
			</InputWrapper>

			<InputWrapper>
				<Input
					required
					placeholder="Nome de usuário"
					value={nomeUsuario}
					onChange={(e) => setNomeUsuario(e.target.value)}
					disabled={isDisabled}
				/>
			</InputWrapper>

			<InputWrapper>
				<Input.Password
					required
					placeholder="Senha"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={isDisabled}
				/>
			</InputWrapper>

			<CenteredButton>
				<Button onClick={() => router.push("/login")} type="text">
					Cancelar
				</Button>

				<Button htmlType="submit" type="primary" disabled={isDisabled}>
					Cadastrar
				</Button>
			</CenteredButton>
		</FormWrapper>
		</Layout>
	);
};

export default Cadastro;
