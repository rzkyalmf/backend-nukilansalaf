import type { User } from "@prisma/client";

export class UserDTO {
	private user: User;

	constructor(user: User) {
		this.user = user;
	}

	fromEntity() {
		return {
			name: this.user.name,
			id: this.user.id,
			username: this.user.username,
			email: this.user.email,
			phone: this.user.phone,
			avatar: this.user.avatar,
			isVerified: this.user.isVerified,
			onBanned: this.user.onBanned,
			role: this.user.role,
		};
	}
}
