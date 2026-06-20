import toast from 'react-hot-toast';

export function getErrorMessage(err: any): string | null {
  if (!err) return null;
  // Axios-like response
  if (err.response && err.response.data) {
    if (typeof err.response.data === 'string') return err.response.data;
    if (err.response.data.message) return String(err.response.data.message);
  }
  if (err.message) return String(err.message);
  return String(err);
}

export function showError(err: any, fallback = 'Something went wrong') {
  const msg = getErrorMessage(err) || fallback;
  try {
    toast.error(msg);
  } catch (e) {
    // swallow
  }
  // still log for debugging
  // eslint-disable-next-line no-console
  try {
    // log the user-facing message for quick inspection
    // eslint-disable-next-line no-console
    console.log(msg);
  } catch (e) {
    // ignore
  }
  // log full error details
  // eslint-disable-next-line no-console
  console.error(err);
}

export function showSuccess(message: string) {
  try {
    toast.success(message);
  } catch (e) {
    // swallow
  }
}
