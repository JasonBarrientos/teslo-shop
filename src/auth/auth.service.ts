import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as  bcrypt from "bcrypt";
import { LoginUserDto } from './dto/login-user.dto copy';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private readonly jwtService: JwtService) {

  }
  async create(createAuthDto: CreateUserDto) {
    try {
      let { password, ...userDetail } = createAuthDto
      let user = this.userRepository.create({
        ...userDetail,
        password: bcrypt.hashSync(password, 10)
      })
      await this.userRepository.save(user);

      return {...user,
      token: this.getJwtToken({id:user.id})
    };;
    } catch (error) {
      this.erroHandler(error)
    }
  }
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {
        email
      },
      select: { email: true, password: true ,id: true}
    });
    if (!user) {
      throw new UnauthorizedException(`Credencials are nto valid (email)`)
    }
    if (!bcrypt.compareSync(password,user.password)) {
      throw new UnauthorizedException(`Credencials are nto valid (password)`)
    }
    console.log(user.id);
    
    return {...user,
      token: this.getJwtToken({id:user.id})
    };
  }
  private erroHandler(err): never {
    switch (err.code) {
      case '23505':
        throw new BadRequestException(err.detail)
      default:
        throw new InternalServerErrorException(`error no identificado: ${err.detail}`)
    }
  }
  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

}
