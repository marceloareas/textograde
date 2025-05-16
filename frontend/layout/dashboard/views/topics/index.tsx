import { ReactElement, useState } from "react";
import { Button, Select, Space, Tooltip, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import { SearchInput } from "@/components/searchInput";
import CustomTable from "@/components/customTable";
import { useAuth } from "@/context";
import { Topic } from "@/pages/textgrader";
import { client } from "@/services/client";
import ModalDetalhesTema from "@/components/modalDetalhesTema";

const { Option } = Select;

interface ITopicsViewProps {
    filteredTopicsData: Topic[];
    setFilterTopicsType: (value: string) => void;
    setTopicSearchValue: (value: string) => void;
    topicsData: Topic[];
    setTopicsData: (data: Topic[]) => void;
}

export const TopicsView = ({
    setFilterTopicsType,
    setTopicSearchValue,
    filteredTopicsData,
    topicsData,
    setTopicsData,
}: ITopicsViewProps): ReactElement => {
    const { tipoUsuario, nomeUsuario } = useAuth();

    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [topicModalVisible, setModalVisible] = useState(false);

    const handleDeleteTopic = async (id: string) => {
        try {
            const { data } = await client.delete(`/tema/${id}`);

            if (data) {
                setTopicsData(topicsData.filter((tema) => tema._id !== id));
                message.success("Tema deletado com sucesso!");
            }
        } catch (error) {
            message.error("Erro ao deletar o tema. Por favor, tente novamente.");
        }
    };

    const handleUpdateTopic = (updatedTopic: Topic) => {
        setTopicsData(
            topicsData.map((tema) =>
                tema._id === updatedTopic._id ? updatedTopic : tema
            )
        );
    };

    const openModal = (tema: any) => {
		setSelectedTopic(tema);
		setModalVisible(true);
	};

    const topicsColumns = [
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
            render: (text: string, record: Topic) => (
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
            render: (record: Topic) =>
                tipoUsuario === "professor" && record.nome_professor === nomeUsuario ? 
                (
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
    
    return (
        <>
            <Space
                style={{ 
                    marginBottom: 16,
                    justifyContent: "space-between",
                    width: "100%"
                }}
            >
                <div>
                    {tipoUsuario === "professor" && (
                        <>
                            <Link href="/textgrader/tema">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{ marginRight: 8 }}
                                >
                                    Adicionar Tema
                                </Button>
                            </Link>
                        
                            <Select
                                defaultValue="todos"
                                style={{ width: 140 }}
                                onChange={(value) => setFilterTopicsType(value)}
                            >
                                <Option value="todos">Todos os Temas</Option>
                                <Option value="meus">Meus Temas</Option>
                            </Select>
                        </>
                    )}
                </div>

                <SearchInput onChange={setTopicSearchValue} placeholder="Digite um tema ou nome" />
            </Space>

            <CustomTable
                dataSource={filteredTopicsData}
                columns={topicsColumns}
            />

            <ModalDetalhesTema
				open={topicModalVisible}
				onCancel={() => setModalVisible(false)}
				tema={selectedTopic}
				onTemaEditado={handleUpdateTopic}
			/>
        </>
        
    );
}