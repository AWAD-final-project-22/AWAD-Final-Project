export class EmailAlreadyExistsError extends Error {
	constructor(message = 'Email already exists') {
		super(message);
		this.name = 'EmailAlreadyExistsError';
	}
}

