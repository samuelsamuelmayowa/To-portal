import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";

export default function ChatComponent() {
  const api = import.meta.env.VITE_HOME_OO;

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* ==============================
     AUTO SCROLL
  ============================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  /* ==============================
     SEND MESSAGE
  ============================== */
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const text = message.trim();

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString()
    };

    // 🔥 functional state update (prevents stale state bug)
    setChat(prev => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${api}/api/chat`, {
        message: text
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: res.data?.reply || "No response received.",
        time: new Date().toLocaleTimeString()
      };

      setChat(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);

      setChat(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  /* ==============================
     KEY HANDLER
     Enter = Send
     Shift + Enter = New Line
  ============================== */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">

      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-semibold">AI Tech Assistant</h2>
          <p className="text-xs text-gray-400">
            Splunk • Cybersecurity • DevOps • SOC
          </p>
        </div>

        <div className="text-xs text-green-400">
          ● Online
        </div>
      </div>

      {/* ================= CHAT AREA ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">

        {chat.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-20">
            Ask me anything about Splunk, SIEM, Security Labs...
          </div>
        )}

        {chat.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>

              <span className="block mt-2 text-[10px] text-gray-400 text-right">
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT AREA ================= */}
      <div className="px-6 py-4 border-t border-gray-800 bg-black/60 backdrop-blur-md">

        <div className="flex items-end gap-3">

          <textarea
            ref={inputRef}
            rows={1}
            value={message}
            disabled={loading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Splunk queries, detection engineering..."
            className="flex-1 resize-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:opacity-50"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 rounded-xl transition flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>

        </div>

        <div className="text-[10px] text-gray-500 mt-2">
          Press Enter to send • Shift + Enter for new line
        </div>

      </div>
    </div>
  );
}
// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { Send, Loader2 } from "lucide-react";

// export default function ChatComponent() {
//   const api = import.meta.env.VITE_HOME_OO;

//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const bottomRef = useRef(null);

//   // 🔥 Auto-scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat]);

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     const userMessage = {
//       role: "user",
//       content: message,
//       time: new Date().toLocaleTimeString()
//     };

//     const newChat = [...chat, userMessage];
//     setChat(newChat);
//     setMessage("");
//     setLoading(true);

//     try {
//       const res = await axios.post(`${api}/api/chat`, {
//         message
//       });

//       const assistantMessage = {
//         role: "assistant",
//         content: res.data.reply,
//         time: new Date().toLocaleTimeString()
//       };

//       setChat([...newChat, assistantMessage]);
//     } catch (err) {
//       console.error(err);
//     }

//     setLoading(false);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

//       {/* Header */}
//       <div className="p-4 border-b border-gray-800 flex items-center justify-between">
//         <h2 className="text-lg font-semibold tracking-wide">
//           AI Tech Assistant
//         </h2>
//         <span className="text-xs text-gray-400">Splunk • Cyber • Dev</span>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">

//         {chat.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//           >
//             <div
//               className={`max-w-xl p-4 rounded-2xl shadow-md transition-all duration-300 ${
//                 msg.role === "user"
//                   ? "bg-blue-600 text-white rounded-br-none"
//                   : "bg-gray-800 text-gray-100 rounded-bl-none"
//               }`}
//             >
//               <p className="text-sm leading-relaxed">{msg.content}</p>
//               <span className="block mt-2 text-xs text-gray-400 text-right">
//                 {msg.time}
//               </span>
//             </div>
//           </div>
//         ))}

//         {/* Typing Indicator */}
//         {loading && (
//           <div className="flex justify-start">
//             <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
//               <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
//               <span className="text-sm text-gray-300">Thinking...</span>
//             </div>
//           </div>
//         )}

//         <div ref={bottomRef} />
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-gray-800 bg-black/60 backdrop-blur-md">
//         <div className="flex gap-3 items-center">
//           <input
//             className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyPress}
//             placeholder="Ask about Splunk, Cybersecurity, SOC, SIEM..."
//           />
//           <button
//             onClick={sendMessage}
//             disabled={loading}
//             className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
//           >
//             {loading ? (
//               <Loader2 className="animate-spin w-4 h-4" />
//             ) : (
//               <>
//                 <Send className="w-4 h-4" />
//                 <span>Send</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// // import { useState } from "react";
// // import axios from "axios";

// // export default function ChatComponent() {
// //       const api = import.meta.env.VITE_HOME_OO;
// //   const [message, setMessage] = useState("");
// //   const [chat, setChat] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   const sendMessage = async () => {
// //     if (!message) return;

// //     setLoading(true);

// //     const newChat = [...chat, { role: "user", content: message }];
// //     setChat(newChat);

// //     try {
// //       const res = await axios.post(`${api}/api/chat`, {
// //         message
// //       });

// //       setChat([
// //         ...newChat,
// //         { role: "assistant", content: res.data.reply }
// //       ]);
// //     } catch (err) {
// //       console.error(err);
// //     }

// //     setMessage("");
// //     setLoading(false);
// //   };

// //   return (
// //     <div className="max-w-3xl mx-auto p-6">
// //       <div className="h-96 overflow-y-auto border p-4 rounded mb-4 bg-gray-50">
// //         {chat.map((msg, index) => (
// //           <div key={index} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
// //             <div className={`inline-block p-3 rounded-lg ${
// //               msg.role === "user"
// //                 ? "bg-blue-500 text-white"
// //                 : "bg-gray-200"
// //             }`}>
// //               {msg.content}
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="flex gap-2">
// //         <input
// //           className="flex-1 border p-2 rounded"
// //           value={message}
// //           onChange={(e) => setMessage(e.target.value)}
// //           placeholder="Ask about Splunk, Cybersecurity..."
// //         />
// //         <button
// //           onClick={sendMessage}
// //           className="bg-blue-600 text-white px-4 rounded"
// //         >
// //           {loading ? "..." : "Send"}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }