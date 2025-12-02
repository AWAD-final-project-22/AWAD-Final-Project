import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';

export abstract class BaseGmailUseCase {
  constructor(
    protected readonly userRepository: IUserRepository,
    protected readonly gmailService: IGmailService,
    protected readonly encryptionService: IEncryptionService,
  ) {}

  /**
   * Helper method to get and decrypt user's access token
   * @param userId - The user ID
   * @returns Decrypted access token
   * @throws Error if user not found or not linked with Google
   */
  protected async getAccessToken(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or not linked with Google');
    }

    return this.encryptionService.decrypt(user.googleAccessToken);
  }
}
