import { IsEmail, IsNotEmpty, IsOptional, MinLength, ValidateIf } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;
  
    @IsEmail()
    email: string;
    @ValidateIf((o) => !o.provider_id)
    @MinLength(6)
    password: string;
  
    @IsOptional()
    provider?: string;
  
    @IsOptional()
    provider_id?: string;
  }
