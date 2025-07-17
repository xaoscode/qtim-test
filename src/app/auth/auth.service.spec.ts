import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { compare, hash } from 'bcrypt';
import { PostgresErrorCode } from '../../libs/constants/postgres-error-codes';
import { UserRepository } from '../user/repositories/user.repository';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            getByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should_register_user_with_valid_data', async () => {
    const registerDto: RegisterDto = {
      email: 'user@example.com',
      password: 'StrongP@ssw0rd',
      displayName: 'ValeraAnanas',
    };
    const hashed = 'hashedPassword';
    (hash as jest.Mock).mockResolvedValue(hashed);

    const createdUser = {
      id: 1,
      email: registerDto.email,
      password: hashed,
      displayName: registerDto.displayName,
      createdAt: new Date(),
      articles: [],
    };
    userRepository.create.mockResolvedValue(createdUser);

    const result = await authService.register(registerDto);

    expect(hash).toHaveBeenCalledWith(registerDto.password, 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      ...registerDto,
      password: hashed,
    });
    expect(result).toMatchObject({
      id: createdUser.id,
      email: createdUser.email,
      displayName: createdUser.displayName,
    });
    expect(result.password).toBeUndefined();
  });

  it('should_generate_jwt_token_for_valid_user_id', async () => {
    const userId = 42;
    const jwtSecret = 'supersecret';
    const jwtExpiresIn = '1h';
    const token = 'jwt.token.value';

    configService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return jwtSecret;
      if (key === 'JWT_EXPIRES_IN') return jwtExpiresIn;
      return undefined;
    });
    jwtService.sign.mockReturnValue(token);

    const result = await authService.getJwtToken(userId);

    expect(jwtService.sign).toHaveBeenCalledWith(
      { userId },
      { secret: jwtSecret, expiresIn: jwtExpiresIn },
    );
    expect(result).toBe(token);
  });

  it('should_validate_user_with_correct_credentials', async () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'CorrectP@ssw0rd',
    };
    const user = {
      id: 1,
      email: loginDto.email,
      password: 'hashedPassword',
      displayName: 'ValeraAnanas',
      createdAt: new Date(),
      articles: [],
    };
    userRepository.getByEmail.mockResolvedValue({ ...user });
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await authService.validate(loginDto);

    expect(userRepository.getByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(compare).toHaveBeenCalledWith(loginDto.password, user.password);
    expect(result).toMatchObject({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });
    expect(result.password).toBeUndefined();
  });

  it('should_throw_error_when_registering_with_existing_email', async () => {
    const registerDto: RegisterDto = {
      email: 'existing@example.com',
      password: 'StrongP@ssw0rd',
      displayName: 'ValeraAnanas',
    };
    (hash as jest.Mock).mockResolvedValue('hashedPassword');
    const error = { code: PostgresErrorCode.UniqueViolation };
    userRepository.create.mockRejectedValue(error);

    await expect(authService.register(registerDto)).rejects.toThrow(
      new HttpException(
        'User with that email already exists',
        HttpStatus.BAD_REQUEST,
      ),
    );
    expect(hash).toHaveBeenCalledWith(registerDto.password, 10);
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should_throw_error_when_password_is_incorrect', async () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'WrongPassword',
    };
    const user = {
      id: 1,
      email: loginDto.email,
      password: 'hashedPassword',
      displayName: 'ValeraAnanas',
      createdAt: new Date(),
      articles: [],
    };
    userRepository.getByEmail.mockResolvedValue({ ...user });
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(authService.validate(loginDto)).rejects.toThrowError(
      new BadRequestException('Invalid password'),
    );
    expect(userRepository.getByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(compare).toHaveBeenCalledWith(loginDto.password, user.password);
  });

  it('should_throw_error_when_user_does_not_exist', async () => {
    const loginDto: LoginDto = {
      email: 'notfound@example.com',
      password: 'AnyPassword',
    };
    userRepository.getByEmail.mockResolvedValue(null);

    await expect(authService.validate(loginDto)).rejects.toThrowError(
      new BadRequestException('User not found'),
    );
    expect(userRepository.getByEmail).toHaveBeenCalledWith(loginDto.email);
  });
});
