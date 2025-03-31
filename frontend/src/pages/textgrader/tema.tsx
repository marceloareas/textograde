import { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useAuth } from "@/context";
import router from "next/router";
import styled from "styled-components";
import { API_URL } from "@/config/config";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;

const FormWrapper = styled.div`
  width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

const Tema = () => {
  const [salvarDesabilitado, setSalvarDesabilitado] = useState(true);
  const [form] = Form.useForm();
  const { nomeUsuario, token, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const handleCadastroTema = async (values: any) => {
    if (!token) {
      message.error("Você precisa estar autenticado para cadastrar um tema!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tema`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome_professor: nomeUsuario,
          tema: values.nomeTema,
          descricao: values.descricaoTema,
        }),
      });

      if (response.ok) {
        message.success("Tema cadastrado com sucesso!");
        form.resetFields();
        router.push("/textgrader/");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Erro ao cadastrar o tema.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar o tema:", error);
      message.error("Erro ao cadastrar o tema. Por favor, tente novamente.");
    }
  };

  const handleFormChange = () => {
    const { nomeTema, descricaoTema } = form.getFieldsValue();
    setSalvarDesabilitado(!nomeTema || !descricaoTema);
  };

  return (
    <Container>
      <FormWrapper>
        <Title>Criar Novo Tema</Title>
        <Form
          form={form}
          onFinish={handleCadastroTema}
          onValuesChange={handleFormChange}
        >
          <Form.Item
            name="nomeTema"
            label="Nome do Tema"
            rules={[
              { required: true, message: "Por favor, insira o nome do tema!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descricaoTema"
            label="Descrição do Tema"
            rules={[
              {
                required: true,
                message: "Por favor, insira a descrição do tema!",
              },
            ]}
          >
            <Input.TextArea rows={12} />
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={salvarDesabilitado}
              >
                Salvar
              </Button>
            </div>
          </Form.Item>
        </Form>
      </FormWrapper>
    </Container>
  );
};

export default Tema;
