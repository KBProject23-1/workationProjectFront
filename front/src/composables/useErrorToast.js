import { toast } from 'vue-sonner';

export function useErrorToast() {
  function showError(err, fallbackMessage) {
    toast.error(err?.message || fallbackMessage);
  }

  return { showError };
}
