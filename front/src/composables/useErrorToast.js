import { ref } from 'vue';

export function useErrorToast(duration = 3000) {
  const errorMessage = ref('');
  let timer = null;

  function showError(err, fallbackMessage) {
    errorMessage.value = err?.message || fallbackMessage;
    clearTimeout(timer);
    timer = setTimeout(() => {
      errorMessage.value = '';
    }, duration);
  }

  return { errorMessage, showError };
}
