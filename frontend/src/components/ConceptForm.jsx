import { useEffect, useState } from 'react';

const ConceptForm = ({ initialData, onSubmit, onCancel, isSaving }) => {
  const [type, setType] = useState('word');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    setType(initialData?.type || 'word');
    setDifficulty(initialData?.difficulty || '');
  }, [initialData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ type, difficulty: difficulty || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Concept Details</h3>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="word">Word</option>
          <option value="phrase">Phrase</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="difficulty">
          Difficulty (optional)
        </label>
        <input
          id="difficulty"
          type="text"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ConceptForm;
