import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'crypto';

import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { ITokenService } from '../../ports/token.port';
import { IPasswordService } from '../../ports/password.port';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { EmailAlreadyExistsError } from '../../errors/email-already-exists.error';

export class GoogleSignInUseCase {
  private oauthClient: OAuth2Client;
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordService: IPasswordService,
    //googleClientId: string,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
    }
    this.oauthClient = new OAuth2Client(clientId);
  }

  async execute(idToken: string) {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new InvalidCredentialsError('Invalid Google ID token');
    }

    if (!payload.email || !payload.email_verified) {
      throw new InvalidCredentialsError('Email not verified by Google');
    }

    const email = payload.email;
    const name = payload.name ?? null;
    const googleId = payload.sub;

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      const u = new User();
      u.id = randomUUID();
      u.email = email;
      u.name = name ?? undefined;
      u.provider = 'google';

      user = await this.userRepository.create(u);
    } else if (user.provider !== 'google' && user.provider) {
      throw new EmailAlreadyExistsError(
        `User already registered with ${user.provider}`,
      );
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const refreshHash = await this.passwordService.hashPassword(refreshToken);
    await this.userRepository.updateRefreshToken(user.id, refreshHash);

    return { accessToken, refreshToken };
  }
}
