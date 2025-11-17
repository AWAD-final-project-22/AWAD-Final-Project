export class User {
    id: string;
    email: string;
    password?: string;
    name?: string;
    provider: 'local' | 'google';
    refreshToken?: string;
}