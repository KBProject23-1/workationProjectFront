import { computed, ref, toValue, watch } from 'vue';
import { getMerchantDefaultImage } from '@/config/merchantDefaultImages';

export function useMerchantImage({
  thumbnailUrl,
  category,
  merchantId,
  activityType,
}) {
  const imageLoadFailed = ref(false);

  const defaultImageSource = computed(() =>
    getMerchantDefaultImage({
      category: toValue(category),
      merchantId: toValue(merchantId),
      activityType: toValue(activityType),
    }),
  );

  const imageSource = computed(() => {
    const remoteImageSource = toValue(thumbnailUrl);
    return remoteImageSource && !imageLoadFailed.value
      ? remoteImageSource
      : defaultImageSource.value;
  });

  // 원격 이미지 및 기본 이미지 전환 상태 초기화
  function resetImageError() {
    imageLoadFailed.value = false;
  }

  function handleImageError() {
    imageLoadFailed.value = true;
  }

  watch(
    [
      () => toValue(thumbnailUrl),
      () => toValue(category),
      () => toValue(merchantId),
      () => toValue(activityType),
    ],
    resetImageError,
  );

  return {
    imageSource,
    handleImageError,
    resetImageError,
  };
}
