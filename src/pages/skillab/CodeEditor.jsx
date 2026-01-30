import { useRef } from "react";
import Editor from "@monaco-editor/react";
import { Copy, RotateCcw } from "lucide-react";

export default function CodeEditor({
  title = "Editor",
  language = "javascript",
  value,
  onChange,
  height = "420px",
  readOnly = false,
  onReset,
}) {
  const editorRef = useRef(null);

  const handleCopy = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    await navigator.clipboard.writeText(code);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0f19] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
            {language.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            title="Copy code"
          >
            <Copy size={14} />
          </button>

          {onReset && !readOnly && (
            <button
              onClick={onReset}
              className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              title="Reset code"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <Editor
        height={height}
        language={language}
        value={value}
        theme="vs-dark"
        onMount={(editor) => (editorRef.current = editor)}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}


// import Editor from "@monaco-editor/react";

// export default function CodeEditor({
//   language = "javascript",
//   value,
//   onChange,
//   height = "400px",
//   readOnly = false,
// }) {
//   return (
//     <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
//       <Editor
//         height={height}
//         language={language}
//         value={value}
//         theme="vs-dark"
//         options={{
//           minimap: { enabled: false },
//           fontSize: 14,
//           wordWrap: "on",
//           readOnly,
//           automaticLayout: true,
//         }}
//         onChange={onChange}
//       />
//     </div>
//   );
// }
