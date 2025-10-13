import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const newPost = new this.postModel({
      ...createPostDto,
      author: new Types.ObjectId(userId),
    });
    return newPost.save();
  }

  async getPosts(): Promise<Post[]> {
    return this.postModel
      .find()
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.postModel
      .findById(postId)
      .populate('author', 'username firstName lastName')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username firstName lastName' },
      })
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }
    const updatedPost = await this.postModel.findByIdAndUpdate(postId, updatePostDto, { new: true }).exec();
    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }
    return updatedPost;
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.commentModel.deleteMany({ postId });
    await this.postModel.findByIdAndDelete(postId);
  }

  async likePost(userId: string, postId: string): Promise<{ likes: number; dislikes: number }> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const userObjectId = new Types.ObjectId(userId);
    const likedIndex = post.likedBy.findIndex(id => id.toString() === userId);
    const dislikedIndex = post.dislikedBy.findIndex(id => id.toString() === userId);

    if (likedIndex > -1) {
      // Remove like
      post.likedBy.splice(likedIndex, 1);
      post.likes -= 1;
    } else {
      // Add like
      post.likedBy.push(userObjectId);
      post.likes += 1;
      if (dislikedIndex > -1) {
        // Remove dislike if exists
        post.dislikedBy.splice(dislikedIndex, 1);
        post.dislikes -= 1;
      }
    }
    await post.save();
    return { likes: post.likes, dislikes: post.dislikes };
  }

  async dislikePost(userId: string, postId: string): Promise<{ likes: number; dislikes: number }> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const userObjectId = new Types.ObjectId(userId);
    const likedIndex = post.likedBy.findIndex(id => id.toString() === userId);
    const dislikedIndex = post.dislikedBy.findIndex(id => id.toString() === userId);

    if (dislikedIndex > -1) {
      // Remove dislike
      post.dislikedBy.splice(dislikedIndex, 1);
      post.dislikes -= 1;
    } else {
      // Add dislike
      post.dislikedBy.push(userObjectId);
      post.dislikes += 1;
      if (likedIndex > -1) {
        // Remove like if exists
        post.likedBy.splice(likedIndex, 1);
        post.likes -= 1;
      }
    }
    await post.save();
    return { likes: post.likes, dislikes: post.dislikes };
  }

  async addComment(userId: string, postId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const newComment = new this.commentModel({
      ...createCommentDto,
      postId: new Types.ObjectId(postId),
      author: new Types.ObjectId(userId),
    });
    const savedComment = await newComment.save();
    post.comments.push(savedComment._id as Types.ObjectId);
    await post.save();
    return savedComment.populate('author', 'username firstName lastName');
  }

  async getCommentsForPost(postId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ postId })
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async sharePost(postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.shares += 1;
    await post.save();
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.postModel
      .find({ author: new Types.ObjectId(userId) })
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ author: new Types.ObjectId(userId) })
      .populate('postId', 'title')
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.postModel.findByIdAndUpdate(comment.postId, { $pull: { comments: commentId } });
    await this.commentModel.findByIdAndDelete(commentId);
  }
}