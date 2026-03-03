import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cuenta } from '../../usuarios/entities/cuenta.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ nullable: true, length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  messageCount!: number;

  @ManyToOne(() => Cuenta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Cuenta;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages!: Message[];
}
