export type Photo = {
  id: string;
  src: string;
  alt: string;
  place: string;
  placeLabel: string;
  dateTaken: string;
  caption?: string;
  embedding?: number[];
  country: string;
  countryLabel: string;
};
