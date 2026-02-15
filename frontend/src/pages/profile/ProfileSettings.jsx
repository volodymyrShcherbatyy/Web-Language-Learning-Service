import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';
import { getLanguages, getProfile, updateProfileLanguages } from '../../services/profileApi';
import { getToken } from '../../utils/storage';

const ProfileSettings = () => {
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const [learningLanguageId, setLearningLanguageId] = useState('');
  const [interfaceLanguageId, setInterfaceLanguageId] = useState('');
  const [languageMap, setLanguageMap] = useState({});
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

        setNativeLanguageId(profile?.native_language_id || '');
        setLearningLanguageId(profile?.learning_language_id || '');
        setInterfaceLanguageId(profile?.interface_language_id || profile?.native_language_id || '');

        const lookup = (Array.isArray(languages) ? languages : []).reduce((acc, language) => {
          acc[language.id] = language.name;
          return acc;
        }, {});

        setLanguageMap(lookup);
      } catch (apiError) {
        if (mounted) {
          setGlobalError(apiError.message || 'Unable to load your profile settings.');
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
  }, []);

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const validateLanguageId = (id) => !id || Boolean(languageMap[id]);

  const validate = () => {
    const nextErrors = {};

    if (!nativeLanguageId) {
      nextErrors.nativeLanguageId = 'Native language is required.';
    } else if (!validateLanguageId(nativeLanguageId)) {
      nextErrors.nativeLanguageId = 'Selected native language is invalid.';
    }

    if (!learningLanguageId) {
      nextErrors.learningLanguageId = 'Learning language is required.';
    } else if (!validateLanguageId(learningLanguageId)) {
      nextErrors.learningLanguageId = 'Selected learning language is invalid.';
    }

    if (nativeLanguageId && learningLanguageId && nativeLanguageId === learningLanguageId) {
      nextErrors.learningLanguageId = 'Native and learning languages must be different.';
    }

    if (!interfaceLanguageId) {
      nextErrors.interfaceLanguageId = 'Interface language is required.';
    } else if (!validateLanguageId(interfaceLanguageId)) {
      nextErrors.interfaceLanguageId = 'Selected interface language is invalid.';
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
      setMessage('Profile settings updated successfully.');
    } catch (apiError) {
      setGlobalError(apiError.message || 'Could not save profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentLanguagePair = useMemo(() => {
    const nativeName = languageMap[nativeLanguageId] || '-';
    const learningName = languageMap[learningLanguageId] || '-';
    const interfaceName = languageMap[interfaceLanguageId] || '-';

    return { nativeName, learningName, interfaceName };
  }, [interfaceLanguageId, languageMap, learningLanguageId, nativeLanguageId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Profile language settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Current setup: {currentLanguagePair.nativeName} → {currentLanguagePair.learningName} (Interface:{' '}
          {currentLanguagePair.interfaceName})
        </p>

        {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        {globalError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</p>}

        <form className="mt-6 space-y-4" onSubmit={handleSave}>
          <LanguageSelector
            id="settingsNativeLanguage"
            label="Native language"
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
            label="Learning language"
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
            label="Interface language"
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
            {isSaving ? 'Saving changes...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
