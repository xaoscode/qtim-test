import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../../libs/decorators/user.decorator';
import { IUser } from 'src/libs/interfaces/user.interface';
import { LocalGuard } from '../../libs/guards/local.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ description: 'User successfully registered' })
  @ApiBadRequestResponse({ description: 'Invalid registration data' })
  async register(@Body() registrationData: RegisterDto) {
    return this.authService.register(registrationData);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ description: 'JWT token generated successfully' })
  @ApiBadRequestResponse({ description: 'Unauthorized' })
  async login(@User() { id }: IUser) {
    return this.authService.getJwtToken(id);
  }
}
