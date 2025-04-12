import { useState, useEffect } from "react";
import { Button, Input, Layout, message } from "antd";
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
  max-height: 300px;
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

const ForgotPassword = () => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/textgrader/");
    }
  }, [isLoggedIn, router]);

  const handleSendResetPasswordToEmail = async () => {
    if (!email) {
      message.warning("Por favor, preencha todos os campos.");
      return;
    }

    try {
      // TO DO - Implementar a lógica de envio de email para redefinição de senha
      // throw new Error("Email não encontrado.");
      router.push("/redefinir-senha-codigo/");
    } catch (error) {
      setHasError(true);
      message.error(
        "Ocorreu ao enviar o email. Verifique se o email está correto."
      );
    }
  };

  return (
    <Container>
      <title>Esqueceu sua senha</title>
      <FormContainer>
        <Title>Esqueceu sua senha?</Title>

        <InputGroup>
          <Input
            placeholder="Digite seu email"
            type="email"
            value={email}
            status={hasError ? "error" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              setHasError(false);
            }}
          />
        </InputGroup>

        <FullContainer>
          <Button block type="primary" onClick={handleSendResetPasswordToEmail}>
            Redefinir senha
          </Button>
        </FullContainer>
      </FormContainer>
    </Container>
  );
};

export default ForgotPassword;
