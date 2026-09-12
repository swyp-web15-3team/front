export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface KakaoLoginResponse extends TokenPair {
  isNewUser: boolean;
}
