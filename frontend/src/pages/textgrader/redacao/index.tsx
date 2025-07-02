import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Input, message, Spin, Upload } from "antd";
import { CheckOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context";
import { API_URL } from "@/config/config";
import withSession from "../../../hoc/withSession";
import { ButtonWrapper, Root, Title, Wrapper } from "./styles";
import TextEditor from "@/components/textEditor";
import { UploadProps } from "antd/lib";

const Redacao = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [essay, setEssay] = useState<string>("");
	const [essayFromImage, setEssayFromImage] = useState<string>("");
	// const [essayGrade, setEssayGrade] = useState(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const router = useRouter();
	const { id, t } = router.query;
	const { token } = useAuth();

	const [title, setTitle] = useState<string>("");

	const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

	useEffect(() => {
		setTitle(t as string);
		
		return () => {
			setTitle("");
		}
	}, [t])
	
	const getEssayGrade = async () => {
		if (!essay.trim()) {
			message.error("Por favor, escreva uma redação antes de enviar.");
			return;
		}

		try {
			const response = await axios.post(
				`${API_URL}/redacao/avaliacao/`,
				{
					essay,
					id,
					title
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			message.success("Redação avaliada com sucesso!");

			router.push(`/textgrader?tab=redacoes&essayId=${response.data.essay_id}`);
		} catch (error) {
			message.error("Erro ao avaliar redação. Tente novamente.");
		}
	};

	const props: UploadProps = {
		customRequest: async ({ file }) => {
			const formData = new FormData();
    		formData.append("imagem", file as File);
			setIsLoadingImage(true);

			try {
				const response = await axios.post(`${API_URL}/redacao/image-to-text`, formData, {
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				});

				setEssayFromImage(response.data.text);
				setEssay(response.data.text);

				setIsLoadingImage(false);
				message.success("Imagem enviada com sucesso!");
			} catch (error) {
				setIsLoadingImage(false);
				message.error("Erro ao enviar imagem. Tente novamente!");
			}
		},
		showUploadList: false,
		listType: "text",
	};

	return (
		<Root>
			<Wrapper>
				<Title> Redação </Title>

				<div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "20px" }}>
					<label>
						Título
					</label>

					<Input
						placeholder="Digite o título da redação"
						type="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "20px" }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<label>
							Redação
						</label>

						<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
							{isLoadingImage && <Spin size="small" />}
							<Upload {...props}>
								<Button icon={<UploadOutlined />}>Enviar imagem</Button>
							</Upload>
						</div>
					</div>

					<TextEditor onChange={setEssay} value={essayFromImage} />
				</div>

				<ButtonWrapper>
					<Button
						onClick={() => router.push("/textgrader?tab=temas")}
						size="large"
						type="text"
					>
						Cancelar
					</Button>

					<Button
						onClick={getEssayGrade}
						size="large"
						type="primary"
						icon={<CheckOutlined />}
					>
						Obter nota
					</Button>
				</ButtonWrapper>
			</Wrapper>
		</Root>
	);
};

export default withSession(Redacao);
