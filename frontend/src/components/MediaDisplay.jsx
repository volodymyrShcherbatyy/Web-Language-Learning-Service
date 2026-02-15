const MediaDisplay = ({ media, prompt }) => {
  if (!media) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-gray-100">
      <img src={media} alt={prompt || 'Exercise media'} className="h-auto max-h-80 w-full object-contain" loading="lazy" />
    </div>
  );
};

export default MediaDisplay;
