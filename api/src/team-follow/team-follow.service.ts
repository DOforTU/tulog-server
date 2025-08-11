import { ConflictException, Injectable } from '@nestjs/common';
import { NoticeService } from 'src/notice/notice.service';
import { UserService } from 'src/user/user.service';
import { TeamFollow } from './team-follow.entity';
import { TeamService } from 'src/team/team.service';
import { Team } from 'src/team/team.entity';

@Injectable()
export class TeamFollowService {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamFollowRepository: TeamFollowRepository,
    private readonly noticeService: NoticeService,
  ) {}

  /** Follow a team
   * followerId follows followId
   */
  async followTeam(userId: number, team: Team): Promise<TeamFollow> {
    // check if the team exists
    await this.teamService.getTeamById(team.id);

    // check if the duplicate follow exists
    const isFollowing = await this.teamFollowRepository.isFollowing(
      userId,
      team.id,
    );

    if (isFollowing) {
      throw new ConflictException('You are already following this team');
    }

    // Create follow relationship
    const follow = await this.teamFollowRepository.followTeam(userId, team.id);
    //const leader = await this.

    // Create follow notification for the target team
    try {
      await this.noticeService.createFollowNotice(
        team, // target user who receives the notification
        userId, // follower user ID
        follow.nickname, // follower nickname
      );
    } catch (error) {
      // Log the error but don't fail the follow operation
      console.error('Failed to create follow notification:', error);
    }

    return follow;
  }

  /** Unfollow a user
   * followerId unfollows followId
   */
  async unfollowUser(followerId: number, followId: number): Promise<boolean> {
    // you cannot unfollow yourself
    if (followerId === followId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    // check if the follow exists
    await this.userService.getUserById(followId);

    // check if the follow exists
    const isFollowing = await this.followRepository.isFollowing(
      followerId,
      followId,
    );

    if (!isFollowing) {
      throw new ConflictException('You are not unfollowing this user');
    }

    return await this.followRepository.unfollowUser(followerId, followId);
  }

  /** Get followers of a user */
  async getFollowers(userId: number): Promise<User[]> {
    // check if the user exists
    await this.userService.getUserById(userId);

    // user will be null, when no followers exist
    const user = await this.userService.findUserByIdWithFollowers(userId);
    if (!user) {
      // so return []
      return [];
    }

    return user.followers.map((f) => f.follower);
  }

  /** Get followings of a user */
  async getFollowings(userId: number): Promise<User[]> {
    // check if the user exists
    await this.userService.getUserById(userId);

    // user will be null, when no followings exist
    const user = await this.userService.findUserByIdWithFollowings(userId);
    if (!user) {
      // so return []
      return [];
    }

    return user.followings.map((f) => f.following);
  }
}
