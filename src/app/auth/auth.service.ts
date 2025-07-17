import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { PostgresErrorCode } from '../../libs/constants/postgres-error-codes';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/libs/interfaces/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async register(registerDto: RegisterDto) {
    const hashedPassword = await hash(registerDto.password, 10);
    try {
      const createdUser = await this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
    return token;
  }

  async validate({ email, password }: LoginDto) {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    console.log(password, user.password);
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid password');
    }
    user.password = undefined;
    return user;
  }
}
