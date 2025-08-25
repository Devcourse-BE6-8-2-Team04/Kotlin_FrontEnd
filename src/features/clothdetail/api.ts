export interface ClothItem {
    clothName: string;
    imageUrl: string;
    category: string;
  }
  
  export interface ExtraCloth {
    name: string;
    imageUrl: string;
  }
  
  export interface WeatherInfo {
    weather: {
      main: string;
      description: string;
      code: number;
    };
    temperature: number;
    feelsLikeTemperature: number;
    city: string;
  }
  
  export async function fetchClothDetails(
    latitude: number,
    longitude: number
  ): Promise<{
    weatherData: WeatherInfo;
    clothingItems: ClothItem[];
    extraClothingItems: ExtraCloth[];
  }> {
    const url = `/api/v1/cloth/details?latitude=${latitude}&longitude=${longitude}`;
  
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch cloth details");
    }
  
    const data = await response.json();
  
    return {
      weatherData: data.weatherInfo,
      clothingItems: data.clothList,
      extraClothingItems: data.extraCloth,
    };
  }
  