import { Injectable } from '@nestjs/common';
import { IEncryptionService } from '../../application/ports/encryption.port';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionServiceImpl implements IEncryptionService {
  private readonly key: string;
  constructor() {
    this.key = process.env.ENCRYPTION_KEY || '';
    if (!this.key) {
      throw new Error('ENCRYPTION_KEY is not set');
    }
  }
  encrypt(text: string): string {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }
  decrypt(cipherText: string): string {
    if (!cipherText) return cipherText;
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt data: ' + error.message);
    }
  }
}
