export class User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  provider: 'local' | 'google';
  refreshToken?: string;

  constructor(params?: Partial<User>) {
    if (params) {
      this.id = params.id!;
      this.email = params.email!;
      this.password = params.password;
      this.name = params.name;
      this.provider = params.provider!;
      this.refreshToken = params.refreshToken;
    }
  }

  setRefreshToken(hash: string) {
    this.refreshToken = hash;
  }

  isGoogleAccount() {
    return this.provider === 'google';
  }
}
