import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Get()
  async findAll() {
    return this.usersService.getAllUsers();
  }
}
