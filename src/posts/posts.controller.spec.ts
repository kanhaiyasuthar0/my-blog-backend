import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Post as PostEntity } from './entities/post.entity';
import { ExecutionContext } from '@nestjs/common';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { sub: '123', userId: '123' }; // Mock user object
          return true;
        }),
      })
      .compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyPosts', () => {
    it('should return all posts for the authenticated user', async () => {
      const userId = '123';
      const posts: any = [
        { id: 1, title: 'Post 1', body: 'Body 1', userId, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, title: 'Post 2', body: 'Body 2', userId, createdAt: new Date(), updatedAt: new Date() },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(posts);

      const result = await controller.getMyPosts({ user: { sub: userId } });

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(posts);
    });
  });

  describe('create', () => {
    it('should create a new post for the authenticated user', async () => {
      const title = 'New Post';
      const body = 'This is a new post';
      const userId = '123';
      const newPost: any = {
        id: 1,
        title,
        body,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(newPost);

      const result = await controller.create({ title, body }, { user: { userId } });

      expect(service.create).toHaveBeenCalledWith(title, body, userId);
      expect(result).toEqual(newPost);
    });
  });

  describe('findById', () => {
    it('should return a post if found', async () => {
      const id = 1;
      const post: any = {
        id,
        title: 'Post Title',
        body: 'Post Body',
        userId: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findById').mockResolvedValue(post);

      const result = await controller.findById(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(post);
    });

    it('should return undefined if no post is found', async () => {
      const id = 1;

      jest.spyOn(service, 'findById').mockResolvedValue(undefined);

      const result = await controller.findById(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});