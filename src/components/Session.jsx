import { useState } from "react";

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.5,
    },
  },
};

const image = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const h1 = {
  hidden: { x: "-40px", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
};
const p = {
  hidden: { y: "-80px", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const Session = () => {
  const [posts, setPosts] = useState([]); // store all posts
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() && !image) return;

    const newPost = {
      id: Date.now(),
      description,
      image: preview,
    };

    setPosts([newPost, ...posts]); // add new post on top
    setDescription("");
    setImage(null);
    setPreview(null);
  };

  return (
    <section className="relative z-10 px-5 pt-24 pb-10 md:py-20 md:px-10 bg-white border-red-500">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Create Post */}
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Share your thoughts 💡
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your question, idea, or thought..."
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={4}
            />

            {/* Image preview */}
            {preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-60 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setImage(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                >
                  ✕ Remove
                </button>
              </div>
            )}

            {/* Upload + Post */}
            <div className="flex items-center justify-between">
              <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
              >
                Post
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No posts yet. Be the first to share something!
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-5"
              >
                <p className="text-gray-800 dark:text-gray-200 mb-3">
                  {post.description}
                </p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Session;
