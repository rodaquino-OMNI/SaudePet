import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
    name = 'InitialSchema1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "phone_number" varchar(20) NOT NULL,
                "name" varchar(100),
                "email" varchar(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_users_phone_number" UNIQUE ("phone_number"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create pets table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "pets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "name" varchar(50) NOT NULL,
                "species" varchar(20) NOT NULL,
                "breed" varchar(100),
                "birth_date" date,
                "sex" varchar(10),
                "weight" decimal(5,2),
                "neutered" boolean NOT NULL DEFAULT false,
                "photo_url" varchar(500),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_pets" PRIMARY KEY ("id"),
                CONSTRAINT "FK_pets_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Create consultations table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "consultations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "pet_id" uuid NOT NULL,
                "status" varchar(20) NOT NULL DEFAULT 'pending',
                "symptoms" text,
                "diagnosis" jsonb,
                "treatment" jsonb,
                "notes" text,
                "started_at" TIMESTAMP NOT NULL DEFAULT now(),
                "completed_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_consultations" PRIMARY KEY ("id"),
                CONSTRAINT "FK_consultations_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE
            )
        `);

        // Create health_records table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "health_records" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "pet_id" uuid NOT NULL,
                "consultation_id" uuid,
                "type" varchar(50) NOT NULL,
                "description" text,
                "data" jsonb,
                "recorded_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_health_records" PRIMARY KEY ("id"),
                CONSTRAINT "FK_health_records_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_health_records_consultation_id" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL
            )
        `);

        // Create uuid-ossp extension for uuid_generate_v4
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "health_records"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "consultations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "pets"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
