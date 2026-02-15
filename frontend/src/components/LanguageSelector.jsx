import { useEffect, useMemo, useState } from 'react';
import useLocalization from '../hooks/useLocalization';
import { getLanguages } from '../services/profileApi';

let languagesCache = null;
let pendingLanguagesRequest = null;

const getLanguagesList = async () => {
  if (languagesCache) {
    return languagesCache;
  }

  if (!pendingLanguagesRequest) {
    pendingLanguagesRequest = getLanguages().then((languages) => {
      languagesCache = Array.isArray(languages) ? languages : [];
      pendingLanguagesRequest = null;
      return languagesCache;
    });
  }

  return pendingLanguagesRequest;
};

const LanguageSelector = ({
  label,
  id,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  excludeIds = [],
}) => {
  const { t } = useLocalization();
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadLanguages = async () => {
      setLoadError('');
      setIsLoading(true);

      try {
        const languageList = await getLanguagesList();

        if (isMounted) {
          setLanguages(languageList);
        }
      } catch (apiError) {
        if (isMounted) {
          setLoadError(apiError.message || t('load_languages_error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLanguages();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const visibleLanguages = useMemo(
    () => languages.filter((language) => !excludeIds.includes(language.id)),
    [excludeIds, languages]
  );

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || '')}
        disabled={disabled || isLoading || Boolean(loadError)}
        required={required}
      >
        <option value="">{t('select_language')}</option>
        {visibleLanguages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name}
          </option>
        ))}
      </select>
      {isLoading && <p className="mt-1 text-xs text-gray-500">{t('loading_languages')}</p>}
      {loadError && <p className="mt-1 text-sm text-red-600">{loadError}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LanguageSelector;
