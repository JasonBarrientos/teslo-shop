import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto copy';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/get-rawheader.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
  @GetUser() user: User,
  @GetUser('email') email: string,
  @RawHeaders() rawHeaders: string[]
){
    
    return {
      ok:true,
      message :"ruta privada",
      user,
      email,
      rawHeaders
    }
  }

  @Get('private2')
  @SetMetadata('roles',['admin','super-user'])
  @UseGuards(AuthGuard(),UserRoleGuard)
  privateRoute2( 
    @GetUser() user: User
  ){
     return {
      ok: true,
      message :"ruta privada2",
      user,
     
    }
  }
}
