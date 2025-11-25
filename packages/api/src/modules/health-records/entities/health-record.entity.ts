import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';
import { Consultation } from '../../consultations/entities/consultation.entity';

export type RecordType = 'consultation' | 'vaccine' | 'exam' | 'medication' | 'procedure';

@Entity('health_records')
export class HealthRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id' })
  petId!: string;

  @Column({ name: 'consultation_id', nullable: true })
  consultationId?: string;

  @Column({ name: 'record_type', length: 50 })
  recordType!: RecordType;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Pet, (pet) => pet.healthRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @ManyToOne(() => Consultation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'consultation_id' })
  consultation?: Consultation;
}
