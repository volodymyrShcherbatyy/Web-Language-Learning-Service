import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConceptsTable from '../../components/ConceptsTable';
import { ApiError, deleteConcept, getConcepts } from '../../services/adminApi';

const ConceptsList = ({ onForbidden }) => {
  const navigate = useNavigate();
  const [concepts, setConcepts] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let mounted = true;

    const loadConcepts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getConcepts({
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });

        if (!mounted) {
          return;
        }

        const items = Array.isArray(data) ? data : data.items || data.rows || [];
        setConcepts(items);
        setTotal(data.total || items.length);
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

    loadConcepts();

    return () => {
      mounted = false;
    };
  }, [debouncedSearch, sortBy, sortOrder, page, limit, onForbidden]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const handleSortChange = (field) => {
    if (field === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortOrder('asc');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this concept?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteConcept(id);
      setNotice('Concept deleted successfully.');
      setConcepts((current) => current.filter((concept) => concept.id !== id));
      setTotal((current) => Math.max(0, current - 1));
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Concepts</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/concepts/new')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Create concept
        </button>
      </div>

      {notice && <div className="mb-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
      {error && <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <ConceptsTable
        concepts={concepts}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onSortChange={handleSortChange}
        onPageChange={setPage}
        onEdit={(id) => navigate(`/admin/concepts/${id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ConceptsList;
