import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from '@tiptap/react'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import HardBreak from "@tiptap/extension-hard-break";

import { Root } from "./styles"
import { useEffect } from "react";

const extensions = [
    StarterKit.configure({
        hardBreak: false,
    }),
    HardBreak.configure({
        HTMLAttributes: {
            class: "hard-break",
        },
    }),
    Paragraph,
    Text,
]

interface ITextEditorProps {
    onChange?: (text: string) => void;
    value?: string;
}

const TextEditor = ({ onChange, value }: ITextEditorProps) => {
    const editor = useEditor({
        extensions,
        onUpdate: ({ editor }) => {
            const value = editor.getText()
            if (onChange) onChange(value.replace(/\n\n/g, '\n'))
        }
    })

    useEffect(() => {
        if (editor && value !== editor.getText() && value) {
            const formattedValue = typeof value === 'string'
                ? value.replace(/\n/g, '<br>')
                : ''

            editor.commands.setContent(formattedValue, false);
        }
    }, [value, editor]);


    return (
        <Root className="card">
            <EditorContent editor={editor} />
        </Root>
    )
}

export default TextEditor
