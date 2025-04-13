const isDebug = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDebug) console.log(...args);
  },
  error: (...args) => {
    if (isDebug) console.error(...args);
  },
  warn: (...args) => {
    if (isDebug) console.warn(...args);
  },
};