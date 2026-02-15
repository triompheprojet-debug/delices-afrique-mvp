import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 animate-pulse text-sm">Chargement...</p>
    </div>
  );
};

export default LoadingState;
