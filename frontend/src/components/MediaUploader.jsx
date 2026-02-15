import { useMemo, useState } from 'react';

const MediaUploader = ({ mediaItems, onUpload, onDelete, isUploading }) => {
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [conceptId, setConceptId] = useState('');
  const [error, setError] = useState('');

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }

    if (!conceptId.trim()) {
      setError('Concept ID is required.');
      return;
    }

    await onUpload({ file, mediaType, conceptId: conceptId.trim() });
    setFile(null);
    setConceptId('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-gray-900">Upload Media</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="file"
            accept="image/*,image/gif"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <select
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="image">Image</option>
            <option value="gif">GIF</option>
          </select>
          <input
            type="text"
            value={conceptId}
            onChange={(event) => setConceptId(event.target.value)}
            placeholder="Concept ID"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        {previewUrl && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">Preview</p>
            <img src={previewUrl} alt="Upload preview" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isUploading}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-gray-900">Media Library</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.length === 0 ? (
            <p className="text-sm text-gray-500">No media files uploaded yet.</p>
          ) : (
            mediaItems.map((media) => (
              <div key={media.id} className="rounded-lg border border-gray-200 p-3">
                <img
                  src={media.url || media.path}
                  alt={`Media ${media.id}`}
                  loading="lazy"
                  className="mb-3 h-32 w-full rounded object-cover"
                />
                <p className="text-xs text-gray-600">Concept: {media.concept_id}</p>
                <p className="text-xs text-gray-600">Type: {media.media_type}</p>
                <button
                  type="button"
                  onClick={() => onDelete(media.id)}
                  className="mt-2 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;
