let remainingAttempts = 0;

export async function retry(operation, options = {}) {
  const attempts = options.attempts ?? 3;
  if (remainingAttempts === 0) remainingAttempts = attempts;
  let lastError;
  while (remainingAttempts > 0) {
    const attempt = attempts - remainingAttempts;
    remainingAttempts -= 1;
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
