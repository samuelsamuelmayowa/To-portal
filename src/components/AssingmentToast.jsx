function AssignmentToast({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-xl shadow-lg animate-bounce">
      <p className="font-medium text-sm">
        New assignment has been released!
      </p>
      <button
        onClick={onClose}
        className="text-xs underline mt-2"
      >
        Close
      </button>
    </div>
  );
}
