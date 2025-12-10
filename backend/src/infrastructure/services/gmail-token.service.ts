import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IEncryptionService } from '../../application/ports/encryption.port';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GmailTokenService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly encryptionService: IEncryptionService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get valid access token with auto-refresh
   * Same logic as BaseGmailUseCase.getAccessToken()
   */
  async getAccessToken(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or not linked with Google');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const tokenExpiry = user.googleTokenExpiry;
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (!tokenExpiry || tokenExpiry.getTime() - now.getTime() < bufferTime) {
      // Token expired → refresh
      await this.refreshGoogleToken(userId);
      const updatedUser = await this.userRepository.findById(userId);
      if (!updatedUser || !updatedUser.googleAccessToken) {
        throw new Error('Failed to refresh token');
      }
      return this.encryptionService.decrypt(updatedUser.googleAccessToken);
    }

    // Token still valid
    return this.encryptionService.decrypt(user.googleAccessToken);
  }

  private async refreshGoogleToken(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.googleRefreshToken) {
      throw new Error('No refresh token available. Please re-authenticate.');
    }

    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth credentials');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const decryptedRefreshToken = this.encryptionService.decrypt(user.googleRefreshToken);
    oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      if (credentials.access_token) {
        user.googleAccessToken = this.encryptionService.encrypt(credentials.access_token);
      }

      if (credentials.refresh_token) {
        user.googleRefreshToken = this.encryptionService.encrypt(credentials.refresh_token);
      }

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
