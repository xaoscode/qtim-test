import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IUser } from 'src/libs/interfaces/user.interface';

export class RegisterDto
  implements Pick<IUser, 'email' | 'displayName' | 'password'>
{
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description:
      'The password for the user account. Must be strong (at least 8 characters, including uppercase, lowercase, number, and symbol).',
    example: 'P@ssw0rd123',
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be strong (minimum 8 characters, including uppercase, lowercase, number, and symbol)',
    },
  )
  password: string;

  @ApiProperty({
    description:
      'The display name of the user. Must be at least 3 characters long.',
    example: 'ValeraAnanas',
    required: true,
    minLength: 3,
  })
  @IsNotEmpty({ message: 'Display name is required' })
  @MinLength(3, { message: 'Display name must be at least 3 characters long' })
  displayName: string;
}
