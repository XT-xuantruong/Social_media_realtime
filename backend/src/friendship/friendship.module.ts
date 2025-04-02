import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipResolver } from './friendship.resolver';
import { FriendshipService } from './friendship.service';
import { Friendship } from './friendship.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, User])],
  providers: [FriendshipResolver, FriendshipService],
})
export class FriendshipModule {}