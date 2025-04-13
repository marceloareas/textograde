import { Modal, Input, Button, message, Collapse } from "antd";
import { useState } from "react";
import { Redacao } from "@/pages/textgrader";
import { useAuth } from "@/context";
import TextArea from "antd/lib/input/TextArea";
import { API_URL } from "@/config/config";
import { client } from "../services/client";

interface RedacaoDetalhes {
  open: boolean;
  onCancel: () => void;
  redacao: Redacao | null;
  onRedacaoEditado: (redacaoEditado: Redacao) => void;
}

const ModalDetalhesRedacao: React.FC<RedacaoDetalhes> = ({
  open,
  onCancel,
  redacao,
  onRedacaoEditado,
}) => {
  const [notaComp1Editada, setNotaComp1Editada] = useState<number | null>(null);
  const [notaComp2Editada, setNotaComp2Editada] = useState<number | null>(null);
  const [notaComp3Editada, setNotaComp3Editada] = useState<number | null>(null);
  const [notaComp4Editada, setNotaComp4Editada] = useState<number | null>(null);
  const [notaComp5Editada, setNotaComp5Editada] = useState<number | null>(null);

  const { tipoUsuario } = useAuth();
  const { Panel } = Collapse;
  const { token } = useAuth();

  const handleEditarRedacao = async () => {
    try {
      const gradesEdited =
        notaComp1Editada !== null ||
        notaComp2Editada !== null ||
        notaComp3Editada !== null ||
        notaComp4Editada !== null ||
        notaComp5Editada !== null;

      if (redacao?.nota_professor && gradesEdited) {
        message.error("Redação já foi corrigida!");
        return;
      }

      if (redacao && gradesEdited && tipoUsuario === "professor") {
        const { data } = await client.put(`/redacao/${redacao._id}`, {
          nota_competencia_1_model: notaComp1Editada ?? 0,
          nota_competencia_2_model: notaComp2Editada ?? 0,
          nota_competencia_3_model: notaComp3Editada ?? 0,
          nota_competencia_4_model: notaComp4Editada ?? 0,
          nota_competencia_5_model: notaComp5Editada ?? 0,
        });

        if (data) {
          message.success("Redação atualizada com sucesso!");
          onCancel();
          onRedacaoEditado({ ...redacao });
        }
      } else if (tipoUsuario !== "professor") {
        message.error("Somente professores podem editar as notas.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a redação:", error);
      message.error("Erro ao atualizar a redação. Por favor, tente novamente.");
    }
  };

  const inputStyle = { marginBottom: "10px", color: "#4a4a4a" };
  const labelStyle = { marginBottom: "10px" };

  return (
    <Modal
      title={tipoUsuario === "aluno" ? "Detalhes da redação" : "Editar redação"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width="80vw"
      style={{ height: "80vh", top: "10px" }}
    >
      {redacao && tipoUsuario === "aluno" ? (
        <div>
          <label style={labelStyle}>
            <b>Título:</b>
          </label>
          <Input style={inputStyle} value={redacao.titulo} disabled />
          <label style={labelStyle}>
            <b>Texto:</b>
          </label>
          <TextArea
            rows={20}
            style={inputStyle}
            value={redacao.texto}
            disabled
          />

          <Collapse style={labelStyle}>
            <Panel header="Notas competências - Modelo" key="1">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num}>
                  <label style={labelStyle}>
                    <b>Nota Competência {num}:</b>
                  </label>
                  <Input
                    style={inputStyle}
                    value={
                      (redacao as any)[`nota_competencia_${num}_model`] ?? 0
                    }
                    disabled
                  />
                </div>
              ))}
            </Panel>
            <Panel header="Notas competências - Professor" key="2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num}>
                  <label style={labelStyle}>
                    <b>Nota Competência {num}:</b>
                  </label>
                  <Input
                    style={inputStyle}
                    value={
                      (redacao as any)[`nota_competencia_${num}_professor`] ?? 0
                    }
                    disabled
                  />
                </div>
              ))}
            </Panel>
          </Collapse>

          <Button style={{ marginTop: "1vw" }} onClick={onCancel}>
            OK
          </Button>
        </div>
      ) : (
        redacao && (
          <div>
            <label style={labelStyle}>
              <b>Título:</b>
            </label>
            <Input style={inputStyle} value={redacao.titulo} disabled />
            <label style={labelStyle}>
              <b>Texto:</b>
            </label>
            <TextArea
              rows={20}
              style={inputStyle}
              value={redacao.texto}
              disabled
            />

            <Collapse style={labelStyle}>
              <Panel header="Notas competências" key="1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num}>
                    <label style={labelStyle}>
                      <b>Nota Competência {num}:</b>
                    </label>
                    <Input
                      style={inputStyle}
                      value={
                        num === 1
                          ? notaComp1Editada ??
                            redacao.nota_competencia_1_professor ??
                            0
                          : num === 2
                          ? notaComp2Editada ??
                            redacao.nota_competencia_2_professor ??
                            0
                          : num === 3
                          ? notaComp3Editada ??
                            redacao.nota_competencia_3_professor ??
                            0
                          : num === 4
                          ? notaComp4Editada ??
                            redacao.nota_competencia_4_professor ??
                            0
                          : notaComp5Editada ??
                            redacao.nota_competencia_5_professor ??
                            0
                      }
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0;
                        if (num === 1) setNotaComp1Editada(value);
                        if (num === 2) setNotaComp2Editada(value);
                        if (num === 3) setNotaComp3Editada(value);
                        if (num === 4) setNotaComp4Editada(value);
                        if (num === 5) setNotaComp5Editada(value);
                      }}
                    />
                  </div>
                ))}
              </Panel>
            </Collapse>

            <Button style={{ marginTop: "1vw" }} onClick={handleEditarRedacao}>
              Editar
            </Button>
          </div>
        )
      )}
    </Modal>
  );
};

export default ModalDetalhesRedacao;
