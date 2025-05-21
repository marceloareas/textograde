import { ReactElement } from "react";
import { Input, Button, Collapse } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Essay } from "@/pages/textgrader";
import { inputStyle, labelStyle } from "../../styles";

const { Panel } = Collapse;

interface IStudentEssayModalProps {
    essay: Essay;
};

export const StudentEssayModalContent = ({ essay }: IStudentEssayModalProps): ReactElement => {
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
                <Panel header="Notas competências - Modelo" key="1">
                    {[1, 2, 3, 4, 5].map((num) => (
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

                <Panel header="Notas competências - Professor" key="2">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num}>
                            <label style={labelStyle}>
                                <b>Nota Competência {num} (Professor):</b>
                            </label>

                            <Input
                                style={inputStyle}
                                value={
                                    (essay as any)[`nota_competencia_${num}_professor`] ?? 0
                                }
                                disabled
                            />
                        </div>
                    ))}
                </Panel>
            </Collapse>
        </div>
    );
}