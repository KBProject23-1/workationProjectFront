const accommodationImageModules = import.meta.glob(
  '../assets/images/merchants/accommodation/*.jpeg',
  { eager: true, import: 'default' },
);
const activityImageModules = import.meta.glob(
  '../assets/images/merchants/activity/*.jpeg',
  { eager: true, import: 'default' },
);
const officeImageModules = import.meta.glob(
  '../assets/images/merchants/office/*.jpeg',
  { eager: true, import: 'default' },
);
const restaurantImageModules = import.meta.glob(
  '../assets/images/merchants/restaurant/*.jpeg',
  { eager: true, import: 'default' },
);

const sortedImages = (modules) => Object.entries(modules)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([, imageUrl]) => imageUrl);

const accommodationImages = sortedImages(accommodationImageModules);
const activityImages = sortedImages(activityImageModules);
const officeImages = sortedImages(officeImageModules);
const restaurantImages = sortedImages(restaurantImageModules);

const findActivityImage = (fileName) => Object.entries(activityImageModules)
  .find(([path]) => path.endsWith(`/${fileName}`))?.[1];

const ACTIVITY_TYPE_IMAGES = {
  WATER_SPORTS: findActivityImage('activity-water-default.jpeg'),
  LAND_SPORTS: findActivityImage('activity-land-default.jpeg'),
  RURAL_EXPERIENCE: findActivityImage('activity-rural-experience-default.jpeg'),
  NATURAL_PARK: findActivityImage('activity-natural-park-default.jpeg'),
  MOUNTAIN_SCENERY: findActivityImage('activity-mountain-scenery-default.jpeg'),
  WATER_SENERY: findActivityImage('activity-water-scenery-default.jpeg'),
};

const CATEGORY_IMAGES = {
  ACCOMMODATION: accommodationImages,
  OFFICE: officeImages,
  RESTAURANT: restaurantImages,
  ACTIVITY: activityImages,
};

const stableIndex = (seed, length) => {
  if (!length) return 0;

  const text = String(seed ?? '');
  let hash = 0;
  for (const character of text) {
    hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  }
  return hash % length;
};

export const getMerchantDefaultImage = ({
  category,
  merchantId,
  activityType,
} = {}) => {
  if (category === 'ACTIVITY' && ACTIVITY_TYPE_IMAGES[activityType]) {
    return ACTIVITY_TYPE_IMAGES[activityType];
  }

  const images = CATEGORY_IMAGES[category] ?? accommodationImages;
  return images[stableIndex(merchantId, images.length)] ?? '';
};
