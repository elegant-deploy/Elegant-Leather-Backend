import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
    const post = await this.communityService.createPost(req.user.userId, createPostDto);
    return post;
  }

  @Get('posts')
  async getPosts() {
    const posts = await this.communityService.getPosts();
    return posts.map(post => ({
      id: (post as any)._id,
      author: post.author,
      title: post.title,
      content: post.content,
      tags: post.tags,
      likes: post.likes,
      dislikes: post.dislikes,
      commentsCount: post.comments.length,
      shares: post.shares,
      createdAt: (post as any).createdAt,
      images: post.images,
    }));
  }

  @Get('posts/:postId')
  async getPostById(@Param('postId') postId: string) {
    const post = await this.communityService.getPostById(postId);
    return {
      id: (post as any)._id,
      author: post.author,
      title: post.title,
      content: post.content,
      tags: post.tags,
      likes: post.likes,
      dislikes: post.dislikes,
      comments: (post as any).comments.map((comment: any) => ({
        id: comment._id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
      shares: post.shares,
      createdAt: (post as any).createdAt,
      images: post.images,
    };
  }

  @Patch('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updatePost(
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.communityService.updatePost(req.user.userId, postId, updatePostDto);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('postId') postId: string, @Request() req) {
    await this.communityService.deletePost(req.user.userId, postId);
    return { message: 'Post deleted successfully' };
  }

  @Post('posts/:postId/like')
  @UseGuards(JwtAuthGuard)
  async likePost(@Param('postId') postId: string, @Request() req) {
    const counts = await this.communityService.likePost(req.user.userId, postId);
    return counts;
  }

  @Post('posts/:postId/dislike')
  @UseGuards(JwtAuthGuard)
  async dislikePost(@Param('postId') postId: string, @Request() req) {
    const counts = await this.communityService.dislikePost(req.user.userId, postId);
    return counts;
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async addComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    const comment = await this.communityService.addComment(req.user.userId, postId, createCommentDto);
    return {
      id: (comment as any)._id,
      author: comment.author,
      content: comment.content,
      createdAt: (comment as any).createdAt,
    };
  }

  @Get('posts/:postId/comments')
  async getCommentsForPost(@Param('postId') postId: string) {
    const comments = await this.communityService.getCommentsForPost(postId);
    return comments.map(comment => ({
      id: (comment as any)._id,
      author: comment.author,
      content: comment.content,
      createdAt: (comment as any).createdAt,
    }));
  }

  @Post('posts/:postId/share')
  @UseGuards(JwtAuthGuard)
  async sharePost(@Param('postId') postId: string) {
    await this.communityService.sharePost(postId);
    return { message: 'Post shared successfully' };
  }

  @Get('users/me/posts')
  @UseGuards(JwtAuthGuard)
  async getUserPosts(@Request() req) {
    const posts = await this.communityService.getUserPosts(req.user.userId);
    return posts.map(post => ({
      id: (post as any)._id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      likes: post.likes,
      dislikes: post.dislikes,
      commentsCount: post.comments.length,
      shares: post.shares,
      createdAt: (post as any).createdAt,
      images: post.images,
    }));
  }

  @Get('users/me/comments')
  @UseGuards(JwtAuthGuard)
  async getUserComments(@Request() req) {
    const comments = await this.communityService.getUserComments(req.user.userId);
    return comments.map(comment => ({
      id: (comment as any)._id,
      postId: comment.postId,
      content: comment.content,
      createdAt: (comment as any).createdAt,
    }));
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    await this.communityService.deleteComment(req.user.userId, commentId);
    return { message: 'Comment deleted successfully' };
  }
}