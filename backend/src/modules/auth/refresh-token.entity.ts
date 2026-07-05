import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  @Column({ name: 'token_hash' }) tokenHash!: string;
  @Column({ default: false }) revoked!: boolean;
  @Column({ name: 'expires_at' }) expiresAt!: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
