import { Injectable } from '@nestjs/common';
import { TeammemberRepository } from './teamember.repository';

@Injectable()
export class TeammemberService {
  constructor(private readonly teamemberRepository: TeammemberRepository) {}

  async findTeammeber() {}

  async countTeamsByLeaderId(leaderId: number) {}

  async addTeamMember(userId: number, teamId: number, role: 'leader') {}
}
