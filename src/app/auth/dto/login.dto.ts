import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IUser } from 'src/libs/interfaces/user.interface';

export class LoginDto implements Pick<IUser, 'email' | 'password'> {
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'The password for the user account.',
    example: 'P@ssw0rd123',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
