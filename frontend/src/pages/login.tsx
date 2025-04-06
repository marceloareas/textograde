import { useState, useEffect } from "react";
import { Button, Input, Layout, message, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context";
import styled from "styled-components";

const { Content } = Layout;

const Container = styled(Layout)`
  height: calc(100vh - 46px - 64px);  
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled(Content)`
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  width: 350px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const TextCenter = styled.div`
  text-align: center;
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/textgrader/");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      message.warning("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      message.error(
        "Ocorreu um erro ao fazer login. Verifique suas credenciais."
      );
    }
  };

  return (
    <Container>
      <title>Login</title>
      <FormContainer>
        <Title>Login</Title>

        <InputGroup>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Input.Password
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>

        <TextCenter>
          <Button type="primary" onClick={handleLogin}>
            Entrar
          </Button>
        </TextCenter>

        <TextCenter style={{ marginTop: "10px" }}>
          <Typography.Text>
            Não possui uma conta?{" "}
            <Link href="/cadastro">Cadastre-se aqui!</Link>
          </Typography.Text>
        </TextCenter>
      </FormContainer>
    </Container>
  );
};

export default Login;
