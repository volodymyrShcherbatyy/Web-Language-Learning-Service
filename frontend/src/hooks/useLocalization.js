import { useContext } from 'react';
import LocalizationContext from '../context/LocalizationContext';

const useLocalization = () => {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used inside LocalizationProvider.');
  }

  return {
    t: context.translate,
    language: context.language,
    setLanguage: context.setLanguage,
    isLocalizationLoading: context.isLoading,
    localizationError: context.error,
  };
};

export default useLocalization;
