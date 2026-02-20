import { useState } from "react";
import axios from "axios";

export default function ChatComponent() {
      const api = import.meta.env.VITE_HOME_OO;
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message) return;

    setLoading(true);

    const newChat = [...chat, { role: "user", content: message }];
    setChat(newChat);

    try {
      const res = await axios.post(`${api}/api/chat`, {
        message
      });

      setChat([
        ...newChat,
        { role: "assistant", content: res.data.reply }
      ]);
    } catch (err) {
      console.error(err);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="h-96 overflow-y-auto border p-4 rounded mb-4 bg-gray-50">
        {chat.map((msg, index) => (
          <div key={index} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about Splunk, Cybersecurity..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}