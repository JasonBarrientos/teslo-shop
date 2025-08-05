import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { EntitySchema, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor (@InjectRepository(User) private readonly userRepository: Repository<User> ){

  }
  async create(createAuthDto: CreateUserDto) {
       try {
        let user= this.userRepository.create(createAuthDto)
       await this.userRepository.save(user);
      return user;
       } catch (error) {
          this.erroHandler(error)
       }
  }
  private erroHandler (err): never{
    switch (err.code) {
      case '23505':
          throw new BadRequestException(err.detail)
      default:
                  throw new InternalServerErrorException(`error no identificado: ${err.detail}`)
        
    }
  }

}
