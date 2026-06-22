export type Photo = {
  id: string;
  title: string;
  src: string;
  alt: string;
  trip: string;
  tripLabel: string;
  place: string;
  placeLabel: string;
  dateTaken: string;
  tags: string[];
  caption?: string;
  embedding?: number[];
};
