import { useState } from "react";

const SendPdf = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      return alert("Please enter some content before uploading.");
    }
    setLoading(true);
    try {
      const res = await fetch("https://to-backendapi-v1.vercel.app/api/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment: text }),
      });

      const data = await res.json();
      alert("Uploaded Successfully!");
      setText("");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleUpload}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          ✍ Upload Assignment
        </h1>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your assignment or description here..."
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default SendPdf;




{/* <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files[0])}
          />  */}