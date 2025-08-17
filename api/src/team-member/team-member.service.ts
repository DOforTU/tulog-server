import { UserService } from 'src/user/user.service';
import { TeamMemberRepository } from './team-member.repository';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TeamMember, TeamMemberStatus } from './team-member.entity';
import { TeamVisibility } from 'src/team/team.entity';
import { NoticeService } from 'src/notice/notice.service';

@Injectable()
export class TeamMemberService {
  constructor(
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly noticeService: NoticeService,
  ) {}

  // ===== CREATE =====
  /**
   * Request a team
   * @param memberId Member ID: the ID of the user who wants to join the team
   * @param teamId Team ID: the ID of the team to join
   * @returns The created TeamMember entity
   * 요청하는 팀이(아이디) 존재하는지
   * 그 팀이 이미 인원이 다 찼는지
   * 내가 그 팀에 이미 존재하는지
   * 팀 싱태가 초대만 가능한 경우 예외처리
   * 참여하지 않았다면 중복 가입 요청 가능
   */
  async requestToTeam(teamId: number, memberId: number): Promise<TeamMember> {
    // 팀 아이디로 팀맴버를 배열로 가져옴 --> 그 팀이 존재하는지 알 수 있음
    const teamMembers =
      await this.teamMemberRepository.getTeamMembersByTeamId(teamId);

    const checkTeamVisibility = teamMembers[0].team.visibility;

    if (checkTeamVisibility === TeamVisibility.ONLY_INVITE) {
      throw new ForbiddenException('You can not invite that team.');
    }

    // 이미 참여 상태라면 가입 요청 못함
    const teamMember = await this.findTeamMemberByPrimaryKey(teamId, memberId);
    if (teamMember?.status === TeamMemberStatus.JOINED) {
      throw new ConflictException('You are already a member of this team.');
    }

    // 팀 인원이 max일 경우 요청 불가
    const memberCount = teamMembers.length;
    // 팀에 속한 팀 맴버중 한명이 속한 팀에서 최대 인원수를 구함
    const maxMember = teamMembers[0].team.maxMember;

    if (memberCount == maxMember) {
      throw new ConflictException('This team is already full.');
    }

    const newTeamMember = await this.teamMemberRepository.requestToTeam(
      teamId,
      memberId,
    );

    // Find team leader and send notification
    const leader = teamMembers.find((tm: TeamMember) => tm.isLeader);
    if (leader) {
      const requesterUser = await this.userService.getUserById(memberId);

      try {
        await this.noticeService.createTeamJoinNotice(
          Number((leader as any).memberId), // team leader receives the notification
          teamId,
          String((teamMembers[0] as any).team.name),
          requesterUser.nickname,
        );
      } catch (error) {
        console.error(
          'Failed to create team join request notification:',
          error,
        );
      }
    }

    return newTeamMember;
  }

  /**
   * Invite a team member
   * @param leaderId Leader ID: the ID of the user who is inviting the member
   * @param teamId Team ID: the ID of the team to invite the member to
   * @param memberId Member ID: the ID of the member to invite
   * @returns The created TeamMember entity
   * 예외 처리 : 초대 대상이 이미 그 팀에 존재하는지
   * 초대 대상이 존재한지
   * 초대 대상이 이미 팀 3개에 존재하는지
   * 참여 상태가 아니라면 중복 초대 가능
   */
  async inviteToTeam(
    leaderId: number,
    teamId: number,
    memberId: number,
  ): Promise<TeamMember> {
    return await this.dataSource.transaction(async (manager) => {
      await this.userService.getUserById(memberId); //get은 없으면 무조건 예외처리 find는 널이라도 반환

      const leader = await this.getTeamMemberByPrimaryKey(teamId, leaderId);
      if (!leader.isLeader) {
        throw new ConflictException('Only team leaders can invite members.');
      }

      // 이미 참여 상태라면 초대 못함
      const ifAlreadyExist = await this.findTeamMemberByPrimaryKey(
        teamId,
        memberId,
      );
      if (ifAlreadyExist?.status === TeamMemberStatus.JOINED) {
        throw new ConflictException('Already on the team.');
      }

      const checkTeamLimit = await this.countTeamsByMemberId(memberId);
      if (checkTeamLimit > 3) {
        throw new ConflictException('This member has already on three teams.');
      }

      // Proceed to invite the user from the team
      const teamMember = await this.teamMemberRepository.inviteTeam(
        teamId,
        memberId,
      );

      // Get team and leader info for notification
      const team = await manager
        .getRepository('Team')
        .findOne({ where: { id: teamId } });
      const leaderUser = await this.userService.getUserById(leaderId);

      // Create team invite notification
      try {
        await this.noticeService.createTeamInviteNotice(
          memberId, // invited user receives the notification
          teamId,
          (team?.name as string) || 'Unknown Team',
          leaderUser.nickname,
        );
      } catch (error) {
        console.error('Failed to create team invite notification:', error);
      }

      return teamMember;
    });
  }

  // ===== READ =====

  /**
   *
   * @param teamId - teammember primary key
   * @param memberId - teamember primary key
   * @returns - use two keys above and then return a teammember
   */
  async getTeamMemberByPrimaryKey(
    teamId: number,
    memberId: number,
  ): Promise<TeamMember> {
    const teamMember = await this.findTeamMemberByPrimaryKey(teamId, memberId);

    if (!teamMember) {
      throw new NotFoundException(
        `Team member with memberId ${memberId} and teamId ${teamId} not found.`,
      );
    }
    return teamMember;
  }

  /**
   * get joined team members by team ID
   * @param teamId Team ID: the ID of the team whose members are to be fetched
   * @returns An array of TeamMember objects representing the joined members
   */
  async getJoinedTeamMembersByTeamId(teamId: number): Promise<TeamMember[]> {
    const teamMembers =
      await this.teamMemberRepository.getTeamMembersByTeamId(teamId);

    const joinedMembers = teamMembers.filter(
      (member) => member.status === TeamMemberStatus.JOINED,
    );

    if (!joinedMembers || joinedMembers.length === 0) {
      throw new NotFoundException('Team members not found');
    }

    return joinedMembers;
  }

  // ===== UPDATE =====
  /**
   * Accept team invitation (from notification)
   * @param teamId Team ID
   * @param memberId Member ID (who was invited)
   * @returns Updated TeamMember entity
   */
  async acceptTeamInvitation(
    teamId: number,
    memberId: number,
  ): Promise<TeamMember> {
    return await this.dataSource.transaction(async (manager) => {
      // Find the invitation
      const teamMember = await this.getTeamMemberByPrimaryKey(teamId, memberId);
      if (teamMember.status !== TeamMemberStatus.INVITED) {
        throw new ConflictException('Invalid invitation status.');
      }

      // Update status to JOINED
      await manager
        .getRepository(TeamMember)
        .update({ teamId, memberId }, { status: TeamMemberStatus.JOINED });

      // Get updated team member
      const updatedMember = await this.findTeamMemberByPrimaryKey(
        teamId,
        memberId,
      );

      // Get team info for notification
      const teamMembers =
        await this.teamMemberRepository.getTeamMembersByTeamId(teamId);
      const leader = teamMembers.find((tm: TeamMember) => tm.isLeader);
      const joiningUser = await this.userService.getUserById(memberId);

      // Send notification to team leader about new member
      if (leader) {
        try {
          await this.noticeService.createTeamJoinNotice(
            Number((leader as any).memberId),
            teamId,
            String((teamMembers[0] as any).team.name),
            joiningUser.nickname,
          );
        } catch (error) {
          console.error('Failed to create team join notification:', error);
        }
      }

      return updatedMember as TeamMember;
    });
  }

  /**
   * Accept team join request (by team leader from notification)
   * @param teamId Team ID
   * @param memberId Member ID (who requested to join)
   * @param leaderId Leader ID (who is accepting)
   * @returns Updated TeamMember entity
   */
  async acceptTeamJoinRequest(
    teamId: number,
    memberId: number,
    leaderId: number,
  ): Promise<TeamMember> {
    return await this.dataSource.transaction(async (manager) => {
      // Verify leader status
      const leader = await this.getTeamMemberByPrimaryKey(teamId, leaderId);
      if (!leader.isLeader) {
        throw new ConflictException(
          'Only team leaders can accept join requests.',
        );
      }

      // Find the join request
      const request = await this.findTeamMemberByPrimaryKey(teamId, memberId);
      console.log(request);
      if (!request) {
        throw new NotFoundException('Team join request not found.');
      }

      if (request.status !== TeamMemberStatus.PENDING) {
        throw new ConflictException('Invalid join request status.');
      }

      // Update status to JOINED
      await manager
        .getRepository(TeamMember)
        .update({ teamId, memberId }, { status: TeamMemberStatus.JOINED });

      // Get updated team member
      const updatedMember = await this.teamMemberRepository.findByPrimaryKey(
        teamId,
        memberId,
      );

      // Send notification to the new member about acceptance
      const teamMembers =
        await this.teamMemberRepository.getTeamMembersByTeamId(teamId);
      const leaderUser = await this.userService.getUserById(leaderId);
      try {
        await this.noticeService.createTeamJoinNotice(
          memberId, // notify the person who requested
          teamId,
          String((teamMembers[0] as any).team.name),
          leaderUser.nickname, // 팀장의 실제 닉네임 사용
        );
      } catch (error) {
        console.error('Failed to create join acceptance notification:', error);
      }

      return updatedMember as TeamMember;
    });
  }

  // ===== DELETE =====

  /**
   * Reject team join request (by team leader from notification)
   * @param teamId Team ID
   * @param memberId Member ID (who requested to join)
   * @param leaderId Leader ID (who is rejecting)
   * @returns Success boolean
   */
  async rejectTeamJoinRequest(
    teamId: number,
    memberId: number,
    leaderId: number,
  ): Promise<boolean> {
    // Verify leader status
    const leader = await this.getTeamMemberByPrimaryKey(teamId, leaderId);
    if (!leader.isLeader) {
      throw new ConflictException(
        'Only team leaders can reject join requests.',
      );
    }

    // Find the join request
    const request = await this.findTeamMemberByPrimaryKey(teamId, memberId);
    if (!request) {
      throw new NotFoundException('Team join request not found.');
    }

    if (request.status !== TeamMemberStatus.PENDING) {
      throw new ConflictException('Invalid join request status.');
    }

    // Remove the request
    await this.teamMemberRepository.leaveTeam(teamId, memberId);

    return true;
  }

  /**
   * Leave a team
   * @param teamId Team ID: the ID of the team to leave
   * @param memberId Member ID: the ID of the user who wants to leave the team
   * @returns A boolean indicating whether the leave operation was successful
   */
  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    const teamMembers =
      await this.teamMemberRepository.findWithTeamsByTeamId(teamId);

    // If no teams found, throw an exception
    if (!teamMembers || teamMembers.length === 0) {
      throw new NotFoundException('팀을 찾을 수 없습니다.');
    }

    // check if leaving member is part of the team members
    const leavingMember = teamMembers.find((m) => m.memberId === memberId);
    if (!leavingMember) {
      throw new NotFoundException('해당 멤버가 팀에 존재하지 않습니다.');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // If only one team member exists: delete team and leaving team(transaction)
    if (teamMembers.length === 1) {
      try {
        // 1. delete team member
        await queryRunner.query(
          'DELETE FROM "server_api"."team_member" WHERE "teamId" = $1 AND "memberId" = $2',
          [teamId, memberId],
        );

        // 2. soft delete team
        await queryRunner.query(
          'UPDATE "server_api"."team" SET "deletedAt" = NOW() WHERE "id" = $1',
          [teamId],
        );

        // 3. delete editor of team
        await queryRunner.query(
          'DELETE FROM "server_api"."editor" WHERE "postId" IN \
          (SELECT "id" FROM "server_api"."post" WHERE "teamId" = $1) AND "userId" = $2',
          [teamId, memberId],
        );

        // 4. soft delete posts
        await queryRunner.query(
          'UPDATE "server_api"."post" SET "deletedAt" = NOW() WHERE "teamId" = $1',
          [teamId],
        );

        // 5. delete bookmarks, likes, hide
        await queryRunner.query(
          'DELETE FROM "server_api"."bookmark" WHERE "postId" IN \
            (SELECT "id" FROM "server_api"."post" WHERE "teamId" = $1)',
          [teamId],
        );
        await queryRunner.query(
          'DELETE FROM "server_api"."post_like" WHERE "postId" IN \
            (SELECT "id" FROM "server_api"."post" WHERE "teamId" = $1)',
          [teamId],
        );
        await queryRunner.query(
          'DELETE FROM "server_api"."post_hide" WHERE "postId" IN \
            (SELECT "id" FROM "server_api"."post" WHERE "teamId" = $1)',
          [teamId],
        );

        // 6. delete team follows
        await queryRunner.query(
          'DELETE FROM "server_api"."team_follow" WHERE "teamId" = $1',
          [teamId],
        );

        await queryRunner.commitTransaction();
        return true;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new Error(
          `Failed to leave team and delete team: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }

    // If multiple team members exist and the leader is leaving: leadership transfer is required
    if (leavingMember.isLeader) {
      throw new ConflictException(
        'You must transfer leadership to another member before leaving the team.',
      );
    }

    // Remove the member from the team and editor status to VIEWER
    try {
      // 1. leave team
      await queryRunner.query(
        'DELETE FROM "server_api"."team_member" WHERE "teamId" = $1 AND "memberId" = $2',
        [teamId, memberId],
      );

      // 2. delete editor
      await queryRunner.query(
        'DELETE FROM "server_api"."editor" WHERE "postId" IN \
          (SELECT "id" FROM "server_api"."post" WHERE "teamId" = $1) AND "userId" = $2',
        [teamId, memberId],
      );

      await queryRunner.commitTransaction(); // 트랜잭션 커밋 추가!
      console.log(`User ${memberId} left team ${teamId}`);
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to leave team and delete team: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Kick a team member
   * @param requesterId Requester ID: the ID of the user for checking leader status
   * @param teamId Team ID: the ID of the team from which the member will be kicked
   * @param memberId User ID: the ID of the user to be kicked from the team
   * @return A boolean indicating whether the kick operation was successful
   */
  async kickTeamMember(
    leaderId: number,
    teamId: number,
    memberId: number,
  ): Promise<boolean> {
    // Check if the requester is a leader of the team
    const leader = await this.getTeamMemberByPrimaryKey(teamId, leaderId);
    if (!leader.isLeader) {
      throw new ConflictException('You are not authorized to kick members.');
    }

    // Check if the user to be kicked is part of the team
    await this.getTeamMemberByPrimaryKey(teamId, memberId);

    // Proceed to kick the user from the team
    return await this.teamMemberRepository.leaveTeam(teamId, memberId);
  }

  /**
   * Reject team invitation (from notification)
   * @param teamId Team ID
   * @param memberId Member ID (who was invited)
   * @returns Success boolean
   */
  async rejectTeamInvitation(
    teamId: number,
    memberId: number,
  ): Promise<boolean> {
    const invitation = await this.findTeamMemberByPrimaryKey(teamId, memberId);
    if (!invitation) {
      throw new NotFoundException('Team invitation not found.');
    }

    if (invitation.status !== TeamMemberStatus.INVITED) {
      throw new ConflictException('Invalid invitation status.');
    }

    // Remove the invitation
    await this.teamMemberRepository.leaveTeam(teamId, memberId);

    return true;
  }

  // ===== SUB FUNCTION =====
  /**
   * get the number of teams a user is part of
   * @param memberId Member ID: the ID of the user whose team count is to be fetched
   * @returns The number of teams the user is part of
   */
  async countTeamsByMemberId(memberId: number): Promise<number> {
    const teamMembers =
      await this.teamMemberRepository.findByMemberId(memberId);

    if (!teamMembers) return 0;

    const filteredTeams = teamMembers.filter(
      (teamMember) => teamMember.status === TeamMemberStatus.JOINED,
    );
    return filteredTeams.length;
  }

  /**
   * find a team member by primary key
   * @param memberId
   * @param teamId
   * @returns The found TeamMember entity or null if not found
   */
  async findTeamMemberByPrimaryKey(
    teamId: number,
    memberId: number,
  ): Promise<TeamMember | null> {
    return await this.teamMemberRepository.findByPrimaryKey(teamId, memberId);
  }
}
