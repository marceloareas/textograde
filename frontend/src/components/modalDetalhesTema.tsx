import { Modal, Input, Button, message } from "antd";
import { useState } from "react";
import { Tema } from "@/pages/textgrader";
import { useAuth } from "@/context";
import { API_URL } from "@/config/config";
import { client } from "../../services/client";

interface TemaDetalhes {
  open: boolean;
  onCancel: () => void;
  tema: Tema | null;
  onTemaEditado: (temaEditado: Tema) => void;
}

const ModalDetalhesTema: React.FC<TemaDetalhes> = ({
  open,
  onCancel,
  tema,
  onTemaEditado,
}) => {
  const [temaEditado, setTemaEditado] = useState<string>("");
  const [descricaoEditada, setDescricaoEditada] = useState<string>("");
  const { tipoUsuario, token } = useAuth(); // Recuperando o token do contexto

  const handleEditarTema = async () => {
    if (!token) {
      message.error("Você precisa estar autenticado para editar o tema.");
      return;
    }

    try {
      if (tema && (descricaoEditada !== "" || temaEditado !== "")) {
        const { data } = await client.put(`${API_URL}/tema/${tema._id}`, {
          tema: temaEditado !== "" ? temaEditado : tema.tema,
          descricao:
            descricaoEditada !== "" ? descricaoEditada : tema.descricao,
          nome_professor: tema.nome_professor,
        });

        if (data) {
          message.success("Tema atualizado com sucesso!");
          onCancel();
          onTemaEditado({
            ...tema,
            tema: temaEditado !== "" ? temaEditado : tema.tema,
            descricao:
              descricaoEditada !== "" ? descricaoEditada : tema.descricao,
          });
        } else {
          message.error("Erro ao atualizar o tema. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar o tema:", error);
      message.error("Erro ao atualizar o tema. Por favor, tente novamente.");
    }
  };

  return (
    <Modal
      title={tipoUsuario === "aluno" ? "Detalhes do Tema" : "Editar Tema"}
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      {tema && tipoUsuario === "aluno" ? (
        <div>
          <p>
            <b>Professor</b>: {tema.nome_professor}
          </p>
          <p>
            <b>Tema</b>: {tema.tema}
          </p>
          <p>
            <b>Descrição</b>: {tema.descricao}
          </p>
        </div>
      ) : (
        tema && (
          <div>
            <label style={{ marginBottom: "10px" }}>
              <b>Professor</b>:
            </label>
            <Input
              style={{ marginBottom: "10px" }}
              value={tema.nome_professor}
              disabled
            />
            <label style={{ marginBottom: "10px" }}>
              <b>Tema</b>:
            </label>
            <Input
              style={{ marginBottom: "10px" }}
              defaultValue={tema.tema}
              onChange={(e) => setTemaEditado(e.target.value)}
            />
            <label style={{ marginBottom: "10px" }}>
              <b>Descrição</b>:
            </label>
            <Input.TextArea
              style={{ marginBottom: "10px" }}
              defaultValue={tema.descricao}
              onChange={(e) => setDescricaoEditada(e.target.value)}
            />
            <Button onClick={handleEditarTema}>Editar</Button>
          </div>
        )
      )}
    </Modal>
  );
};

export default ModalDetalhesTema;
