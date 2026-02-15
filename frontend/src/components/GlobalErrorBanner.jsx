const toneMap = {
  FORBIDDEN: 'border-amber-300 bg-amber-50 text-amber-900',
  SERVER_ERROR: 'border-red-300 bg-red-50 text-red-900',
  NETWORK_ERROR: 'border-orange-300 bg-orange-50 text-orange-900',
  HTTP_ERROR: 'border-gray-300 bg-gray-50 text-gray-900',
};

const GlobalErrorBanner = ({ error, onClose }) => {
  if (!error) {
    return null;
  }

  const tone = toneMap[error.code] || toneMap.HTTP_ERROR;

  return (
    <div className={`sticky top-0 z-50 border-b px-4 py-3 text-sm ${tone}`} role="alert">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <p>{error.message}</p>
        <button
          type="button"
          className="rounded border border-current px-2 py-1 text-xs font-semibold opacity-80 hover:opacity-100"
          onClick={onClose}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default GlobalErrorBanner;
