import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Input, message } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context";
import { API_URL } from "@/config/config";
import withSession from "../../../hoc/withSession";
import { ButtonWrapper, Root, Title, Wrapper } from "./styles";
import TextEditor from "@/components/textEditor";

const Redacao = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [essay, setEssay] = useState("");
	// const [essayGrade, setEssayGrade] = useState(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const router = useRouter();
	const { id, t } = router.query;
	const { token } = useAuth();

	const [title, setTitle] = useState<string>("");

	useEffect(() => {
		setTitle(t as string);
		
		return () => {
			setTitle("");
		}
	}, [t])
	

	const showModalText = async () => {
		await getEssayGrade();
		setIsModalOpen(true);
	};

	const handleChange = (text: string) => setEssay(text);

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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const uploadImage = async () => {
		if (!selectedFile) {
			message.error("Selecione uma imagem antes de enviar.");
			return;
		}

		const formData = new FormData();
		formData.append("image", selectedFile);
		formData.append("id", id ? id.toString() : "");

		try {
			const response = await axios.post(`${API_URL}/redacao/imagem`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
			});

			// setEssayGrade(response.data.grades);

			message.success("Imagem enviada e redação avaliada com sucesso!");
		} catch (error) {
			message.error("Erro ao avaliar redação por imagem. Tente novamente.");
		}
	};

	const showModalImage = async () => {
		await uploadImage();
		setIsModalOpen(true);
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
					<label>
						Redação
					</label>

					<TextEditor onChange={handleChange} />
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
						onClick={showModalText}
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
