import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { Modal, Skeleton, message } from "antd";
import {
  ClearOutlined,
  CheckOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import { S } from "@/styles/Redacao.styles";
import { useAuth } from "../../context";
import { API_URL } from "@/config/config";

const Redacao = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [essay, setEssay] = useState("");
  const [essayGrade, setEssayGrade] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();

  const showModalText = async () => {
    await getEssayGrade();
    setIsModalOpen(true);
  };

  const showModalImage = async () => {
    await uploadImage();
    setIsModalOpen(true);
  };

  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const handleChange = (event: any) => setEssay(event.target.value);

  const getEssayGrade = async () => {
    if (!essay.trim()) {
      message.error("Por favor, escreva uma redação antes de enviar.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/redacao/avaliacao/`,
        { essay, id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEssayGrade(response.data.grades);
      message.success("Redação avaliada com sucesso!");
    } catch (error) {
      console.error("Erro ao avaliar redação:", error);
      message.error("Erro ao avaliar redação. Tente novamente.");
    }
  };

  const clearEssay = () => setEssay("");

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

      setEssayGrade(response.data.grades);
      message.success("Imagem enviada e redação avaliada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      message.error("Erro ao avaliar redação por imagem. Tente novamente.");
    }
  };

  return (
    <S.Wrapper>
      <S.Title>🧾 Redação 🧾</S.Title>

      <label>
        Ao escrever sua redação, o título deverá estar na primeira linha
      </label>
      <TextArea
        value={essay}
        onChange={handleChange}
        style={{
          padding: 24,
          minHeight: 380,
          background: "white",
          width: "100%",
        }}
        placeholder="Escreva sua redação aqui"
      />

      <S.ButtonWrapper>
        <S.MyButton
          onClick={clearEssay}
          size="large"
          type="primary"
          danger
          icon={<ClearOutlined />}
        >
          Apagar texto
        </S.MyButton>
        <S.MyButton
          onClick={showModalText}
          size="large"
          type="primary"
          icon={<CheckOutlined />}
        >
          Obter nota
        </S.MyButton>
      </S.ButtonWrapper>

      <S.UploadWrapper>
        <input type="file" onChange={handleFileChange} />
        <S.MyButton
          onClick={showModalImage}
          size="large"
          type="primary"
          icon={<UploadOutlined />}
        >
          Upload Imagem
        </S.MyButton>
      </S.UploadWrapper>

      <Modal
        title="Nota da redação"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {essayGrade ? (
          Object.entries(essayGrade).map(([key, value], index) => (
            <p key={index}>
              {key}: {String(value)}
            </p>
          ))
        ) : (
          <Skeleton paragraph={{ rows: 0 }} />
        )}
      </Modal>
    </S.Wrapper>
  );
};

export default Redacao;
