// 캐릭터 이미지 경로 상수
export const CHARACTERS = {
  HOT_CLEAR: 'https://i.postimg.cc/vmTDYmkz/image.png',
  HOT_CLOUDY: 'https://i.postimg.cc/4xLNSgyh/image.png',
  HOT_RAINY: 'https://i.postimg.cc/HnwkZ88p/image.png',
  
  NORMAL_CLEAR: 'https://i.postimg.cc/qB3h6zRD/image.png',
  NORMAL_CLOUDY: 'https://i.postimg.cc/ZnpCGD2z/image.png',
  NORMAL_RAINY: 'https://i.postimg.cc/027wFb1K/image.png',
  
  COLD_CLEAR: 'https://i.postimg.cc/VNQX5n9R/image.png',
  COLD_CLOUDY: 'https://i.postimg.cc/65PrJDyF/image.png',
  COLD_RAINY: 'https://i.postimg.cc/3wXmGNnH/image.png',
  
  DEFAULT: 'https://i.postimg.cc/yxHVZ6Q2/image.png',  
} as const;

export type CharacterKey = keyof typeof CHARACTERS;

// 기온 그룹 판별 (HOT / NORMAL / COLD)
function getTempGroup(temp: number): 'HOT' | 'NORMAL' | 'COLD' {
  if (temp >= 28) return 'HOT';
  if (temp <= 10) return 'COLD';
  return 'NORMAL';
}

// 날씨 그룹 판별 (CLEAR / CLOUDY / RAINY)
function getWeatherGroup(weather: string): 'CLEAR' | 'CLOUDY' | 'RAINY' {
  const upper = weather.toUpperCase();

  const rainyKeywords = [
    'RAIN', 'SNOW', 'DRIZZLE', 'FREEZING',
    'MIST', 'FOG', 'THUNDER', 'SQUALL', 'TORNADO',
  ];
  const cloudyKeywords = [
    'CLOUD', 'OVERCAST', 'DUST', 'HAZE', 'SMOKE', 'SAND', 'ASH',
  ];

  if (rainyKeywords.some(k => upper.includes(k))) return 'RAINY';
  if (cloudyKeywords.some(k => upper.includes(k))) return 'CLOUDY';
  return 'CLEAR';
}

// 캐릭터 이미지 반환
export function getCharacterImage(temp: number, weather: string): string {
  const tempGroup = getTempGroup(temp);
  const weatherGroup = getWeatherGroup(weather);

  const key = `${tempGroup}_${weatherGroup}` as CharacterKey;
  return CHARACTERS[key] ?? CHARACTERS.DEFAULT;
}
