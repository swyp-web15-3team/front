export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface KakaoLoginResponse extends TokenPair {
  isNewUser: boolean;
}

export interface SignUpRequest {
  termsAgreed: string[];
}

export type SignUpResponse = TokenPair;
