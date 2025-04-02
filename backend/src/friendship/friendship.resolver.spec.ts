import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipResolver } from './friendship.resolver';

describe('FriendshipResolver', () => {
  let resolver: FriendshipResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendshipResolver],
    }).compile();

    resolver = module.get<FriendshipResolver>(FriendshipResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
