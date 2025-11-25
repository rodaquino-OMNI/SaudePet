#!/bin/bash

# PetVet Development Data Seeding Script
# Creates sample data for development and testing

set -e

echo "🌱 PetVet Development Data Seeder"
echo "=================================="

DATABASE_URL="${DATABASE_URL:-postgresql://petvet:petvet123@localhost:5432/petvet_dev}"

# Seed data using psql
seed_database() {
    echo "📊 Seeding database with sample data..."

    psql "$DATABASE_URL" << 'EOF'

-- Insert sample admin user
INSERT INTO admins (id, email, name, password_hash, role, created_at, updated_at)
VALUES (
    'admin-001',
    'admin@petvet.ai',
    'Admin PetVet',
    '$2b$10$example_hash_for_password_admin123',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, phone_number, name, email, subscription_tier, created_at, updated_at)
VALUES
    ('user-001', '+5511999990001', 'Maria Silva', 'maria@example.com', 'premium', NOW() - INTERVAL '30 days', NOW()),
    ('user-002', '+5511999990002', 'João Santos', 'joao@example.com', 'basic', NOW() - INTERVAL '20 days', NOW()),
    ('user-003', '+5511999990003', 'Ana Oliveira', 'ana@example.com', 'free', NOW() - INTERVAL '10 days', NOW()),
    ('user-004', '+5511999990004', 'Pedro Costa', NULL, 'free', NOW() - INTERVAL '5 days', NOW()),
    ('user-005', '+5511999990005', 'Lucia Ferreira', 'lucia@example.com', 'premium', NOW() - INTERVAL '45 days', NOW())
ON CONFLICT (phone_number) DO NOTHING;

-- Insert sample pets
INSERT INTO pets (id, user_id, name, species, breed, birth_date, weight, created_at, updated_at)
VALUES
    ('pet-001', 'user-001', 'Rex', 'dog', 'Golden Retriever', '2020-03-15', 32.5, NOW(), NOW()),
    ('pet-002', 'user-001', 'Mia', 'cat', 'Siamese', '2021-07-20', 4.2, NOW(), NOW()),
    ('pet-003', 'user-002', 'Thor', 'dog', 'German Shepherd', '2019-11-10', 38.0, NOW(), NOW()),
    ('pet-004', 'user-003', 'Luna', 'cat', 'Persian', '2022-01-05', 5.1, NOW(), NOW()),
    ('pet-005', 'user-004', 'Bob', 'dog', 'Bulldog', '2021-04-12', 25.0, NOW(), NOW()),
    ('pet-006', 'user-005', 'Nina', 'dog', 'Poodle', '2018-08-30', 8.5, NOW(), NOW()),
    ('pet-007', 'user-005', 'Piu', 'bird', 'Canary', '2022-05-01', 0.025, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample consultations
INSERT INTO consultations (id, user_id, pet_id, status, symptoms, diagnosis, treatment, created_at, completed_at)
VALUES
    ('cons-001', 'user-001', 'pet-001', 'completed',
     '["Coçando muito", "Perda de pelo", "Vermelhidão na pele"]',
     '{"condition": "Dermatite alérgica", "severity": "moderate", "confidence": 0.85}',
     '{"recommendations": ["Banho com shampoo hipoalergênico", "Evitar alérgenos conhecidos"], "medication": "Prednisolona 5mg", "followUp": "7 dias"}',
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

    ('cons-002', 'user-001', 'pet-002', 'completed',
     '["Vomitando", "Não quer comer", "Apatia"]',
     '{"condition": "Gastrite", "severity": "low", "confidence": 0.78}',
     '{"recommendations": ["Dieta leve por 48h", "Água fresca disponível"], "medication": "Omeprazol 10mg", "followUp": "3 dias"}',
     NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

    ('cons-003', 'user-002', 'pet-003', 'completed',
     '["Mancando", "Dificuldade para levantar"]',
     '{"condition": "Displasia coxofemoral", "severity": "high", "confidence": 0.72}',
     '{"recommendations": ["Repouso", "Evitar escadas", "Consultar veterinário presencial"], "urgency": "Alta"}',
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

    ('cons-004', 'user-003', 'pet-004', 'in_progress',
     '["Espirros frequentes", "Secreção nasal"]',
     NULL, NULL,
     NOW() - INTERVAL '1 hour', NULL),

    ('cons-005', 'user-005', 'pet-006', 'completed',
     '["Tremores", "Ansiedade", "Escondendo"]',
     '{"condition": "Fobia de barulhos", "severity": "moderate", "confidence": 0.90}',
     '{"recommendations": ["Ambiente calmo durante fogos", "Música ambiente", "Considerar ansiolítico"], "followUp": "Conforme necessidade"}',
     NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (id, user_id, tier, status, monthly_consultations, consultations_used, current_period_start, current_period_end, created_at, updated_at)
VALUES
    ('sub-001', 'user-001', 'premium', 'active', 20, 2, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW() - INTERVAL '45 days', NOW()),
    ('sub-002', 'user-002', 'basic', 'active', 10, 1, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW() - INTERVAL '40 days', NOW()),
    ('sub-003', 'user-003', 'free', 'active', 3, 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW() - INTERVAL '10 days', NOW()),
    ('sub-004', 'user-004', 'free', 'active', 3, 0, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW() - INTERVAL '5 days', NOW()),
    ('sub-005', 'user-005', 'premium', 'active', 20, 3, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', NOW() - INTERVAL '50 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample health records
INSERT INTO health_records (id, pet_id, record_type, description, date, created_at)
VALUES
    ('hr-001', 'pet-001', 'vaccine', 'V10 - Vacina polivalente', NOW() - INTERVAL '60 days', NOW()),
    ('hr-002', 'pet-001', 'vaccine', 'Antirrábica', NOW() - INTERVAL '30 days', NOW()),
    ('hr-003', 'pet-002', 'vaccine', 'V4 Felina', NOW() - INTERVAL '45 days', NOW()),
    ('hr-004', 'pet-003', 'exam', 'Raio-X quadril', NOW() - INTERVAL '2 days', NOW()),
    ('hr-005', 'pet-006', 'medication', 'Vermífugo semestral', NOW() - INTERVAL '90 days', NOW())
ON CONFLICT (id) DO NOTHING;

EOF

    echo "✅ Database seeded successfully!"
}

# Print sample credentials
print_credentials() {
    echo ""
    echo "📝 Sample Credentials"
    echo "===================="
    echo ""
    echo "Admin Dashboard:"
    echo "  Email: admin@petvet.ai"
    echo "  Password: admin123"
    echo ""
    echo "Sample WhatsApp Users (phone numbers):"
    echo "  +55 11 99999-0001 (Maria - Premium)"
    echo "  +55 11 99999-0002 (João - Basic)"
    echo "  +55 11 99999-0003 (Ana - Free)"
    echo ""
}

# Main execution
main() {
    seed_database
    print_credentials
}

main "$@"
