export interface ExchangeRate {
  currency: string;
  rate: number;
}

export interface ExchangeRatesResponse {
  data: {
    date: string;
    rates: ExchangeRate[];
  };
}
