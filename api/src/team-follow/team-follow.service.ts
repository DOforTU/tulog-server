import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoticeService } from 'src/notice/notice.service';
import { UserService } from 'src/user/user.service';
import { TeamFollow } from './team-follow.entity';
import { TeamService } from 'src/team/team.service';
import { Team } from 'src/team/team.entity';
import { User } from 'src/user/user.entity';
import { TeamFollowRepository } from './team-follow.repository';

@Injectable()
export class TeamFollowService {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamFollowRepository: TeamFollowRepository,
    private readonly noticeService: NoticeService,
    private readonly userService: UserService,
  ) {}

  // ===== CREATE =====

  /** Follow a team
   * followerId follows followId
   */
  async followTeam(
    userId: number,
    nickname: string,
    teamId: number,
  ): Promise<TeamFollow> {
    // check if the team exists
    const teamMembers = await this.teamService.getTeamWithMembersById(teamId);
    const leaderId = teamMembers.teamMembers.find((m) => m.isLeader == true)
      ?.user.id;

    // check if the duplicate follow exists
    const isFollowing = await this.teamFollowRepository.isFollowing(
      userId,
      teamId,
    );

    if (isFollowing) {
      throw new ConflictException('You are already following this team');
    }

    // Create follow relationship
    const follow = await this.teamFollowRepository.followTeam(userId, teamId);
    //const leader = await this.

    // Create follow notification for the target team
    try {
      if (!leaderId) {
        throw new NotFoundException('You can not found the laeder.');
      }
      await this.noticeService.createFollowNotice(
        leaderId, // target user who receives the notification
        userId, // follower user ID
        nickname, // follower nickname
      );
    } catch (error) {
      // Log the error but don't fail the follow operation
      console.error('Failed to create follow notification:', error);
    }

    return follow;
  }

  // ===== READ =====

  /** Get following teams of a user
   *  유저가 팔로우한 팀 조회(유저기준)
   */
  async getMyFollowingTeams(userId: number): Promise<Team[]> {
    // team will be null, when no followings exist
    const followingTeams = await this.userService.findMyFollowingTeams(userId);
    if (!followingTeams) {
      // so return []
      return [];
    }

    return followingTeams.teamFollows.map((f) => f.team);
  }

  /** Get users of following team
   *  팀을 팔로우한 유저 조회 (팀 기준)
   */
  async getFollowersWithTeam(teamId: number): Promise<User[]> {
    // 팀이 존재한지 안한지
    await this.teamService.getTeamById(teamId);

    // user will be null, when no followers exist
    const team = await this.teamService.findFollowingUserById(teamId);
    if (!team) {
      // so return []
      return [];
    }

    return team.followers.map((f) => f.user);
  }

  // ===== DELETE =====

  /** Unfollow a user
   * followerId unfollows followId
   */
  async unfollowTeam(userId: number, teamId: number): Promise<boolean> {
    // check if the follow exists
    const isFollowing = await this.teamFollowRepository.isFollowing(
      userId,
      teamId,
    );

    if (!isFollowing) {
      throw new ConflictException('You are not unfollowing this team');
    }

    return await this.teamFollowRepository.unfollowTeam(userId, teamId);
  }

  // 팀을 가져오되 리더 정보와 같이 가져옴
  //async getTeamWithLeaderById(teamId: number): Promise<team>;
}
