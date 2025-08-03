import { ResponsePublicUser } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';

export function toPublicUser(user: User): ResponsePublicUser {
  return {
    id: user.id,
    nickname: user.nickname,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
  };
}
