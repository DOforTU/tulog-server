import { ResponsePublicUser } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';

/** Return public user */
export function toPublicUser(user: User): ResponsePublicUser {
  return {
    id: user.id,
    nickname: user.nickname,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
  };
}

/** Return array of public users */
export function toPublicUsers(users: User[]): ResponsePublicUser[] {
  return users.map((user) => ({
    id: user.id,
    nickname: user.nickname,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
  }));
}
