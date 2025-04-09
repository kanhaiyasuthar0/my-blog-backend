import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(userId: string): Promise<Post[]> {
    return this.postsRepository.find({ where: { userId } });
  }

  async create(title: string, body: string, userId: string): Promise<Post> {
    console.log('Creating post with title:', title, 'and body:', body,userId);
    const newPost = this.postsRepository.create({ title, body, userId });
    return this.postsRepository.save(newPost);
  }

  async findById(id: number): Promise<Post | undefined> {
    const post = await this.postsRepository.findOne({ where: { id } });
    return post ?? undefined;
  }
}