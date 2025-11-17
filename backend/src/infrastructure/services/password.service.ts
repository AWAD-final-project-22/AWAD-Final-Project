import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IPasswordService } from '../../application/ports/password.port';

@Injectable()
export class PasswordService implements IPasswordService {
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}