import { useEffect, useState } from 'react';
import MediaUploader from '../../components/MediaUploader';
import { ApiError, deleteMedia, getMedia, uploadMedia } from '../../services/adminApi';

const MediaManager = ({ onForbidden }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadMedia = async () => {
      try {
        const data = await getMedia();
        if (mounted) {
          setMediaItems(Array.isArray(data) ? data : data.items || []);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 403) {
          onForbidden();
          return;
        }

        if (mounted) {
          setError(loadError.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMedia();

    return () => {
      mounted = false;
    };
  }, [onForbidden]);

  const handleUpload = async (payload) => {
    setIsUploading(true);
    setError('');

    try {
      const created = await uploadMedia(payload);
      const newItem = created?.id ? created : created?.media || created;
      setMediaItems((current) => [newItem, ...current]);
      setNotice('Media uploaded successfully.');
    } catch (uploadError) {
      if (uploadError instanceof ApiError && uploadError.status === 403) {
        onForbidden();
        return;
      }

      setError(uploadError.message);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) {
      return;
    }

    setError('');
    try {
      await deleteMedia(id);
      setMediaItems((current) => current.filter((item) => item.id !== id));
      setNotice('Media deleted successfully.');
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 403) {
        onForbidden();
        return;
      }

      setError(deleteError.message);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Media Manager</h1>
      {notice && <div className="mb-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
      {error && <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {isLoading ? <p className="text-gray-600">Loading media...</p> : null}
      <MediaUploader mediaItems={mediaItems} onUpload={handleUpload} onDelete={handleDelete} isUploading={isUploading} />
    </div>
  );
};

export default MediaManager;
