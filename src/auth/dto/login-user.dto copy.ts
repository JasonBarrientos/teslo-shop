import { IsEmail, IsString, IsStrongPassword, isStrongPassword, MinLength } from "class-validator";

export class LoginUserDto {
        @IsString()
        @IsEmail()
        email: string;

        @IsString()
        @IsStrongPassword({minLength:8,})
        password: string;
    
}
