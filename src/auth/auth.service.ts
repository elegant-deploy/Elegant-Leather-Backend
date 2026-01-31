import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.status === UserStatus.ACTIVE && (await this.usersService.validatePassword(user, password))) {
      const { password, ...result } = (user as UserDocument).toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Update lastLogin
    await this.usersService.updateLastLogin(user._id);

    const payload = { email: user.email, sub: user._id, role: user.role, departmentId: user.departmentId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        departmentId: user.departmentId,
        status: user.status,
        lastLogin: new Date(),
      },
    };
  }

  async getProfile(user: any) {
    const fullUser = await this.usersService.findById(user.userId);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...profile } = (fullUser as UserDocument).toObject();
    return {
      ...profile,
      name: `${fullUser.firstName} ${fullUser.lastName}`.trim(),
    };
  }

  async updateProfile(userId: string, updateData: { name: string; email: string; phone?: string; address?: string }) {
    return this.usersService.updateProfile(userId, updateData);
  }

  async changePassword(userId: string, changeData: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(userId, changeData.currentPassword, changeData.newPassword);
  }
} 