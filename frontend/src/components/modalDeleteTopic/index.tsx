import { Button, Input, Modal, message } from "antd";
import { client } from "../../services/client";
import { Topic } from "@/pages/textgrader";
import { Content, DeleteTopicContainer, StyledInput } from "./styles";
import { FormEvent, useEffect, useState } from "react";

interface ThemeDetails {
	open: boolean;
	onCancel: () => void;
	topic: Topic;
	onTopicDeleted: (topicId: string) => void;
};

const ModalDeleteTopic: React.FC<ThemeDetails> = ({
	open,
	onCancel,
	topic,
	onTopicDeleted,
}) => {
	const [topicName, setTopicName] = useState<string>("");
	
	const handleDeleteTopic = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
            const { data } = await client.delete(`/tema/${topic._id}`);

            if (data) {
				onTopicDeleted(topic._id);
				setTopicName("");
                message.success("Tema deletado com sucesso!");
            }
        } catch (error) {
            message.error("Erro ao deletar o tema. Por favor, tente novamente.");
        }
	};

	useEffect(() => {
		return () => {
			setTopicName("");	
		}
	}, [])

	return (
		<Modal
			title="Remover Tema"
			open={open}
			footer={null}
			width={400}
			centered
			onCancel={onCancel}
		>
			<Content onSubmit={handleDeleteTopic}>
				<h2> Deseja realmente remover o tema abaixo?</h2>

				<DeleteTopicContainer>{topic.tema}</DeleteTopicContainer>

				<StyledInput style={{ marginTop: "20px", gap: 5 }}>
					<label htmlFor="topicName">
						{`Digite "${topic.tema.toLowerCase()}" abaixo`}
					</label>

					<Input
						size="large"
						name="topicName"
						value={topicName}
						onChange={(e) => setTopicName(e.target.value)}
					/>
				</StyledInput>

				<div
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "end",
						gap: "10px",
						marginTop: "40px",
					}}
				>
					<Button variant="outlined" color="default" onClick={onCancel}>
						Cancelar
					</Button>

					<Button
						htmlType="submit"
						variant="solid"
						color="danger"
						disabled={topicName.toLowerCase() !== topic.tema.toLowerCase()}
					>
						Remover
					</Button>
				</div>
			</Content>
		</Modal>
	);
};

export default ModalDeleteTopic;
