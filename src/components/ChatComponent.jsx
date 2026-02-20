import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";

export default function ChatComponent() {
  const api = import.meta.env.VITE_HOME_OO;

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // 🔥 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      time: new Date().toLocaleTimeString()
    };

    const newChat = [...chat, userMessage];
    setChat(newChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${api}/api/chat`, {
        message
      });

      const assistantMessage = {
        role: "assistant",
        content: res.data.reply,
        time: new Date().toLocaleTimeString()
      };

      setChat([...newChat, assistantMessage]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide">
          AI Tech Assistant
        </h2>
        <span className="text-xs text-gray-400">Splunk • Cyber • Dev</span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">

        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl p-4 rounded-2xl shadow-md transition-all duration-300 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span className="block mt-2 text-xs text-gray-400 text-right">
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-black/60 backdrop-blur-md">
        <div className="flex gap-3 items-center">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about Splunk, Cybersecurity, SOC, SIEM..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
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
      </div>
    </div>
  );
}


// import { useState } from "react";
// import axios from "axios";

// export default function ChatComponent() {
//       const api = import.meta.env.VITE_HOME_OO;
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!message) return;

//     setLoading(true);

//     const newChat = [...chat, { role: "user", content: message }];
//     setChat(newChat);

//     try {
//       const res = await axios.post(`${api}/api/chat`, {
//         message
//       });

//       setChat([
//         ...newChat,
//         { role: "assistant", content: res.data.reply }
//       ]);
//     } catch (err) {
//       console.error(err);
//     }

//     setMessage("");
//     setLoading(false);
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       <div className="h-96 overflow-y-auto border p-4 rounded mb-4 bg-gray-50">
//         {chat.map((msg, index) => (
//           <div key={index} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
//             <div className={`inline-block p-3 rounded-lg ${
//               msg.role === "user"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200"
//             }`}>
//               {msg.content}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         <input
//           className="flex-1 border p-2 rounded"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Ask about Splunk, Cybersecurity..."
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-4 rounded"
//         >
//           {loading ? "..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// }