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

  const [code, setCode] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/textgrader/");
    }
  }, [isLoggedIn, router]);

  const handleSendResetPasswordToEmail = async () => {
    try {
      // TO DO - Implementar a lógica de envio de email para redefinição de senha
      router.push("/redefinir-senha/");
    } catch (error) {
      message.error(
        "Código Incorreto."
      );
    }
  };

  return (
    <Container>
      <title>Redefinir senha</title>
      <FormContainer>
        <Title>Redefinir senha</Title>

        <InputGroup>
          <Input.OTP
            type="text"
            size="large"
            value={code}
            formatter={(value) => {
              setCode(value.replace(/\D/g, ""));
              return value.replace(/\D/g, "")}
            }
            length={5}
          />
        </InputGroup>

        <FullContainer>
          <Button disabled={!code || code.length < 5} block type="primary" onClick={handleSendResetPasswordToEmail}>
            Continuar
          </Button>
        </FullContainer>
      </FormContainer>
    </Container>
  );
};

export default ResetPasswordCode;
