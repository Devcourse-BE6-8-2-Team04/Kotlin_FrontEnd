// 이미지 경로 상수
export const BACKGROUNDS = {
  THUNDER_LIGHT: '/images/bg-thunderstorm-light.png',
  THUNDER: '/images/bg-thunderstorm.png',
  THUNDER_HEAVY: '/images/bg-thunderstorm-heavy.png',
  THUNDER_RAGGED: '/images/bg-thunderstorm-ragged.png',

  RAIN_LIGHT: '/images/bg-rain-light.png',
  RAIN_HEAVY: '/images/bg-rain-heavy.png',
  RAIN_SHOWER: '/images/bg-rain-shower.png',
  RAIN_FREEZING: '/images/bg-rain-freezing.png',

  SNOW: '/images/bg-snow.png',
  SNOW_LIGHT: '/images/bg-snow-light.png',
  SNOW_HEAVY: '/images/bg-snow-heavy.png',
  SNOW_SLEET: '/images/bg-snow-sleet.png',

  ATMOSPHERE_FOG: '/images/bg-atmosphere-fog.png',
  ATMOSPHERE_DUST: '/images/bg-atmosphere-dust.png',
  ATMOSPHERE_VOLCANIC: '/images/bg-atmosphere-volcanic.png',
  ATMOSPHERE_SQUALLS: '/images/bg-atmosphere-squalls.png',
  ATMOSPHERE_TORNADO: '/images/bg-atmosphere-tornado.png',

  CLEAR: '/images/bg-clear.png',
  CLOUD: '/images/bg-cloud.png',
  CLOUD_OVERCAST: '/images/bg-cloud-overcast.png',

  DEFAULT: '/images/bg-default.png',
} as const;

// 날씨 enum에 따른 배경 이미지 매핑
export const weatherBackgroundMap: Record<string, keyof typeof BACKGROUNDS> = {
  // Thunderstorm
  THUNDERSTORM_LIGHT_RAIN: 'THUNDER_LIGHT',
  THUNDERSTORM_RAIN: 'THUNDER',
  THUNDERSTORM_HEAVY_RAIN: 'THUNDER_HEAVY',
  LIGHT_THUNDERSTORM: 'THUNDER_LIGHT',
  THUNDERSTORM: 'THUNDER',
  HEAVY_THUNDERSTORM: 'THUNDER_HEAVY',
  RAGGED_THUNDERSTORM: 'THUNDER_RAGGED',
  THUNDERSTORM_LIGHT_DRIZZLE: 'THUNDER_LIGHT',
  THUNDERSTORM_DRIZZLE: 'THUNDER',
  THUNDERSTORM_HEAVY_DRIZZLE: 'THUNDER_HEAVY',

  // Drizzle
  LIGHT_DRIZZLE: 'RAIN_LIGHT',
  DRIZZLE: 'RAIN_LIGHT',
  HEAVY_DRIZZLE: 'RAIN_LIGHT',
  LIGHT_DRIZZLE_RAIN: 'RAIN_LIGHT',
  DRIZZLE_RAIN: 'RAIN_LIGHT',
  HEAVY_DRIZZLE_RAIN: 'RAIN_HEAVY',
  SHOWER_RAIN_AND_DRIZZLE: 'RAIN_SHOWER',
  HEAVY_SHOWER_RAIN_AND_DRIZZLE: 'RAIN_SHOWER',
  SHOWER_DRIZZLE: 'RAIN_SHOWER',

  // Rain
  LIGHT_RAIN: 'RAIN_LIGHT',
  MODERATE_RAIN: 'RAIN_LIGHT',
  HEAVY_RAIN: 'RAIN_HEAVY',
  VERY_HEAVY_RAIN: 'RAIN_HEAVY',
  EXTREME_RAIN: 'RAIN_HEAVY',
  FREEZING_RAIN: 'RAIN_FREEZING',
  LIGHT_SHOWER_RAIN: 'RAIN_SHOWER',
  SHOWER_RAIN: 'RAIN_SHOWER',
  HEAVY_SHOWER_RAIN: 'RAIN_SHOWER',
  RAGGED_SHOWER_RAIN: 'RAIN_SHOWER',

  // Snow
  LIGHT_SNOW: 'SNOW_LIGHT',
  SNOW: 'SNOW',
  HEAVY_SNOW: 'SNOW_HEAVY',
  SLEET: 'SNOW_SLEET',
  LIGHT_SHOWER_SLEET: 'SNOW_SLEET',
  SHOWER_SLEET: 'SNOW_SLEET',
  LIGHT_RAIN_AND_SNOW: 'SNOW_LIGHT',
  RAIN_AND_SNOW: 'SNOW',
  LIGHT_SHOWER_SNOW: 'SNOW_LIGHT',
  SHOWER_SNOW: 'SNOW',
  HEAVY_SHOWER_SNOW: 'SNOW_HEAVY',

  // Atmosphere
  MIST: 'ATMOSPHERE_FOG',
  SMOKE: 'ATMOSPHERE_FOG',
  HAZE: 'ATMOSPHERE_FOG',
  SAND_DUST_WHIRLS: 'ATMOSPHERE_DUST',
  FOG: 'ATMOSPHERE_FOG',
  SAND: 'ATMOSPHERE_DUST',
  DUST: 'ATMOSPHERE_DUST',
  VOLCANIC_ASH: 'ATMOSPHERE_VOLCANIC',
  SQUALLS: 'ATMOSPHERE_SQUALLS',
  TORNADO: 'ATMOSPHERE_TORNADO',

  // Clear
  CLEAR_SKY: 'CLEAR',

  // Cloud
  FEW_CLOUDS: 'CLOUD',
  SCATTERED_CLOUDS: 'CLOUD',
  BROKEN_CLOUDS: 'CLOUD',
  OVERCAST_CLOUDS: 'CLOUD_OVERCAST',

  // 폭염
  HEAT_WAVE: 'CLEAR',
};

// 반환 함수
export function getBackgroundImage(weather: string): string {
  const key = weatherBackgroundMap[weather] ?? 'DEFAULT';
  return BACKGROUNDS[key];
}
