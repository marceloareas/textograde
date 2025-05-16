import { Modal, Input, Button, message } from "antd";
import { useEffect, useState } from "react";
import { client } from "../services/client";
import { Topic } from "@/pages/textgrader";
import { API_URL } from "@/config/config";
import { useAuth } from "@/context";

interface TemaDetalhes {
	open: boolean;
	onCancel: () => void;
	topic: Topic;
	onTopicUpdated: (newTopic: Topic) => void;
};

const ModalDetalhesTema: React.FC<TemaDetalhes> = ({
	open,
	onCancel,
	topic,
	onTopicUpdated,
}) => {
	const [newDescription, setNewDescription] = useState<string>("");
	const [newTopic, setNewTopic] = useState<string>("");
	const { tipoUsuario, nomeUsuario } = useAuth();

	const handleEditTopic = async () => {
		try {
			if (topic && (newDescription !== topic.descricao || newTopic !== topic.tema )) {				
				const { data } = await client.put(`${API_URL}/tema/${topic._id}`, {
					tema: newTopic ? newTopic : topic.tema,
					descricao: newDescription ? newDescription : topic.descricao,
					nome_professor: topic.nome_professor,
				});

				if (data) {
					message.success("Tema atualizado com sucesso!");
					
					onCancel();

					onTopicUpdated({
						...topic,
						tema: newTopic !== "" ? newTopic : topic.tema,
						descricao:
							newDescription !== "" ? newDescription : topic.descricao,
					});
				} else {
					message.error("Erro ao atualizar o tema. Tente novamente.");
				}
			}
		} catch (error) {
			message.error("Erro ao atualizar o tema. Por favor, tente novamente.");
		}
	};

	useEffect(() => {
		if (topic) {
			setNewTopic(topic.tema);
			setNewDescription(topic.descricao);
		}

		return () => {
			setNewTopic("");
			setNewDescription("");
		}
	}, [topic]);

	return (
		<Modal
			title={
				(
					tipoUsuario === "aluno" ||
						tipoUsuario === "professor" &&
						topic.nome_professor !== nomeUsuario
				) ?
				"Detalhes do Tema" :
				"Editar Tema"
			}
			open={open}
			onCancel={onCancel}
			onOk={
				(
					tipoUsuario === "aluno" ||
						tipoUsuario === "professor" &&
						topic.nome_professor !== nomeUsuario
				) ? onCancel : handleEditTopic
			}
			cancelButtonProps={{
				hidden: (
					tipoUsuario === "aluno" ||
						tipoUsuario === "professor" &&
						topic.nome_professor !== nomeUsuario
				)
			}}
		>
				<>
					{
						(
							tipoUsuario === "aluno" ||
							tipoUsuario === "professor" &&
							topic.nome_professor !== nomeUsuario
						) ? (
							<div>
								<p><b>Professor</b>: {topic.nome_professor}</p>
								<p><b>Tema</b>: {topic.tema}</p>
								<p><b>Descrição</b>: {topic.descricao}</p>
							</div>
						) : (
							<div>
								<label style={{ marginBottom: "10px" }}>
									<b>Professor</b>:
								</label>

								<Input
									style={{ marginBottom: "10px" }}
									value={topic.nome_professor}
									disabled
								/>

								<label style={{ marginBottom: "10px" }}>
									<b>Tema</b>:
								</label>

								<Input
									style={{ marginBottom: "10px" }}
									value={newTopic}
									onChange={(e) => setNewTopic(e.target.value)}
								/>

								<label style={{ marginBottom: "10px" }}>
									<b>Descrição</b>:
								</label>
								
								<Input.TextArea
									style={{ marginBottom: "10px" }}
									value={newDescription}
									onChange={(e) => setNewDescription(e.target.value)}
								/>
							</div>
						)
					}
				</>
		</Modal>
	);
};

export default ModalDetalhesTema;
