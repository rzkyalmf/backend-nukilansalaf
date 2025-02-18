import type { User } from "@prisma/client";

export class UserDTO {
	private user: User;

	constructor(user: User) {
		this.user = user;
	}

	fromEntity() {
		return {
			id: this.user.id,
			name: this.user.name,
			email: this.user.email,
			avatar: this.user.avatar,
		};
	}
}
