// filepath: /Users/kovvurubala.krishna/Desktop/jk-project/backend/src/posts/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust the path as necessary

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'uuid' }) // Correctly define userId as a UUID without length
  userId: string;

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  user: User;
}