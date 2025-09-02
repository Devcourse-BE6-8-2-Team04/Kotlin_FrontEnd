export interface SearchFiltersType {
    location?: string;
    feelsLikeTemperature?: number;
    month?: number;
    email?: string;
}

export type ClothName =
  | "T_SHIRT"
  | "SWEATSHIRT"
  | "HOODIE"
  | "SHIRT"
  | "DRESS_SHIRT"
  | "BLOUSE"
  | "SWEATER"
  | "CARDIGAN"
  | "COAT"
  | "JACKET"
  | "LEATHER_JACKET"
  | "DENIM_JACKET"
  | "BLAZER"
  | "PADDING"
  | "VEST"
  | "WINDBREAKER"
  | "FUNCTIONAL_T_SHIRT"
  | "JEANS"
  | "SLACKS"
  | "SHORTS"
  | "SKIRT"
  | "JOGGER_PANTS"
  | "TRACK_PANTS"
  | "LEGGINGS"
  | "CARGO_PANTS"
  | "CORDUROY_PANTS"
  | "CHINOS"
  | "SKI_PANTS"
  | "SNEAKERS"
  | "ATHLETIC_SHOES"
  | "FLATS"
  | "HEELS"
  | "LOAFERS"
  | "SLIPPERS"
  | "LEATHER_BOOTS"
  | "FUR_BOOTS"
  | "RAIN_BOOTS"
  | "SANDALS"
  | "OXFORDS"
  | "HIKING_SHOES"
  | "ANKLE_BOOTS"
  | "HAT"
  | "CAP"
  | "BEANIE"
  | "SCARF"
  | "GLOVES"
  | "BELT"
  | "BAG"
  | "BACKPACK"
  | "CROSSBODY_BAG"
  | "SUNGLASSES"
  | "UMBRELLA"
  | "MASK";

export type Style =
  | "CASUAL_DAILY"
  | "FORMAL_OFFICE"
  | "OUTDOOR"
  | "DATE_LOOK"
  | "EXTRA"
  | undefined;

export type Material =
  | "COTTON"
  | "POLYESTER"
  | "WOOL"
  | "LINEN"
  | "NYLON"
  | "DENIM"
  | "LEATHER"
  | "FLEECE"
  | "SILK"
  | "CASHMERE"
  | "CORDUROY"
  | undefined;

export type Category =
  | "TOP"
  | "BOTTOM"
  | "SHOES"
  | "EXTRA"