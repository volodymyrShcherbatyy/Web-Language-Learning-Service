import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LanguageSelector from '../../components/LanguageSelector';
import StepCard from '../../components/StepCard';
import { getLanguages, getProfile, updateProfileLanguages } from '../../services/profileApi';
import { getToken } from '../../utils/storage';

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
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
          acc[language.id] = language.name;
          return acc;
        }, {});

        setLanguageMap(lookup);
        setValidLanguageIds(Object.keys(lookup).map(Number));

        const nativeId = profile?.native_language_id || '';
        const learningId = profile?.learning_language_id || '';
        const interfaceId = profile?.interface_language_id || nativeId || '';

        setNativeLanguageId(nativeId);
        setLearningLanguageId(learningId);
        setInterfaceLanguageId(interfaceId);

        if (nativeId && learningId && interfaceId) {
          navigate('/dashboard', { replace: true });
        }
      } catch (apiError) {
        if (mounted) {
          setGlobalError(apiError.message || 'Unable to load your profile.');
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
  }, [navigate]);

  const summaryItems = useMemo(
    () => [
      { label: 'Native', value: languageMap[nativeLanguageId] || '-' },
      { label: 'Learning', value: languageMap[learningLanguageId] || '-' },
      { label: 'Interface', value: languageMap[interfaceLanguageId] || '-' },
    ],
    [interfaceLanguageId, languageMap, learningLanguageId, nativeLanguageId]
  );

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const validateLanguageId = (id) => !id || validLanguageIds.includes(id);

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 2) {
      if (!nativeLanguageId) {
        nextErrors.nativeLanguageId = 'Native language is required.';
      } else if (!validateLanguageId(nativeLanguageId)) {
        nextErrors.nativeLanguageId = 'Selected native language is invalid.';
      }
    }

    if (currentStep === 3) {
      if (!learningLanguageId) {
        nextErrors.learningLanguageId = 'Learning language is required.';
      } else if (!validateLanguageId(learningLanguageId)) {
        nextErrors.learningLanguageId = 'Selected learning language is invalid.';
      }

      if (nativeLanguageId && learningLanguageId && nativeLanguageId === learningLanguageId) {
        nextErrors.learningLanguageId = 'Native and learning languages must be different.';
      }
    }

    if (currentStep === 4) {
      if (!interfaceLanguageId) {
        nextErrors.interfaceLanguageId = 'Interface language is required.';
      } else if (!validateLanguageId(interfaceLanguageId)) {
        nextErrors.interfaceLanguageId = 'Selected interface language is invalid.';
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

  const handleNativeChange = (value) => {
    setNativeLanguageId(value);
    if (!interfaceLanguageId) {
      setInterfaceLanguageId(value);
    }
    if (learningLanguageId && value === learningLanguageId) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        learningLanguageId: 'Native and learning languages must be different.',
      }));
    } else {
      setErrors((previousErrors) => ({ ...previousErrors, nativeLanguageId: '', learningLanguageId: '' }));
    }
  };

  const handleSave = async () => {
    const hasInvalidSelection =
      !nativeLanguageId ||
      !learningLanguageId ||
      !interfaceLanguageId ||
      nativeLanguageId === learningLanguageId ||
      !validateLanguageId(nativeLanguageId) ||
      !validateLanguageId(learningLanguageId) ||
      !validateLanguageId(interfaceLanguageId);

    if (hasInvalidSelection) {
      setErrors({
        nativeLanguageId: !nativeLanguageId
          ? 'Native language is required.'
          : !validateLanguageId(nativeLanguageId)
            ? 'Selected native language is invalid.'
            : '',
        learningLanguageId:
          !learningLanguageId
            ? 'Learning language is required.'
            : nativeLanguageId === learningLanguageId
              ? 'Native and learning languages must be different.'
              : !validateLanguageId(learningLanguageId)
                ? 'Selected learning language is invalid.'
                : '',
        interfaceLanguageId: !interfaceLanguageId
          ? 'Interface language is required.'
          : !validateLanguageId(interfaceLanguageId)
            ? 'Selected interface language is invalid.'
            : '',
      });
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
      navigate('/dashboard', { replace: true });
    } catch (apiError) {
      setGlobalError(apiError.message || 'Could not save your profile settings.');
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
        title={currentStep === 1 ? 'Welcome to your language journey' : 'Set up your language profile'}
        step={currentStep}
        totalSteps={TOTAL_STEPS}
      >
        {isLoadingProfile ? (
          <p className="text-gray-600">Loading onboarding data...</p>
        ) : (
          <>
            {globalError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</p>}

            {currentStep === 1 && (
              <div>
                <p className="text-gray-600">
                  Let&apos;s personalize your learning experience by choosing your language preferences.
                </p>
                <button
                  type="button"
                  className="mt-6 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
                  onClick={handleNext}
                >
                  Start setup
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <LanguageSelector
                id="nativeLanguage"
                label="What is your native language?"
                value={nativeLanguageId}
                onChange={handleNativeChange}
                error={errors.nativeLanguageId}
                required
              />
            )}

            {currentStep === 3 && (
              <LanguageSelector
                id="learningLanguage"
                label="Which language do you want to learn?"
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
                label="Interface language"
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
                <p className="text-gray-700">Confirm your setup before starting your learning journey:</p>
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
                  {isSaving ? 'Saving profile...' : 'Start Learning'}
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
                Back
              </button>

              {currentStep > 1 && currentStep < 5 && (
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  onClick={handleNext}
                  disabled={isNextDisabled}
                >
                  Next
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
