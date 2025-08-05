import { IsEmail, IsString, IsStrongPassword, isStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
        @IsString()
        @IsEmail()
        email: string;

        @IsString()
        @MinLength(3)
        fullName: string;

        @IsString()
        @IsStrongPassword({minLength:8,})
        password: string;
    
}
