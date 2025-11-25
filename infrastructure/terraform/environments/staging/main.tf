# PetVet AI - Staging Environment
# This configuration creates all infrastructure for the staging environment

terraform {
  backend "s3" {
    bucket         = "petvet-terraform-state"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "petvet-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "petvet"
      Environment = "staging"
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

# Networking
module "networking" {
  source = "../../modules/networking"

  environment = "staging"
  vpc_cidr    = "10.1.0.0/16"
}

# Database
module "database" {
  source = "../../modules/database"

  environment           = "staging"
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id

  db_instance_class = "db.t4g.medium"
  db_storage_size   = 50
  db_username       = var.db_username
  db_password       = var.db_password
  redis_node_type   = "cache.t4g.small"
}

# Storage
module "storage" {
  source = "../../modules/storage"

  environment    = "staging"
  aws_account_id = data.aws_caller_identity.current.account_id

  allowed_origins = [
    "https://staging.petvet.ai",
    "https://staging-*.petvet.ai"
  ]
}

# Secrets
resource "aws_secretsmanager_secret" "whatsapp" {
  name = "petvet/staging/whatsapp"
}

resource "aws_secretsmanager_secret" "app" {
  name = "petvet/staging/app"
}

resource "aws_secretsmanager_secret" "llm" {
  name = "petvet/staging/llm"
}

resource "aws_secretsmanager_secret" "database_url" {
  name = "petvet/staging/database-url"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = module.database.database_url
}

resource "aws_secretsmanager_secret" "redis_url" {
  name = "petvet/staging/redis-url"
}

resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = module.database.redis_url
}

# ACM Certificate
data "aws_acm_certificate" "main" {
  domain   = "*.petvet.ai"
  statuses = ["ISSUED"]
}

# Compute
module "compute" {
  source = "../../modules/compute"

  environment           = "staging"
  aws_region            = var.aws_region
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  ecs_security_group_id = module.networking.ecs_security_group_id

  certificate_arn    = data.aws_acm_certificate.main.arn
  ecr_repository_url = var.ecr_repository_url
  image_tag          = var.image_tag

  # Staging sizing (moderate instances)
  whatsapp_cpu           = 512
  whatsapp_memory        = 1024
  whatsapp_desired_count = 2
  whatsapp_min_count     = 1
  whatsapp_max_count     = 4

  api_cpu           = 512
  api_memory        = 1024
  api_desired_count = 2
  api_min_count     = 1
  api_max_count     = 4

  ai_cpu           = 1024
  ai_memory        = 2048
  ai_desired_count = 2
  ai_min_count     = 1
  ai_max_count     = 4

  # Secrets
  whatsapp_secrets_arn    = aws_secretsmanager_secret.whatsapp.arn
  app_secrets_arn         = aws_secretsmanager_secret.app.arn
  llm_secrets_arn         = aws_secretsmanager_secret.llm.arn
  database_url_secret_arn = aws_secretsmanager_secret.database_url.arn
  redis_url_secret_arn    = aws_secretsmanager_secret.redis_url.arn

  # S3 buckets
  media_bucket_arn         = module.storage.media_bucket_arn
  prescriptions_bucket_arn = module.storage.prescriptions_bucket_arn
}

# Monitoring
module "monitoring" {
  source = "../../modules/monitoring"

  environment    = "staging"
  aws_region     = var.aws_region
  alb_arn_suffix = module.compute.alb_arn
}
