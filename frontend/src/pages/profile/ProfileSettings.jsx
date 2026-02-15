import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';
import useLocalization from '../../hooks/useLocalization';
import { getLanguages, getProfile, updateProfileLanguages } from '../../services/profileApi';
import { getToken } from '../../utils/storage';

const ProfileSettings = () => {
  const { t, setLanguage } = useLocalization();
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const [learningLanguageId, setLearningLanguageId] = useState('');
  const [interfaceLanguageId, setInterfaceLanguageId] = useState('');
  const [languageMetaMap, setLanguageMetaMap] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setGlobalError('');

      try {
        const [profile, languages] = await Promise.all([getProfile(), getLanguages()]);

        if (!mounted) {
          return;
        }

        const nativeId = profile?.native_language_id || profile?.native_language?.id || '';
        const learningId = profile?.learning_language_id || profile?.learning_language?.id || '';
        const interfaceId = profile?.interface_language_id || profile?.interface_language?.id || nativeId || '';

        setNativeLanguageId(nativeId);
        setLearningLanguageId(learningId);
        setInterfaceLanguageId(interfaceId);

        const lookup = (Array.isArray(languages) ? languages : []).reduce((acc, language) => {
          acc[language.id] = {
            name: language.name,
            code: (language.code || '').toLowerCase(),
          };
          return acc;
        }, {});

        setLanguageMetaMap(lookup);
      } catch (apiError) {
        if (mounted) {
          setGlobalError(apiError.message || t('profile_settings_load_error'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [t]);

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const validateLanguageId = (id) => !id || Boolean(languageMetaMap[id]);

  const validate = () => {
    const nextErrors = {};

    if (!nativeLanguageId) {
      nextErrors.nativeLanguageId = t('native_language_required');
    } else if (!validateLanguageId(nativeLanguageId)) {
      nextErrors.nativeLanguageId = t('native_language_invalid');
    }

    if (!learningLanguageId) {
      nextErrors.learningLanguageId = t('learning_language_required');
    } else if (!validateLanguageId(learningLanguageId)) {
      nextErrors.learningLanguageId = t('learning_language_invalid');
    }

    if (nativeLanguageId && learningLanguageId && nativeLanguageId === learningLanguageId) {
      nextErrors.learningLanguageId = t('languages_must_differ');
    }

    if (!interfaceLanguageId) {
      nextErrors.interfaceLanguageId = t('interface_language_required');
    } else if (!validateLanguageId(interfaceLanguageId)) {
      nextErrors.interfaceLanguageId = t('interface_language_invalid');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage('');
    setGlobalError('');

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      await updateProfileLanguages({
        native_language_id: nativeLanguageId,
        learning_language_id: learningLanguageId,
        interface_language_id: interfaceLanguageId,
      });

      const nextLanguageCode = languageMetaMap[interfaceLanguageId]?.code;
      if (nextLanguageCode) {
        await setLanguage(nextLanguageCode);
      }

      setMessage(t('profile_settings_saved'));
    } catch (apiError) {
      setGlobalError(apiError.message || t('profile_settings_save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const currentLanguagePair = useMemo(() => {
    const nativeName = languageMetaMap[nativeLanguageId]?.name || '-';
    const learningName = languageMetaMap[learningLanguageId]?.name || '-';
    const interfaceName = languageMetaMap[interfaceLanguageId]?.name || '-';

    return { nativeName, learningName, interfaceName };
  }, [interfaceLanguageId, languageMetaMap, learningLanguageId, nativeLanguageId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile_language_settings')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('current_setup')}: {currentLanguagePair.nativeName} → {currentLanguagePair.learningName} ({t('interface')}:{' '}
          {currentLanguagePair.interfaceName})
        </p>

        {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        {globalError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</p>}

        <form className="mt-6 space-y-4" onSubmit={handleSave}>
          <LanguageSelector
            id="settingsNativeLanguage"
            label={t('native_language')}
            value={nativeLanguageId}
            onChange={(value) => {
              setNativeLanguageId(value);
              setErrors((previousErrors) => ({ ...previousErrors, nativeLanguageId: '', learningLanguageId: '' }));
            }}
            error={errors.nativeLanguageId}
            required
            disabled={isLoading || isSaving}
          />

          <LanguageSelector
            id="settingsLearningLanguage"
            label={t('learning_language')}
            value={learningLanguageId}
            onChange={(value) => {
              setLearningLanguageId(value);
              setErrors((previousErrors) => ({ ...previousErrors, learningLanguageId: '' }));
            }}
            error={errors.learningLanguageId}
            required
            disabled={isLoading || isSaving}
          />

          <LanguageSelector
            id="settingsInterfaceLanguage"
            label={t('interface_language')}
            value={interfaceLanguageId}
            onChange={(value) => {
              setInterfaceLanguageId(value);
              setErrors((previousErrors) => ({ ...previousErrors, interfaceLanguageId: '' }));
            }}
            error={errors.interfaceLanguageId}
            required
            disabled={isLoading || isSaving}
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            disabled={isLoading || isSaving}
          >
            {isSaving ? t('saving_changes') : t('save_changes')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
