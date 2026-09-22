export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface KakaoLoginResponse extends TokenPair {
  isNewUser: boolean;
}

export interface SignUpRequest {
  ageOver14Agreed: boolean;
  termsOfServiceAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
}

export type SignUpResponse = TokenPair;
