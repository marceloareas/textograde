import { ReactElement, useState } from "react";
import { Button, Select, Space, Tooltip } from "antd";
import { SearchInput } from "@/components/searchInput";
import CustomTable from "@/components/customTable";
import { useAuth } from "@/context";
import { Essay, Topic } from "@/pages/textgrader";
import ModalDetalhesRedacao from "@/components/modalDetalhesRedacao";

const { Option } = Select;


interface IEssaysViewProps {
    essaysData: Essay[];
    setEssaysData: (data: Essay[]) => void;
    setFilterEssayTopicsType: (value: string) => void;
    setEssaySearchValue: (value: string) => void;
    topicsData: Topic[];
    filteredEssaysData: Essay[];
}

export const EssaysView = ({
    essaysData,
    setEssaysData,
    setEssaySearchValue,
    setFilterEssayTopicsType,
    topicsData,
    filteredEssaysData,
}: IEssaysViewProps): ReactElement => {
    const { tipoUsuario } = useAuth();

    const [essayModalVisible, setEssayModalVisible] = useState(false);
	const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

    const openEssayModal = (essay: any) => {
        setSelectedEssay(essay);
        setEssayModalVisible(true);
    };

    const handleUpdateEssay = (updatedEssay: Essay) => {
        setEssaysData(
            essaysData.map((redacao) =>
                redacao._id === updatedEssay._id ? updatedEssay : redacao
            )
        );
    };

    const getTopicName = (id_tema: string): string => {
        const tema = topicsData.find((topic) => topic._id === id_tema);
        return tema ? tema.tema : "Tema não encontrado";
    };

    const redacaoColumns = [
        {
            title: "Título",
            dataIndex: "titulo",
            key: "titulo",
            render: (text: string, record: Essay) => (
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
            render: (_: any, record: Essay) => {
                const mediaModelo =
                (record.nota_competencia_1_model +
                    record.nota_competencia_2_model +
                    record.nota_competencia_3_model +
                    record.nota_competencia_4_model +
                    record.nota_competencia_5_model);

                return mediaModelo.toFixed(2);
            },
        },
        {
            title: "Nota Professor",
            dataIndex: "nota_professor",
            key: "nota_professor",
            align: "center",
            ellipsis: true,
            render: (_: any, record: Essay) => {
                const mediaProfessor =
                (record.nota_competencia_1_professor +
                    record.nota_competencia_2_professor +
                    record.nota_competencia_3_professor +
                    record.nota_competencia_4_professor +
                    record.nota_competencia_5_professor);

                return mediaProfessor.toFixed(2);
            },
        },
            {
            title: "Média",
            dataIndex: "media",
            key: "media",
            align: "center",
            ellipsis: true,
            render: (_: any, record: Essay) => {
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

                return notaTotal.toFixed(2);
            },
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
                        <Select
                            defaultValue="todos"
                            style={{ width: 200 }}
                            onChange={(value) => setFilterEssayTopicsType(value)}
                        >
                            <Option value="todos">Todas as Redações</Option>
                            <Option value="meus">Redações dos meus temas</Option>
                        </Select>
                    )}
                </div>

                <SearchInput
                    onChange={setEssaySearchValue}
                    placeholder="Digite um título, aluno ou tema"
                />
            </Space>

            <CustomTable
                dataSource={filteredEssaysData}
                columns={redacaoColumns}
            />

            <ModalDetalhesRedacao
				open={essayModalVisible}
				onCancel={() => setEssayModalVisible(false)}
				redacao={selectedEssay}
				onRedacaoEditado={handleUpdateEssay}
			/>
        </>
    );
}