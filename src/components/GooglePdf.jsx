
    const GoogleSlidesViewer = () => {
  const slideId = "1bZPsvamsOz2OxrFNir3gld2vJtBzLoPh";
  const embedUrl = `https://docs.google.com/presentation/d/${slideId}/embed?start=false&loop=false&delayms=3000`;

  return (
    <div className="w-full h-[500px] bg-white shadow-md rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        className="w-full h-full"
        title="Google Slides Presentation"
      ></iframe>
    </div>
  );
};

export default GoogleSlidesViewer