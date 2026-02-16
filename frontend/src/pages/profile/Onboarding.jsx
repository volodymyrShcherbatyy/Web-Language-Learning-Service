import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';
import StepCard from '../../components/StepCard';
import useLocalization from '../../hooks/useLocalization';
import { getLanguages, getProfile, updateProfileLanguages } from '../../services/profileApi';
import { getToken } from '../../utils/storage';

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const { t, setLanguage } = useLocalization();
  const [currentStep, setCurrentStep] = useState(1);
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const [learningLanguageId, setLearningLanguageId] = useState('');
  const [interfaceLanguageId, setInterfaceLanguageId] = useState('');
  const [languageMap, setLanguageMap] = useState({});
  const [validLanguageIds, setValidLanguageIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const [profile, languages] = await Promise.all([getProfile(), getLanguages()]);

        if (!mounted) {
          return;
        }

        const lookup = (Array.isArray(languages) ? languages : []).reduce((acc, language) => {
          acc[language.id] = language;
          return acc;
        }, {});

        setLanguageMap(lookup);
        setValidLanguageIds(Object.keys(lookup).map(Number));

        const nativeId = profile?.native_language_id || profile?.native_language?.id || '';
        const learningId = profile?.learning_language_id || profile?.learning_language?.id || '';
        const interfaceId = profile?.interface_language_id || profile?.interface_language?.id || nativeId || '';

        setNativeLanguageId(nativeId);
        setLearningLanguageId(learningId);
        setInterfaceLanguageId(interfaceId);

        
      } catch (apiError) {
        if (mounted) {
          setGlobalError(apiError.message || t('profile_load_error'));
        }
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate, t]);

  const summaryItems = useMemo(
    () => [
      { label: t('native'), value: languageMap[nativeLanguageId]?.name || '-' },
      { label: t('learning'), value: languageMap[learningLanguageId]?.name || '-' },
      { label: t('interface'), value: languageMap[interfaceLanguageId]?.name || '-' },
    ],
    [interfaceLanguageId, languageMap, learningLanguageId, nativeLanguageId, t]
  );

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const validateLanguageId = (id) => !id || validLanguageIds.includes(id);

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 2) {
      if (!nativeLanguageId) {
        nextErrors.nativeLanguageId = t('native_language_required');
      } else if (!validateLanguageId(nativeLanguageId)) {
        nextErrors.nativeLanguageId = t('native_language_invalid');
      }
    }

    if (currentStep === 3) {
      if (!learningLanguageId) {
        nextErrors.learningLanguageId = t('learning_language_required');
      } else if (!validateLanguageId(learningLanguageId)) {
        nextErrors.learningLanguageId = t('learning_language_invalid');
      }

      if (nativeLanguageId && learningLanguageId && nativeLanguageId === learningLanguageId) {
        nextErrors.learningLanguageId = t('languages_must_differ');
      }
    }

    if (currentStep === 4) {
      if (!interfaceLanguageId) {
        nextErrors.interfaceLanguageId = t('interface_language_required');
      } else if (!validateLanguageId(interfaceLanguageId)) {
        nextErrors.interfaceLanguageId = t('interface_language_invalid');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    setGlobalError('');

    if (!validateStep()) {
      return;
    }

    setCurrentStep((previousStep) => Math.min(previousStep + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setGlobalError('');
    setErrors({});
    setCurrentStep((previousStep) => Math.max(previousStep - 1, 1));
  };

  const handleSave = async () => {
    if (!nativeLanguageId || !learningLanguageId || !interfaceLanguageId) {
      return;
    }

    setIsSaving(true);
    setGlobalError('');

    try {
      await updateProfileLanguages({
        native_language_id: nativeLanguageId,
        learning_language_id: learningLanguageId,
        interface_language_id: interfaceLanguageId,
      });

      const nextLanguageCode = (languageMap[interfaceLanguageId]?.code || '').toLowerCase();
      if (nextLanguageCode) {
        await setLanguage(nextLanguageCode);
      }

      navigate('/dashboard', { replace: true });
    } catch (apiError) {
      setGlobalError(apiError.message || t('profile_settings_save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const isNextDisabled =
    isLoadingProfile ||
    (currentStep === 2 && (!nativeLanguageId || !validateLanguageId(nativeLanguageId))) ||
    (currentStep === 3 &&
      (!learningLanguageId || learningLanguageId === nativeLanguageId || !validateLanguageId(learningLanguageId))) ||
    (currentStep === 4 && (!interfaceLanguageId || !validateLanguageId(interfaceLanguageId)));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <StepCard
        title={currentStep === 1 ? t('welcome_language_journey') : t('setup_language_profile')}
        step={currentStep}
        totalSteps={TOTAL_STEPS}
      >
        {isLoadingProfile ? (
          <p className="text-gray-600">{t('loading_onboarding')}</p>
        ) : (
          <>
            {globalError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</p>}

            {currentStep === 1 && (
              <div>
                <p className="text-gray-600">{t('onboarding_intro')}</p>
                <button
                  type="button"
                  className="mt-6 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
                  onClick={handleNext}
                >
                  {t('start_setup')}
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <LanguageSelector
                id="nativeLanguage"
                label={t('native_language_question')}
                value={nativeLanguageId}
                onChange={(value) => {
                  setNativeLanguageId(value);
                  setErrors((previousErrors) => ({ ...previousErrors, nativeLanguageId: '', learningLanguageId: '' }));
                }}
                error={errors.nativeLanguageId}
                required
              />
            )}

            {currentStep === 3 && (
              <LanguageSelector
                id="learningLanguage"
                label={t('learning_language_question')}
                value={learningLanguageId}
                onChange={(value) => {
                  setLearningLanguageId(value);
                  setErrors((previousErrors) => ({ ...previousErrors, learningLanguageId: '' }));
                }}
                error={errors.learningLanguageId}
                required
              />
            )}

            {currentStep === 4 && (
              <LanguageSelector
                id="interfaceLanguage"
                label={t('interface_language')}
                value={interfaceLanguageId}
                onChange={(value) => {
                  setInterfaceLanguageId(value);
                  setErrors((previousErrors) => ({ ...previousErrors, interfaceLanguageId: '' }));
                }}
                error={errors.interfaceLanguageId}
                required
              />
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-gray-700">{t('confirm_setup')}</p>
                <ul className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                  {summaryItems.map((item) => (
                    <li key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.value}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="w-full rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? t('saving_profile') : t('start_learning')}
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleBack}
                disabled={currentStep === 1 || isSaving}
              >
                {t('back')}
              </button>

              {currentStep > 1 && currentStep < 5 && (
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  onClick={handleNext}
                  disabled={isNextDisabled}
                >
                  {t('next')}
                </button>
              )}
            </div>
          </>
        )}
      </StepCard>
    </div>
  );
};

export default Onboarding;
