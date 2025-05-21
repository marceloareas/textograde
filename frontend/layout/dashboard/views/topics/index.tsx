import { ReactElement, useState } from "react";
import { Button, Select, Space, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import { SearchInput } from "@/components/searchInput";
import CustomTable from "@/components/customTable";
import { useAuth } from "@/context";
import { Topic } from "@/pages/textgrader";
import ModalDetalhesTema from "@/components/modalDetalhesTema";
import ModalDeleteTheme from "@/components/modalDeleteTopic";

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
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleDeleteTopic = async (id: string) => {
        setTopicsData(topicsData.filter((tema) => tema._id !== id));
        setDeleteModalVisible(false);
    };

    const handleCloseUpdateModal = () => {
        setUpdateModalVisible(false);
        setSelectedTopic(null);
    }

    const handleCloseDeleteModal = () => {
        setDeleteModalVisible(false);
        setSelectedTopic(null);
    }

    const handleUpdateTopic = (updatedTopic: Topic) => {
        setTopicsData(
            topicsData.map((tema) =>
                tema._id === updatedTopic._id ? updatedTopic : tema
            )
        );
        handleCloseUpdateModal();
    };

    const openUpdateModal = (topic: Topic) => {
		setSelectedTopic(topic);
		setUpdateModalVisible(true);
	};

    const openDeleteModal = (topic: Topic) => {
		setSelectedTopic(topic);
		setDeleteModalVisible(true);
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
                <>
                    <Tooltip
                        title={(tipoUsuario === "aluno" || tipoUsuario === "professor" && record.nome_professor !== nomeUsuario) ? "Detalhes do tema" : "Editar tema"}
                    >
                        <Button type="link" onClick={() => openUpdateModal(record)}>
                            {text}
                        </Button>
                    </Tooltip>
                </>
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
                            onClick={() => openDeleteModal(record)}
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
        <div style={{ height: "calc(100vh - 110px - 64px)" }}>
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

            {selectedTopic && (
                <>
                    <ModalDetalhesTema
                        open={updateModalVisible}
                        topic={selectedTopic}
                        onCancel={handleCloseUpdateModal}
                        onTopicUpdated={handleUpdateTopic}
                    />

                    <ModalDeleteTheme
                        open={deleteModalVisible}
                        topic={selectedTopic}
                        onCancel={handleCloseDeleteModal}
                        onTopicDeleted={handleDeleteTopic}
                    />
                </>
            )}
        </div>
        
    );
}