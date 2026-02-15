import { useMemo, useState } from 'react';

const defaultLanguages = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh'];

const TranslationTable = ({ translations, onCreate, onUpdate, onDelete, isSubmitting }) => {
  const [language, setLanguage] = useState(defaultLanguages[0]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const usedLanguages = useMemo(
    () => new Set(translations.map((translation) => translation.language || translation.language_code)),
    [translations]
  );

  const resetForm = () => {
    setEditingId(null);
    setLanguage(defaultLanguages[0]);
    setText('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedLanguage = language.trim();
    const normalizedText = text.trim();

    if (!normalizedText) {
      setError('Translation text is required.');
      return;
    }

    const duplicate = translations.some(
      (translation) =>
        (translation.language || translation.language_code) === normalizedLanguage && translation.id !== editingId
    );

    if (duplicate) {
      setError('Each concept can only have one translation per language.');
      return;
    }

    if (editingId) {
      await onUpdate(editingId, {
        language: normalizedLanguage,
        text: normalizedText,
      });
    } else {
      await onCreate({
        language: normalizedLanguage,
        text: normalizedText,
      });
    }

    resetForm();
  };

  const startEdit = (translation) => {
    setEditingId(translation.id);
    setLanguage(translation.language || translation.language_code);
    setText(translation.text);
    setError('');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-gray-900">Translations</h3>

      <form className="mb-4 grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        >
          {defaultLanguages.map((option) => (
            <option key={option} value={option} disabled={!editingId && usedLanguages.has(option)}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Translation text"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none md:col-span-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Language</th>
              <th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Text</th>
              <th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {translations.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-center text-gray-500" colSpan={3}>
                  No translations yet.
                </td>
              </tr>
            ) : (
              translations.map((translation) => (
                <tr key={translation.id}>
                  <td className="px-3 py-2">{(translation.language || translation.language_code).toUpperCase()}</td>
                  <td className="px-3 py-2">{translation.text}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(translation)}
                        className="rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(translation.id)}
                        className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TranslationTable;
