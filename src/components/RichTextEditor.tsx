import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, CheckSquare, Link as LinkIcon, Minus, RemoveFormatting, Heading1, Heading2, Undo, Redo, Quote, Palette, Highlighter } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[120px] p-3 outline-none',
      },
    },
  });

  if (!editor) return null;

  const Button = ({ onClick, isActive, disabled, title, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-md bg-white">
      <div className="flex items-center gap-0.5 border-b bg-gray-50 p-1.5 flex-wrap overflow-x-auto">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="relative group">
          <Button
            onClick={() => {}}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </Button>
          <div className="hidden group-hover:flex absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 gap-1 z-50">
            {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="relative group">
          <Button
            onClick={() => {}}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
          <div className="hidden group-hover:flex absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 gap-1 z-50">
            {['#fef08a', '#bfdbfe', '#bbf7d0', '#fecaca', '#e9d5ff', '#fed7aa'].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 bg-white flex items-center justify-center text-xs"
              title="Remove highlight"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <style>{`
          .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
          .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
          .ProseMirror li { margin: 0.25rem 0; }
          .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
          .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; }
          .ProseMirror ul[data-type="taskList"] li > label { margin-right: 0.5rem; user-select: none; }
          .ProseMirror ul[data-type="taskList"] li > div { flex: 1; }
          .ProseMirror h1 { font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0; }
          .ProseMirror h2 { font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; }
          .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #6b7280; margin: 0.5rem 0; }
          .ProseMirror strong { font-weight: bold; }
          .ProseMirror em { font-style: italic; }
          .ProseMirror u { text-decoration: underline; }
          .ProseMirror s { text-decoration: line-through; }
          .ProseMirror a { color: #3b82f6; text-decoration: underline; cursor: pointer; }
          .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0; }
        `}</style>
        <EditorContent editor={editor} />
        {!editor.getText() && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
