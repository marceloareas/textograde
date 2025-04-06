import { useState, useEffect } from "react";
import { Button, Checkbox, Input, Layout, message } from "antd";
import axios from "axios";
import router from "next/router";
import { useAuth } from "../context";
import { API_URL } from "@/config/config";
import styled from "styled-components";

const { Content } = Layout;

const FormWrapper = styled(Content)`
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 350px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CheckboxGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const InputWrapper = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const CenteredButton = styled.div`
  text-align: center;
`;

const Cadastro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [isProfessor, setIsProfessor] = useState(false);
  const [isAluno, setIsAluno] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const { isLoggedIn } = useAuth();

  // Verificar se já está autenticado
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

  const handleCadastro = async () => {
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

      // Limpa os campos após o cadastro bem-sucedido
      setEmail("");
      setPassword("");
      setTipoUsuario("");
      setNomeUsuario("");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(
          error.response?.data?.error || "Erro ao cadastrar usuário"
        );
      } else {
        message.error("Ocorreu um erro inesperado");
        console.error("Erro inesperado:", error);
      }
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
      <FormWrapper>
        <h2>Cadastro</h2>

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
          <Button onClick={handleCadastro} type="primary" disabled={isDisabled}>
            Cadastrar
          </Button>
        </CenteredButton>
      </FormWrapper>
    </Layout>
  );
};

export default Cadastro;
