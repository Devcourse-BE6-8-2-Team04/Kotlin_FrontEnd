export interface Cloth {
  id: number;
  clothName: string;
  imageUrl: string;
  category: string;
  maxFeelsLike: number;
  minFeelsLike: number;
}

export interface ExtraCloth {
  id: number;
  clothName: string;
  imageUrl: string;
  weather: string;
}

export interface ClothApiResponse {
  clothes: {
    [category: string]: Cloth[];
  };
  extraClothes: {
    EXTRA: ExtraCloth[];
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
