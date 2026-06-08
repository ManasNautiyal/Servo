import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">Loading Servo...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-darkBg">
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full">
      {spinnerElement}
    </div>
  );
};

export default LoadingSpinner;
