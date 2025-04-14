import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadService } from 'src/upload/upload.service';
import { UserEdge } from './dto/userResponse.dto';
import { PageInfo } from 'src/dto/graphql.response.dto';

@Injectable()
export class UsersService {
  findOneById(senderId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private uploadService: UploadService, // Inject UploadService
  ) {}

  async create(userData: RegisterDto, is_verified: boolean): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      ...userData,
      is_verified,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async findManyByIds(userIds: string[]): Promise<User[]> {
    const users = await this.usersRepository.findBy({ id: In(userIds) });
    const foundIds = users.map((user) => user.id);
    const missingIds = userIds.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      throw new BadRequestException(`Users not found: ${missingIds.join(', ')}`);
    }
    return users;
  }

  async update(user: User): Promise<User> {
    return await this.usersRepository.save(user); // Cập nhật user với OTP
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File): Promise<User> {
    const user = await this.findById(userId);

    if (file) {
      const avatarUrl = await this.uploadService.uploadImage(file, "user_avatars");
      user.avatar_url = avatarUrl;
    }

    if (updateUserDto.full_name !== undefined) {
      user.full_name = updateUserDto.full_name;
    }

    if (updateUserDto.bio !== undefined) {
      user.bio = updateUserDto.bio;
    }
    if (updateUserDto.privacy !== undefined) {
      user.privacy = updateUserDto.privacy;
    }

    return await this.usersRepository.save(user);
  }

  async searchUsers(
    query: string,
    limit: number = 10,
    cursor?: string,
  ): Promise<{ edges: UserEdge[]; pageInfo: PageInfo }> {
    try {
      if (!query.trim()) {
        throw new BadRequestException('Query không được rỗng');
      }
      if (limit <= 0) {
        throw new BadRequestException('Limit phải lớn hơn 0');
      }

      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .where('LOWER(user.full_name) LIKE LOWER(:query)', { query: `%${query}%` })
        .orderBy('user.created_at', 'DESC')
        .take(limit + 1);

      if (cursor) {
        try {
          const cursorDate = new Date(Buffer.from(cursor, 'base64').toString('ascii'));
          queryBuilder.andWhere('user.created_at < :cursor', { cursor: cursorDate });
        } catch (error) {
          throw new BadRequestException('Invalid cursor format');
        }
      }

      const users = await queryBuilder.getMany();
      const total = await this.usersRepository.count({
        where: { full_name: Like(`%${query}%`) },
      });

      const hasNextPage = users.length > limit;
      const usersToReturn = users.slice(0, limit);

      const edges = usersToReturn.map((user) => ({
        node: user,
        cursor: Buffer.from(user.created_at.toISOString()).toString('base64'),
      }));

      return {
        edges,
        pageInfo: {
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          hasNextPage,
          total,
        },
      };
    } catch (error) {
      throw new Error(`Không thể tìm kiếm người dùng: ${error.message}`);
    }
  }

}
