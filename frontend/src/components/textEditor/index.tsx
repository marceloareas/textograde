import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from '@tiptap/react'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

import { Root } from "./styles"

const extensions = [
    StarterKit,
    Paragraph,
    Text,
]

interface ITextEditorProps {
    onChange?: (text: string) => void;
}

const TextEditor = ({ onChange }: ITextEditorProps) => {
    const editor = useEditor({
        extensions,
        onUpdate: ({ editor }) => {
            const value = editor.getText()
            if (onChange) onChange(value.replace(/\n\n/g, '\n'))
        }
    })

    return (
        <Root className="card">
            <EditorContent editor={editor} />
        </Root>
    )
}

export default TextEditor
