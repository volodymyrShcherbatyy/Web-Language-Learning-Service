import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LocalizationContext from '../context/LocalizationContext';
import { getLocalization } from '../services/localizationApi';
import { getProfile } from '../services/profileApi';
import { getToken } from '../utils/storage';

const DEFAULT_LANGUAGE = 'en';

const DEFAULT_ENGLISH_TRANSLATIONS = {
  dashboard: 'Dashboard',
  dashboard_subtitle: 'You are ready to continue your learning journey.',
  start_lesson: 'Start lesson',
  edit_profile_settings: 'Edit profile settings',
  log_out: 'Log out',
  loading: 'Loading...',
  login_title: 'Welcome back',
  login: 'Login',
  login_error: 'Could not log in with these credentials.',
  email: 'Email',
  password: 'Password',
  logging_in: 'Logging in...',
  need_account: 'Need an account?',
  register: 'Register',
  register_title: 'Create your account',
  register_error: 'Could not register this account.',
  confirm_password: 'Confirm password',
  creating_account: 'Creating account...',
  already_have_account: 'Already have an account?',
  password_mismatch: 'Passwords do not match.',
  select_language: 'Select a language',
  loading_languages: 'Loading languages...',
  load_languages_error: 'Could not load languages.',
  profile_language_settings: 'Profile language settings',
  current_setup: 'Current setup',
  interface: 'Interface',
  native_language: 'Native language',
  learning_language: 'Learning language',
  interface_language: 'Interface language',
  save_changes: 'Save changes',
  saving_changes: 'Saving changes...',
  profile_settings_saved: 'Profile settings updated successfully.',
  profile_settings_load_error: 'Unable to load your profile settings.',
  profile_settings_save_error: 'Could not save profile settings.',
  native_language_required: 'Native language is required.',
  native_language_invalid: 'Selected native language is invalid.',
  learning_language_required: 'Learning language is required.',
  learning_language_invalid: 'Selected learning language is invalid.',
  interface_language_required: 'Interface language is required.',
  interface_language_invalid: 'Selected interface language is invalid.',
  languages_must_differ: 'Native and learning languages must be different.',
  welcome_language_journey: 'Welcome to your language journey',
  setup_language_profile: 'Set up your language profile',
  loading_onboarding: 'Loading onboarding data...',
  onboarding_intro: "Let's personalize your learning experience by choosing your language preferences.",
  start_setup: 'Start setup',
  native_language_question: 'What is your native language?',
  learning_language_question: 'Which language do you want to learn?',
  confirm_setup: 'Confirm your setup before starting your learning journey:',
  saving_profile: 'Saving profile...',
  start_learning: 'Start Learning',
  native: 'Native',
  learning: 'Learning',
  back: 'Back',
  next: 'Next',
  step_of: 'Step {step} of {total}',
  profile_setup: 'Profile setup',
  exercise_progress: 'Exercise {current}/{total}',
  retry_session: 'Retry session',
  submitting: 'Submitting...',
  check_answer: 'Check answer',
  correct: 'Correct!',
  wrong: 'Wrong',
  lesson_complete: 'Lesson Complete 🎉',
  lesson_complete_subtitle: 'Great job! Here is your progress.',
  summary_load_error: 'Unable to load lesson summary right now.',
  summary_empty: 'No session data found for your latest lesson.',
  correct_answers: 'Correct Answers',
  wrong_answers: 'Wrong Answers',
  words_learned: 'Words Learned',
  mistakes_review: 'Mistakes Review',
  no_mistakes: 'No mistakes this time — perfect lesson!',
  prompt: 'Prompt',
  your_answer: 'Your answer',
  no_answer_provided: 'No answer provided',
  correct_answer: 'Correct answer',
  lesson_accuracy: 'Lesson accuracy',
  accuracy: 'Accuracy',
  start_next_lesson: 'Start Next Lesson',
  go_to_dashboard: 'Go to Dashboard',
  profile_load_error: 'Unable to load your profile.',
};

const LocalizationProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState(DEFAULT_ENGLISH_TRANSLATIONS);
  const [englishTranslations, setEnglishTranslations] = useState(DEFAULT_ENGLISH_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const cacheRef = useRef({ [DEFAULT_LANGUAGE]: DEFAULT_ENGLISH_TRANSLATIONS });

  const fetchLanguage = useCallback(async (langCode) => {
    if (!langCode) {
      return {};
    }

    if (cacheRef.current[langCode]) {
      return cacheRef.current[langCode];
    }

    const dictionary = await getLocalization(langCode);
    const safeDictionary = dictionary && typeof dictionary === 'object' ? dictionary : {};
    cacheRef.current[langCode] = safeDictionary;
    return safeDictionary;
  }, []);

  const setLanguage = useCallback(
    async (nextLanguage) => {
      const normalizedLanguage = (nextLanguage || DEFAULT_LANGUAGE).toLowerCase();
      setError('');
      setIsLoading(true);

      try {
        const dictionary = await fetchLanguage(normalizedLanguage);
        setTranslations(dictionary);
        setLanguageState(normalizedLanguage);
      } catch (requestError) {
        setError(requestError.message || 'Unable to change interface language.');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLanguage]
  );

  useEffect(() => {
    let mounted = true;

    const initializeLocalization = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [fallbackDictionary, profile] = await Promise.all([fetchLanguage(DEFAULT_LANGUAGE), getProfile()]);

        if (!mounted) {
          return;
        }

        const mergedFallback = { ...DEFAULT_ENGLISH_TRANSLATIONS, ...fallbackDictionary };
        cacheRef.current[DEFAULT_LANGUAGE] = mergedFallback;
        setEnglishTranslations(mergedFallback);

        const interfaceCode = (profile?.interface_language?.code || DEFAULT_LANGUAGE).toLowerCase();
        const languageDictionary = await fetchLanguage(interfaceCode);

        if (!mounted) {
          return;
        }

        setLanguageState(interfaceCode);
        setTranslations(languageDictionary);
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(requestError.message || 'Unable to load localization settings.');
        setTranslations(DEFAULT_ENGLISH_TRANSLATIONS);
        setEnglishTranslations(DEFAULT_ENGLISH_TRANSLATIONS);
        setLanguageState(DEFAULT_LANGUAGE);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeLocalization();

    return () => {
      mounted = false;
    };
  }, [fetchLanguage]);

  const translate = useCallback(
    (key) => {
      if (!key) {
        return '';
      }

      return translations[key] || englishTranslations[key] || key;
    },
    [englishTranslations, translations]
  );

  const value = useMemo(
    () => ({
      translations,
      language,
      setLanguage,
      translate,
      isLoading,
      error,
    }),
    [error, isLoading, language, setLanguage, translate, translations]
  );

  if (isLoading && getToken() && !Object.keys(translations).length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" aria-label="Loading localization" />
      </div>
    );
  }

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export default LocalizationProvider;
