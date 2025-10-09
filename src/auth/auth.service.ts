import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      const { password, ...result } = (user as UserDocument).toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    };
  }

  async register(createUserDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
  }) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = (user as UserDocument).toObject();
    return this.login(result);
  }
} 