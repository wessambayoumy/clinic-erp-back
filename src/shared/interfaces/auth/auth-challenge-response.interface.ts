/** Public response returned after an OTP is sent for an account action. */
export interface IAuthChallengeResponse {
  challengeId: string;
  expiresInSeconds: number;
  message: string;
}
