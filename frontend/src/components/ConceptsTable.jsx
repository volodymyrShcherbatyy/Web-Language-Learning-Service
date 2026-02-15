const ConceptsTable = ({
  concepts,
  isLoading,
  page,
  totalPages,
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortChange,
  onPageChange,
  onEdit,
  onDelete,
}) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
      <input
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search concepts..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 md:max-w-xs"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSortChange('id')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Sort ID {sortBy === 'id' ? `(${sortOrder})` : ''}
        </button>
        <button
          type="button"
          onClick={() => onSortChange('type')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Sort Type {sortBy === 'type' ? `(${sortOrder})` : ''}
        </button>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['ID', 'Type', 'Languages count', 'Media count', 'Actions'].map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-sm">
          {isLoading ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                Loading concepts...
              </td>
            </tr>
          ) : concepts.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                No concepts found.
              </td>
            </tr>
          ) : (
            concepts.map((concept) => (
              <tr key={concept.id}>
                <td className="px-4 py-3 text-gray-700">{concept.id}</td>
                <td className="px-4 py-3 text-gray-900">{concept.type}</td>
                <td className="px-4 py-3 text-gray-700">
                  {concept.languages_count ?? concept.translations?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-gray-700">{concept.media_count ?? concept.media?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(concept.id)}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(concept.id)}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
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

    <div className="flex items-center justify-between border-t border-gray-200 p-4">
      <button
        type="button"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  </div>
);

export default ConceptsTable;
