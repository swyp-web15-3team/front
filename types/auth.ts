export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface KakaoLoginResponse extends TokenPair {
  isNewUser: boolean;
}
