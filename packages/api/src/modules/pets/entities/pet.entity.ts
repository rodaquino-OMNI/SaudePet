import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Consultation } from '../../consultations/entities/consultation.entity';
import { HealthRecord } from '../../health-records/entities/health-record.entity';

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'exotic';
export type PetSex = 'male' | 'female';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 20 })
  species!: PetSpecies;

  @Column({ nullable: true, length: 100 })
  breed?: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ nullable: true, length: 10 })
  sex?: PetSex;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ default: false })
  neutered!: boolean;

  @Column({ name: 'photo_url', nullable: true, length: 500 })
  photoUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Consultation, (consultation) => consultation.pet)
  consultations!: Consultation[];

  @OneToMany(() => HealthRecord, (record) => record.pet)
  healthRecords!: HealthRecord[];
}
