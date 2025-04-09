// src/posts/posts.controller.ts
import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { Post as PostEntity } from './entities/post.entity'; // Adjust the path as needed
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyPosts(@Req() req) {
    return this.postsService.findAll(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body, @Req() req) {
    console.log('Creating post with title:', body.title, 'and body:', body.body);
    return this.postsService.create(body.title, body.body, req?.user?.userId);
  }

  async findById(@Param('id') id: number): Promise<PostEntity | undefined> {
    return this.postsService.findById(id);
  }
}
