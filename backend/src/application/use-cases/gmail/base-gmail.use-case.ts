import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';
import { google } from 'googleapis';

export abstract class BaseGmailUseCase {
  constructor(
    protected readonly userRepository: IUserRepository,
    protected readonly gmailService: IGmailService,
    protected readonly encryptionService: IEncryptionService,
  ) {}

  /**
   * Helper method to get and decrypt user's access token
   * Automatically refreshes the token if expired
   * @param userId - The user ID
   * @returns Decrypted and valid access token
   * @throws Error if user not found or not linked with Google
   */
  protected async getAccessToken(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or not linked with Google');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const tokenExpiry = user.googleTokenExpiry;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (!tokenExpiry || tokenExpiry.getTime() - now.getTime() < bufferTime) {
      // Token is expired or about to expire, refresh it
      await this.refreshGoogleToken(userId);
      // Fetch updated user data
      const updatedUser = await this.userRepository.findById(userId);
      if (!updatedUser || !updatedUser.googleAccessToken) {
        throw new Error('Failed to refresh Google token');
      }
      return this.encryptionService.decrypt(updatedUser.googleAccessToken);
    }

    return this.encryptionService.decrypt(user.googleAccessToken);
  }

  /**
   * Refresh Google access token using refresh token
   * @param userId - The user ID
   * @throws Error if refresh token is missing or refresh fails
   */
  private async refreshGoogleToken(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.googleRefreshToken) {
      throw new Error('Google refresh token not found');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth credentials');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    // Set refresh token
    const decryptedRefreshToken = this.encryptionService.decrypt(
      user.googleRefreshToken,
    );
    oauth2Client.setCredentials({
      refresh_token: decryptedRefreshToken,
    });

    try {
      // Refresh the token
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update user with new tokens
      if (credentials.access_token) {
        user.googleAccessToken = this.encryptionService.encrypt(
          credentials.access_token,
        );
      }

      // Update refresh token if Google provides a new one (rare but possible)
      if (credentials.refresh_token) {
        user.googleRefreshToken = this.encryptionService.encrypt(
          credentials.refresh_token,
        );
      }

      // Update expiry time
      if (credentials.expiry_date) {
        user.googleTokenExpiry = new Date(credentials.expiry_date);
      }

      await this.userRepository.update(user);
    } catch (error) {
      throw new Error(
        `Failed to refresh Google token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
