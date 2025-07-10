import { useState } from "react";
import { Form, Input, Button, message, Space } from "antd";
import { useAuth } from "@/context";
import router from "next/router";
import withSession from "@/hoc/withSession";
import { client } from "@/services/client";
import { Container, FormWrapper, Title } from "./styles";

const Tema = () => {
	const [enabledSave, setEnabledSave] = useState<boolean>(false);
	const [ form ] = Form.useForm();
	const { nomeUsuario, token } = useAuth();

	const handleCadastroTema = async (values: any) => {
		if (!token) {
			message.error("Você precisa estar autenticado para cadastrar um tema!");
			return;
		}

		try {
			const response = await client.post(
				`/tema`,
				{
					nome_professor: nomeUsuario,
					tema: values.themeName,
					descricao: values.themeDescription,
				},
			);

			if (response.status === 201) {
				message.success("Tema cadastrado com sucesso!");
				form.resetFields();
				router.push("/textgrader/");
			} else {
				const errorData = response.data;
				message.error(errorData.error || "Erro ao cadastrar o tema.");
			}
		} catch (error) {
			message.error("Erro ao cadastrar o tema. Por favor, tente novamente.");
		}
	};

	const handleFormChange = () => {
		const { themeName, themeDescription } = form.getFieldsValue();
		setEnabledSave(themeName && themeDescription)
	};

	return (
		<Container>
			<FormWrapper>
				<Title>Criar Novo Tema</Title>

				<Form
					form={form}
					onFinish={handleCadastroTema}
					onValuesChange={handleFormChange}
					layout="vertical"
				>
					<Form.Item
						name="themeName"
						label="Nome do Tema"
						layout="vertical"
						rules={[
							{ 
								required: true,
								message: "Por favor, insira o nome do tema!"
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name="themeDescription"
						label="Descrição do Tema"
						layout="vertical"
						style={{ marginBottom: 0 }}
						rules={[
							{
								required: true,
								message: "Insira a descrição do tema.",
							},
						]}
					>
						<Input.TextArea autoSize={{ minRows: 6, maxRows: 6 }} />
					</Form.Item>

					<Form.Item style={{ marginBottom: 0, paddingTop: 20, paddingRight: 10 }}>
						<Space
							style={{ 
								width: "100%",
								justifyContent: "end"
							}}
						>
							<Button
								type="text"
								htmlType="button"
								onClick={() => router.push("/textgrader?tab=temas")}
							>
								Cancelar
							</Button>

							<Button
								type="primary"
								htmlType="submit"
								disabled={!enabledSave}
								variant="link"
							>
								Salvar
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</FormWrapper>
		</Container>
	);
};

export default withSession(Tema);
