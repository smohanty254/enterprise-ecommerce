import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'actor_id', nullable: true }) actorId?: string;
  @Column() action!: string;
  @Column() entity!: string;
  @Column({ name: 'entity_id', nullable: true }) entityId?: string;
  @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, unknown>;
  @Column({ name: 'correlation_id', nullable: true }) correlationId?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
