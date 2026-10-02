// frontend/src/hooks/useFeatures.js
import { useAuth } from '../context/AuthContext';

export function useFeatures() {
  const { user } = useAuth();
  const features = user?.features || {};

  return {
    has: (code) => features[code] === true || user?.role === 'admin',
    hasAny: (codes = []) => codes.some((c) => features[c] === true),
    all: features,
  };
}