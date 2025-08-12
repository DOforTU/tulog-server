import { PublicUser } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';

/** Return public user */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    nickname: user.nickname,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
    role: user.role,
  };
}

/** Return array of public users */
export function toPublicUsers(users: User[]): PublicUser[] {
  return users.map((user) => ({
    id: user.id,
    nickname: user.nickname,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
    role: user.role,
  }));
}
