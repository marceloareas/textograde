import { Tabs } from "antd";
import { useState, useEffect } from "react";
import { useAuth } from "../../context";
import { client } from "../../services/client";
import { TopicsView } from "../../../layout/dashboard/views/topics";
import { useRouter } from "next/router";
import withSession from "../../hoc/withSession";
import { UrlQueryControl } from "@/utils/urlQueryControl";
import { EssaysView } from "../../../layout/dashboard/views/essays";

const { TabPane } = Tabs;

export interface Topic {
  _id: string;
  nome_professor: string;
  tema: string;
  descricao: string;
}

export interface Essay {
  titulo: string;
  texto: string;
  nota_total: number;
  nota_competencia_1_model: number;
  nota_competencia_2_model: number;
  nota_competencia_3_model: number;
  nota_competencia_4_model: number;
  nota_competencia_5_model: number;
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
	const router = useRouter();
	const { tab } = router.query;

	const { tipoUsuario, nomeUsuario } = useAuth();

	const [topicsData, setTopicsData] = useState<Topic[]>([]);
	const [essaysData, setEssaysData] = useState<Essay[]>([]);

	const [categorizedEssaysData, setCategorizedEssaysData] = useState<Essay[]>([]);
	const [categorizedTopicsData, setCategorizedTopicsData] = useState<Topic[]>([]);
	
	const [filteredTopicsData, setFilteredTopicsData] = useState<Topic[]>([]);
	
	const [activeKey, setActiveKey] = useState<string>("1");

	const [filterEssayTopicsType, setFilterEssayTopicsType] = useState<string>("todos");
	const [filterTopicsType, setFilterTopicsType] = useState<string>("todos");

	const [topicSearchValue, setTopicSearchValue] = useState("");
	const [essaySearchValue, setEssaySearchValue] = useState("");

	const [filteredEssaysData, setFilteredEssaysData] = useState<Essay[]>([]);

	const handleTabChange = async (key: string) => {
		setActiveKey(key);

		if (key === "1") {
			await router.push(
                UrlQueryControl("textgrader", router.query, [
                    {
                        key: "tab",
                        value: "temas",
                    },
                ]),
                undefined,
                { shallow: true }
            );
		} else if (key === "2") {
			await router.push(
                UrlQueryControl("textgrader", router.query, [
                    {
                        key: "tab",
                        value: "redacoes",
                    },
                ]),
                undefined,
                { shallow: true }
            );
		}
	};

	useEffect(() => {
		const fetchTemas = async () => {
			try {
				const { data } = await client.get("/tema");
				
				if (Array.isArray(data)) {
					setTopicsData(data);
				} else {
					setTopicsData([]);
				}
			} catch (error) {
				setTopicsData([]);
			}
		};
		
		fetchTemas();

		return () => {
		setTopicSearchValue("");
		setEssaySearchValue("");
		setFilterTopicsType("todos");
		setActiveKey("1");
		setTopicsData([]);
		setFilteredTopicsData([]);
		setEssaysData([]);
		}
	}, []);

	useEffect(() => {
		const fetchRedacoes = async () => {
			try {
				const { data } = await client.get(`/redacao${tipoUsuario === "aluno" ? `?user=${nomeUsuario}` : ""}`);
				
				if (Array.isArray(data)) {
					setEssaysData(data);
				} else {
					setEssaysData([]);
				}
			} catch (error) {
				setEssaysData([]);
			}
		};

		fetchRedacoes();
	}, [tipoUsuario, nomeUsuario]);

	useEffect(() => {
		if (filterTopicsType === "todos") {
			setCategorizedTopicsData(topicsData);
			setFilteredTopicsData(topicsData);
		} else if (filterTopicsType === "meus") {
			setCategorizedTopicsData(
				topicsData.filter((tema) => tema.nome_professor === nomeUsuario)
			);

			setFilteredTopicsData(
				topicsData.filter((tema) => tema.nome_professor === nomeUsuario)
			);
		}
	}, [filterTopicsType, nomeUsuario, topicsData]);
	
	useEffect(() => {
		if (filterEssayTopicsType === "todos") {
			setCategorizedEssaysData(essaysData);
			setFilteredEssaysData(essaysData);
		} else if (filterEssayTopicsType === "meus") {
			const filteredEssays = essaysData.filter((redacao) => {
				return topicsData.find(
				(tema) =>
					tema._id === redacao.id_tema && tema.nome_professor === nomeUsuario
				);
			});

			setCategorizedEssaysData(filteredEssays);
			setFilteredEssaysData(filteredEssays);
		}
	}, [filterEssayTopicsType, essaysData, topicsData, nomeUsuario]);

	useEffect(() => {    
		const newTopics = categorizedTopicsData.filter((topic) =>
			topic.tema.toLowerCase().includes(topicSearchValue.toLowerCase()) ||
			topic.nome_professor.toLowerCase().includes(topicSearchValue.toLowerCase())
		)

		setFilteredTopicsData(newTopics);
	}, [categorizedTopicsData, topicSearchValue]);
	
	useEffect(() => {
		const newEssays = categorizedEssaysData.filter((essay) =>
			essay.titulo.toLowerCase().includes(essaySearchValue.toLowerCase()) ||
			essay.aluno.toLowerCase().includes(essaySearchValue.toLowerCase()) ||
			topicsData.find((tema) =>
				tema._id === essay.id_tema)
					?.tema.toLowerCase()
					.includes(essaySearchValue.toLowerCase()
			)
		);

		setFilteredEssaysData(newEssays);
	}, [essaySearchValue]);

	useEffect(() => {
		if (tab === "temas") {
			setActiveKey("1");
		} else if (tab === "redacoes") {
			setActiveKey("2");
		}
	}, [tab]);

	return (
		<div style={{ padding: "0 20px 0 20px", width: "100vw" }}>
			<Tabs
				activeKey={activeKey}
				onChange={handleTabChange}
				style={{ flex: 1 }}
			>
	            <TabPane tab="Temas" key="1">
					<TopicsView
						filteredTopicsData={filteredTopicsData}
						setFilterTopicsType={setFilterTopicsType}
						topicsData={topicsData}
						setTopicsData={setTopicsData}
						setTopicSearchValue={setTopicSearchValue}
					/>
				</TabPane>

				<TabPane tab="Redações" key="2">
					<EssaysView 
						essaysData={essaysData}
						setEssaysData={setEssaysData}
						setFilterEssayTopicsType={setFilterEssayTopicsType}
						setEssaySearchValue={setEssaySearchValue}
						topicsData={topicsData}
						filteredEssaysData={filteredEssaysData}
					/>
				</TabPane>
			</Tabs>
		</div>
	);
};

export default withSession(Index);
