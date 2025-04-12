import { useState, useEffect } from "react";
import { Button, Input, Layout, message, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context";
import styled from "styled-components";

const { Content } = Layout;

const Container = styled(Layout)`
  min-height: calc(100vh - 64px - 46px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled(Content)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  width: 350px;
  max-height: 450px;
  position: relative;
  gap: 20px;
`;

const Title = styled.h2`
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const BottomContent = styled.div`
  text-align: center;
  position: absolute;
  bottom: 40px;
`;

const FullContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
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

          <Input.Password
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>

        {/* <FullContainer>
          <Link href="/esqueceu-sua-senha">Esqueceu sua senha?</Link>
        </FullContainer> */}

        <FullContainer>
          <div style={{ display: "flex", width: "300px", justifyContent: "space-between" }}>
            <Link href="/esqueceu-sua-senha">Esqueceu a senha?</Link>
          </div>

          <Button block type="primary" onClick={handleLogin}>
            Entrar
          </Button>
        </FullContainer>

        <BottomContent>
          <Typography.Text>
            Não possui conta?{" "}
            <Link href="/cadastro">Cadastre-se!</Link>
          </Typography.Text>
        </BottomContent>
      </FormContainer>
    </Container>
  );
};

export default Login;
