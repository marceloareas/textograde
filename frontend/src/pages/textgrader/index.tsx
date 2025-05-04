import { Tabs, Button, Modal, Tooltip, message, Select, Space } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "../../context";
import CustomTable from "../../components/customTable";
import ModalDetalhesTema from "@/components/modalDetalhesTema";
import ModalDetalhesRedacao from "@/components/modalDetalhesRedacao";
import { client } from "../../services/client";
import { SearchInput } from "@/components/searchInput";

const { TabPane } = Tabs;
const { Option } = Select;

export interface Tema {
  _id: string;
  nome_professor: string;
  tema: string;
  descricao: string;
}

export interface Redacao {
  titulo: string;
  texto: string;
  nota_total: number;
  nota_competencia_1_model: number;
  nota_competencia_2_model: number;
  nota_competencia_3_model: number;
  nota_competencia_4_model: number;
  nota_competencia_5_model: number;
  nota_professor: number;
  nota_competencia_1_professor: number;
  nota_competencia_2_professor: number;
  nota_competencia_3_professor: number;
  nota_competencia_4_professor: number;
  nota_competencia_5_professor: number;
  id_tema: string;
  _id: string;
  aluno: string;
  comentarios: string;
}

const Index = () => {
  const { isLoggedIn, tipoUsuario, nomeUsuario } = useAuth();

  const [students, setStudents] = useState<any[]>([]);

  const [topicsData, setTopicsData] = useState<Tema[]>([]);
  const [essaysData, setEssaysData] = useState<Redacao[]>([]);

  const [filteredTopicsData, setFilteredTopicsData] = useState<Tema[]>([]);
  const [filteredEssaysData, setFilteredEssaysData] = useState<Redacao[]>([]);
  
  const [activeKey, setActiveKey] = useState<string>("1");

  const [topicModalVisible, setModalVisible] = useState(false);
  const [essayModalVisible, setEssayModalVisible] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<Tema | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Redacao | null>(null);

  const [filterTopicsType, setFilterTopicsType] = useState<string>("todos");
  const [filterStudentType, setFilterStudentType] = useState<string>("todos");

  const [topicSearchValue, setTopicSearchValue] = useState("");
  const [essaySearchValue, setEssaySearchValue] = useState("");

  const temasColumns = [
    {
      title: "Professor",
      dataIndex: "nome_professor",
      key: "nome_professor",
      ellipsis: true,
    },
    {
      title: "Tema",
      dataIndex: "tema",
      key: "tema",
      render: (text: string, record: Tema) => (
        <Tooltip
          title={tipoUsuario === "aluno" ? "Detalhes do tema" : "Editar tema"}
        >
          <Button type="link" onClick={() => openModal(record)}>
            {text}
          </Button>
        </Tooltip>
      ),
      ellipsis: true,
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
      ellipsis: true,
    },
    {
      title: "Ações",
      key: "acoes",
      render: (record: Tema) =>
        tipoUsuario === "professor" && record.nome_professor === nomeUsuario ? (
          <Tooltip title="Deletar tema">
            <Button
              onClick={() => handleDeleteTopic(record._id)}
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        ) : (
          tipoUsuario === "aluno" && (
            <Link href={`/textgrader/redacao?id=${record._id}`}>
              <PlusOutlined style={{ fontSize: "16px", marginRight: "8px" }} />
              Inserir Nova Redação
            </Link>
          )
        ),
    },
  ];

  const redacaoColumns = [
    {
      title: "Título",
      dataIndex: "titulo",
      key: "titulo",
      render: (text: string, record: Redacao) => (
        <Tooltip
          title={
            tipoUsuario === "aluno" ? "Visualizar redação" : "Corrigir redação"
          }
        >
          <Button type="link" onClick={() => openEssayModal(record)}>
            {text}
          </Button>
        </Tooltip>
      ),
      ellipsis: true,
    },
    { title: "Aluno", dataIndex: "aluno", key: "aluno", ellipsis: true },
    {
      title: "Tema",
      dataIndex: "id_tema",
      key: "id_tema",
      render: (id_tema: string) => getTopicName(id_tema),
      ellipsis: true,
    },
    {
      title: "Nota Modelo",
      dataIndex: "nota_modelo",
      key: "nota_modelo",
      align: "center",
      ellipsis: true,
      render: (_: any, record: Redacao) => {
        const mediaModelo =
          (record.nota_competencia_1_model +
            record.nota_competencia_2_model +
            record.nota_competencia_3_model +
            record.nota_competencia_4_model +
            record.nota_competencia_5_model);

        return mediaModelo.toFixed(2); // Exibe com 2 casas decimais
      },
    },
    {
      title: "Nota Professor",
      dataIndex: "nota_professor",
      key: "nota_professor",
      align: "center",
      ellipsis: true,
      render: (_: any, record: Redacao) => {
        const mediaProfessor =
          (record.nota_competencia_1_professor +
            record.nota_competencia_2_professor +
            record.nota_competencia_3_professor +
            record.nota_competencia_4_professor +
            record.nota_competencia_5_professor);

        return mediaProfessor.toFixed(2); // Exibe com 2 casas decimais
      },
    },
    {
      title: "Média",
      dataIndex: "media",
      key: "media",
      align: "center",
      ellipsis: true,
      render: (_: any, record: Redacao) => {
        const mediaModelo =
          (record.nota_competencia_1_model +
            record.nota_competencia_2_model +
            record.nota_competencia_3_model +
            record.nota_competencia_4_model +
            record.nota_competencia_5_model);

        const mediaProfessor =
          (record.nota_competencia_1_professor +
            record.nota_competencia_2_professor +
            record.nota_competencia_3_professor +
            record.nota_competencia_4_professor +
            record.nota_competencia_5_professor);

        const notaTotal = (mediaModelo + mediaProfessor) / 2;

        return notaTotal.toFixed(2); // Exibe com 2 casas decimais
      },
    },
  ];

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const { data } = await client.get("/tema");
        
        if (Array.isArray(data)) {
          setTopicsData(data);
        } else {
          console.error("Dados inválidos recebidos para temas:", data);
          setTopicsData([]);
        }
      } catch (error) {
        console.error("Erro ao buscar os temas:", error);
        setTopicsData([]);
      }
    };

    const fetchAlunos = async () => {
      try {
        const { data } = await client.get(`/alunos`);

        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          console.error("Dados inválidos recebidos para alunos:", data);
          setStudents([]);
        }
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        setStudents([]);
      }
    };
    
    fetchTemas();
    fetchAlunos();

    return () => {
      setTopicSearchValue("");
      setEssaySearchValue("");
      setFilterTopicsType("todos");
      setFilterStudentType("todos");
      setActiveKey("1");
      setModalVisible(false);
      setEssayModalVisible(false);
      setSelectedTopic(null);
      setSelectedEssay(null);
      setTopicsData([]);
      setFilteredTopicsData([]);
      setEssaysData([]);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    const fetchRedacoes = async () => {
      try {
        const { data } = await client.get(`/redacao${tipoUsuario === "aluno" ? `?user=${nomeUsuario}` : ""}`);
        
        if (Array.isArray(data)) {
          setEssaysData(data);
        } else {
          console.error("Dados inválidos recebidos para redações:", data);
          setEssaysData([]);
        }
      } catch (error) {
        console.error("Erro ao buscar as redações:", error);
        setEssaysData([]);
      }
    };

    fetchRedacoes();
  }, [tipoUsuario, nomeUsuario]);

  useEffect(() => {
    if (filterTopicsType === "todos") {
      setFilteredTopicsData(topicsData);
    } else if (filterTopicsType === "meus") {
      setFilteredTopicsData(
        topicsData.filter((tema) => tema.nome_professor === nomeUsuario)
      );
    }
  }, [filterTopicsType, topicsData])

  useEffect(() => {    
    const newTopics = topicsData.filter(
      (topic) =>
        topic.tema.toLowerCase().includes(topicSearchValue.toLowerCase()) ||
        topic.nome_professor.toLowerCase().includes(topicSearchValue.toLowerCase())
      )

    setFilteredTopicsData(newTopics);
  }, [topicSearchValue]);
  

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const openModal = (tema: any) => {
    setSelectedTopic(tema);
    setModalVisible(true);
  };

  const openEssayModal = (essay: any) => {
    setSelectedEssay(essay);
    setEssayModalVisible(true);
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      const { data } = await client.delete(`/tema/${id}`);

      if (data) {
        setTopicsData(topicsData.filter((tema) => tema._id !== id));
        message.success("Tema deletado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao deletar o tema:", error);
      message.error("Erro ao deletar o tema. Por favor, tente novamente.");
    }
  };

  const handleUpdateTopic = (updatedTopic: Tema) => {
    setTopicsData(
      topicsData.map((tema) =>
        tema._id === updatedTopic._id ? updatedTopic : tema
      )
    );
  };

  const handleUpdateEssay = (updatedEssay: Redacao) => {
    setEssaysData(
      essaysData.map((redacao) =>
        redacao._id === updatedEssay._id ? updatedEssay : redacao
      )
    );
  };

  const getTopicName = (id_tema: string): string => {
    const tema = topicsData.find((tema) => tema._id === id_tema);
    return tema ? tema.tema : "Tema não encontrado";
  };

  const handleFilterEssays = () => {
    if (filterTopicsType === "meus") {
      return essaysData.filter((redacao) => {
        return topicsData.find(
          (tema) =>
            tema._id === redacao.id_tema && tema.nome_professor === nomeUsuario
        );
      });
    }

    if (filterStudentType !== "todos") {
      return essaysData.filter((redacao) => {
        redacao.aluno === filterStudentType;
      });
    }
    return essaysData;
  };

  return (
    <div style={{ padding: "0 20px 0 20px", width: "100vw" }}>
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        style={{ flex: 1 }}
      >
        <TabPane tab="Temas" key="1">
          <Space
            style={{ 
              marginBottom: 16,
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            <div>
              {tipoUsuario === "professor" && (
                <Link href="/textgrader/tema">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginRight: 8 }}
                  >
                    Adicionar Tema
                  </Button>
                </Link>
              )}

              {tipoUsuario === "professor" && (
                <Select
                  defaultValue="todos"
                  style={{ width: 140 }}
                  onChange={(value) => setFilterTopicsType(value)}
                >
                  <Option value="todos">Todos os Temas</Option>
                  <Option value="meus">Meus Temas</Option>
                </Select>
              )}
            </div>

            <SearchInput onChange={setTopicSearchValue} placeholder="Digite um tema ou nome" />
          </Space>

          {isLoggedIn && (
            <CustomTable
              dataSource={filteredTopicsData}
              columns={temasColumns}
            />
          )}
        </TabPane>

        <TabPane tab="Redações" key="2">
          <Space style={{ marginBottom: 16 }}>
            {tipoUsuario === "professor" && (
              <Select
                defaultValue="todos"
                style={{ width: 200 }}
                onChange={(value) => setFilterTopicsType(value)}
              >
                <Option value="todos">Todas as Redações</Option>
                <Option value="meus">Redações dos meus temas</Option>
              </Select>
            )}
            {tipoUsuario === "professor" && (
              <Select
                defaultValue="todos"
                style={{ width: 200 }}
                onChange={(value) => setFilterStudentType(value)}
              >
                <Option value="todos">Todos os Alunos</Option>
                {Array.isArray(students) &&
                  students.map((student) => (
                    <Option key={student._id} value={student.username}>
                      {student.username}
                    </Option>
                  ))}
              </Select>
            )}
          </Space>
          {isLoggedIn && (
            <CustomTable
              dataSource={handleFilterEssays()}
              columns={redacaoColumns}
            />
          )}
        </TabPane>
      </Tabs>

      <ModalDetalhesTema
        open={topicModalVisible}
        onCancel={() => setModalVisible(false)}
        tema={selectedTopic}
        onTemaEditado={handleUpdateTopic}
      />

      <ModalDetalhesRedacao
        open={essayModalVisible}
        onCancel={() => setEssayModalVisible(false)}
        redacao={selectedEssay}
        onRedacaoEditado={handleUpdateEssay}
      />
    </div>
  );
};

export default Index;
