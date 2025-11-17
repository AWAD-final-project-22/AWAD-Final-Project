import { randomUUID } from 'crypto';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import type { IPasswordService } from '../../../application/ports/password.port';
import { EmailAlreadyExistsError } from '../../errors/email-already-exists.error';

export class RegisterUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly passwordService: IPasswordService,
	) {}

	async execute(email: string, password: string, name?: string) {
		const existing = await this.userRepository.findByEmail(email);
		if (existing) {
			throw new EmailAlreadyExistsError();
		}

		const passwordHash = await this.passwordService.hashPassword(password);

		const user = new User();
		user.id = randomUUID();
		user.email = email;
		user.password = passwordHash;
		user.name = name ?? undefined;
		user.provider = 'local';

		const created = await this.userRepository.create(user);

		return {
			id: created.id,
			email: created.email,
			name: created.name,
			provider: created.provider,
		};
	}
}

