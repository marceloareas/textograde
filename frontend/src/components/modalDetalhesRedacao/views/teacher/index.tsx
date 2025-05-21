import { ReactElement } from "react";
import { Input, Button, Collapse } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Essay } from "@/pages/textgrader";
import { Grade } from "../..";
import { inputStyle, labelStyle } from "../../styles";

const { Panel } = Collapse;

interface ITeacherEssayModalProps {
    essay: Essay;
    gradesUpdated: Grade;
    handleChangeGrade: (value: number, grade: number) => void;
};

export const TeacherEssayModalContent = ({
    essay,
    gradesUpdated,
    handleChangeGrade,
}: ITeacherEssayModalProps): ReactElement => {
    return (
        <div>
            <label style={labelStyle}>
                <b>Título:</b>
            </label>
            
            <Input style={inputStyle} value={essay.titulo} disabled />
            
            <label style={labelStyle}>
                <b>Texto:</b>
            </label>

            <TextArea
                rows={20}
                style={inputStyle}
                value={essay.texto}
                disabled
            />

            <Collapse style={labelStyle}>
                <Panel header="Notas competências - Professor" key="1">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num}>
                            <label style={labelStyle}>
                                <b>Nota Competência {num} (Professor):</b>
                            </label>

                            <Input
                                style={inputStyle}
                                value={
                                    gradesUpdated[`grade${num}` as keyof Grade] || 0
                                }
                                onChange={(e) => {
                                    const value = Number(e.target.value) || 0;
                                    handleChangeGrade(value, num);
                                }}
                            />
                        </div>
                    ))}
                </Panel>
                <Panel header="Notas competências - Modelo" key="2">
                    {[1, 2, 3, 4, 5].map((num: number) => (
                        <div key={num}>
                            <label style={labelStyle}>
                                <b>Nota Competência {num} (Modelo):</b>
                            </label>
                            
                            <Input
                                style={inputStyle}
                                value={(essay as any)[`nota_competencia_${num}_model`] ?? 0}
                                disabled
                            />
                        </div>
                    ))}
                </Panel>
            </Collapse>
        </div>
    );
}