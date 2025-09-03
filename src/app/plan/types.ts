export interface Cloth {
  id: number;
  clothName: string;
  imageUrl: string;
  category: string;
  style: string;
  material: string | null;
  maxFeelsLike: number | null;
  minFeelsLike: number | null;
  createDate: string;
  modifyDate: string;
}

export interface ClothApiResponse {
  recommendedOutfits: {
    [category: string]: Cloth[];
  };
  notRecommendedOutfits: {
    [category: string]: Cloth[];
  };
}

export interface Weather {
  id: number;
  weather: string;
  description: string;
  dailyTemperatureGap: number;
  feelsLikeTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  pop: number;
  rain: number;
  snow: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  uvi: number;
  location: string;
  date: string;
}

export type WeatherApiResponse = Weather[];

export interface Geo {
  name: string;
  country: string;
  lat: number;
  lon: number;
  localName: string;
}

export type GeoApiResponse = Geo[];
