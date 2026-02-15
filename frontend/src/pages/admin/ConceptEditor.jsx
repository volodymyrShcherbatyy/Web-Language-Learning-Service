import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConceptForm from '../../components/ConceptForm';
import TranslationTable from '../../components/TranslationTable';
import {
  ApiError,
  createConcept,
  createTranslation,
  deleteTranslation,
  getConcepts,
  updateConcept,
  updateTranslation,
} from '../../services/adminApi';

const ConceptEditor = ({ onForbidden }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreating = useMemo(() => id === 'new', [id]);
  const [concept, setConcept] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [isLoading, setIsLoading] = useState(!isCreating);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslationSaving, setIsTranslationSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadConcept = async () => {
      if (isCreating) {
        return;
      }

      setIsLoading(true);

      try {
        const data = await getConcepts();
        const items = Array.isArray(data) ? data : data.items || [];
        const selected = items.find((item) => String(item.id) === String(id));

        if (!selected) {
          throw new Error('Concept not found.');
        }

        if (mounted) {
          setConcept(selected);
          setTranslations(selected.translations || []);
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

    loadConcept();

    return () => {
      mounted = false;
    };
  }, [id, isCreating, onForbidden]);

  const handleSaveConcept = async (values) => {
    setError('');
    setNotice('');
    setIsSaving(true);

    try {
      if (isCreating) {
        const created = await createConcept(values);
        const createdConcept = created?.id ? created : created?.concept || created?.data || created;
        setNotice('Concept created successfully.');
        navigate(`/admin/concepts/${createdConcept.id}`);
      } else {
        const updated = await updateConcept(id, values);
        setConcept((current) => ({ ...current, ...(updated || values) }));
        setNotice('Concept updated successfully.');
      }
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 403) {
        onForbidden();
        return;
      }

      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTranslation = async (payload) => {
    if (isCreating) {
      setError('Save concept before adding translations.');
      return;
    }

    setIsTranslationSaving(true);
    setError('');

    try {
      const created = await createTranslation({ concept_id: id, ...payload });
      const newTranslation = created?.id ? created : created?.translation || created;
      setTranslations((current) => [...current, newTranslation]);
      setNotice('Translation added successfully.');
    } catch (translationError) {
      if (translationError instanceof ApiError && translationError.status === 403) {
        onForbidden();
        return;
      }

      setError(translationError.message);
      throw translationError;
    } finally {
      setIsTranslationSaving(false);
    }
  };

  const handleUpdateTranslation = async (translationId, payload) => {
    setIsTranslationSaving(true);
    setError('');

    try {
      const updated = await updateTranslation(translationId, payload);
      setTranslations((current) =>
        current.map((translation) =>
          translation.id === translationId ? { ...translation, ...(updated || payload) } : translation
        )
      );
      setNotice('Translation updated successfully.');
    } catch (translationError) {
      if (translationError instanceof ApiError && translationError.status === 403) {
        onForbidden();
        return;
      }

      setError(translationError.message);
      throw translationError;
    } finally {
      setIsTranslationSaving(false);
    }
  };

  const handleDeleteTranslation = async (translationId) => {
    if (!window.confirm('Delete this translation?')) {
      return;
    }

    setError('');
    try {
      await deleteTranslation(translationId);
      setTranslations((current) => current.filter((translation) => translation.id !== translationId));
      setNotice('Translation deleted successfully.');
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 403) {
        onForbidden();
        return;
      }

      setError(deleteError.message);
    }
  };

  if (isLoading) {
    return <p className="text-gray-600">Loading concept...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{isCreating ? 'Create Concept' : `Edit Concept #${id}`}</h1>
      {notice && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <ConceptForm
        initialData={concept}
        onSubmit={handleSaveConcept}
        onCancel={() => navigate('/admin/concepts')}
        isSaving={isSaving}
      />

      {!isCreating && (
        <TranslationTable
          translations={translations}
          onCreate={handleAddTranslation}
          onUpdate={handleUpdateTranslation}
          onDelete={handleDeleteTranslation}
          isSubmitting={isTranslationSaving}
        />
      )}
    </div>
  );
};

export default ConceptEditor;
