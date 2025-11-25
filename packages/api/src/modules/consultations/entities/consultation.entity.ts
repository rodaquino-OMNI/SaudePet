import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

export type ConsultationStatus = 'active' | 'completed' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id' })
  petId!: string;

  @Column({ name: 'whatsapp_conversation_id', nullable: true, length: 100 })
  whatsappConversationId?: string;

  @Column({ default: 'active', length: 20 })
  status!: ConsultationStatus;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @Column({ type: 'jsonb', nullable: true })
  diagnosis?: {
    primary: string;
    differentials: Array<{ condition: string; probability: number }>;
    urgencyLevel: UrgencyLevel;
  };

  @Column({ type: 'jsonb', nullable: true })
  treatment?: {
    medications: Array<{
      name: string;
      dosage: string;
      route: string;
      frequency: string;
      duration: string;
    }>;
    supportiveCare: string[];
    followUp?: string;
  };

  @Column({ name: 'urgency_level', nullable: true, length: 20 })
  urgencyLevel?: UrgencyLevel;

  @Column({ name: 'prescription_url', nullable: true, length: 500 })
  prescriptionUrl?: string;

  @CreateDateColumn({ name: 'started_at' })
  startedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Pet, (pet) => pet.consultations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;
}
