import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from './decorators/user.decorator';
import { IUser } from 'src/libs/interfaces/user.interface';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authService.register(registrationData);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@User() { id }: IUser) {
    return this.authService.getJwtToken(id);
  }
}
