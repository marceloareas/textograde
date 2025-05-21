import { Modal, message } from "antd";
import { useEffect, useState } from "react";
import { Essay } from "@/pages/textgrader";
import { useAuth } from "@/context";
import { client } from "@/services/client";
import { StudentEssayModalContent } from "./views/student";
import { TeacherEssayModalContent } from "./views/teacher";

export type Grade = {
    grade1: number | null;
    grade2: number | null;
    grade3: number | null;
    grade4: number | null;
    grade5: number | null;
};

interface EssayDetails {
  open: boolean;
  onCancel: () => void;
  essay: Essay;
  onEssayUpdated: (essayUpdated: Essay) => void;
}

const ModalDetalhesRedacao: React.FC<EssayDetails> = ({
  open,
  onCancel,
  essay,
  onEssayUpdated,
}) => {
    const [gradesUpdated, setGradesUpdated] = useState<Grade>({
        grade1: null,
        grade2: null,
        grade3: null,
        grade4: null,
        grade5: null,
    });

    const { tipoUsuario } = useAuth();

    const handleUpdateEssay = async () => {
        try {
            if (
                gradesUpdated.grade1 === null ||
                gradesUpdated.grade2 === null ||
                gradesUpdated.grade3 === null ||
                gradesUpdated.grade4 === null ||
                gradesUpdated.grade5 === null
            ) {
                message.error("Erro ao atualizar a redação. Preencha todas as notas.");
                return;
            }

            if (
                essay.nota_competencia_1_professor &&
                essay.nota_competencia_2_professor &&
                essay.nota_competencia_3_professor &&
                essay.nota_competencia_4_professor &&
                essay.nota_competencia_5_professor
            ) {
                message.error("Redação já foi corrigida!");
                return;
            }
            
            if (essay) {
                const { data } = await client.put(`/redacao/${essay._id}`, {
                    nota_competencia_1_professor: gradesUpdated.grade1,
                    nota_competencia_2_professor: gradesUpdated.grade2,
                    nota_competencia_3_professor: gradesUpdated.grade3,
                    nota_competencia_4_professor: gradesUpdated.grade4,
                    nota_competencia_5_professor: gradesUpdated.grade5,
                });

                if (data) {
                    message.success("Redação atualizada com sucesso!");

                    onEssayUpdated({ 
                        ...essay,
                        nota_competencia_1_professor: gradesUpdated.grade1,
                        nota_competencia_2_professor: gradesUpdated.grade2,
                        nota_competencia_3_professor: gradesUpdated.grade3,
                        nota_competencia_4_professor: gradesUpdated.grade4,
                        nota_competencia_5_professor: gradesUpdated.grade5
                    });
                }
            }
        } catch (error) {
            message.error("Erro ao atualizar a redação. Por favor, tente novamente.");
        }
    };

    const handleChangeGrade = (value: number, grade: number) => {
        setGradesUpdated((prev) => ({
            ...prev,
            [`grade${grade}`]: value,
        }));
    };

    useEffect(() => {
        if (essay) {
            setGradesUpdated({
                grade1: essay.nota_competencia_1_professor,
                grade2: essay.nota_competencia_2_professor,
                grade3: essay.nota_competencia_3_professor,
                grade4: essay.nota_competencia_4_professor,
                grade5: essay.nota_competencia_5_professor,
            });
        }

        return () => {
            setGradesUpdated({
                grade1: null,
                grade2: null,
                grade3: null,
                grade4: null,
                grade5: null,
            });
        }
    }, [essay]);
    

    return (
        <Modal
            title={tipoUsuario === "aluno" ? "Detalhes da redação" : "Editar redação"}
            open={open}
            onCancel={onCancel}
            onOk={tipoUsuario === "aluno" ? ()=>{} : handleUpdateEssay}
            width="80vw"
            style={{ height: "80vh", top: "10px" }}
        >
            {tipoUsuario === "aluno" ? (
                <StudentEssayModalContent essay={essay} />
            ) : (
                <TeacherEssayModalContent
                    essay={essay}
                    gradesUpdated={gradesUpdated}
                    handleChangeGrade={handleChangeGrade}
                />
            )}
        </Modal>
    );
};

export default ModalDetalhesRedacao;
