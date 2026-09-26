export interface Product {
  id?: number;
  imageUrl: string;
  name: string;
  originalName: string;
  discountRate: number;
  krPrice: number;
  jpPrice: number;
  jpPriceYen?: number;
  volumeMl?: number;
}
