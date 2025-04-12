// hooks/useMinimumLoading.js
import { useState, useEffect } from 'react';

export const useMinimumLoading = (isLoading, minDuration = 1000) => {
  const [showLoading, setShowLoading] = useState(isLoading);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setShowLoading(true);
    } else if (showLoading) {
      timer = setTimeout(() => {
        setShowLoading(false);
      }, minDuration);
    }
    return () => clearTimeout(timer);
  }, [isLoading, minDuration, showLoading]);

  return showLoading;
};