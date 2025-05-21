import Document from '@tiptap/extension-document'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

import { Root } from "./styles"

const CustomDocument = Document.extend({
  content: `paragraph block*`,
})

const extensions = [
    CustomDocument,
    Paragraph,
    Text,
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === "heading") {
                return "Adicione o título..."
            }

            return "Adicione mais texto..."
        },
    }),
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
