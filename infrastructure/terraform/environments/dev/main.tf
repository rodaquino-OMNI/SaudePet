# PetVet AI - Development Environment
# This configuration creates all infrastructure for the dev environment

terraform {
  backend "s3" {
    bucket         = "petvet-terraform-state"
    key            = "dev/terraform.tfstate"
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
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

# Networking
module "networking" {
  source = "../../modules/networking"

  environment = "dev"
  vpc_cidr    = "10.0.0.0/16"
}

# Database
module "database" {
  source = "../../modules/database"

  environment           = "dev"
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id

  db_instance_class = "db.t4g.small"
  db_storage_size   = 20
  db_username       = var.db_username
  db_password       = var.db_password
  redis_node_type   = "cache.t4g.micro"
}

# Storage
module "storage" {
  source = "../../modules/storage"

  environment    = "dev"
  aws_account_id = data.aws_caller_identity.current.account_id

  allowed_origins = [
    "http://localhost:*",
    "https://dev.petvet.ai",
    "https://dev-*.petvet.ai"
  ]
}

# Secrets
resource "aws_secretsmanager_secret" "whatsapp" {
  name = "petvet/dev/whatsapp"
}

resource "aws_secretsmanager_secret" "app" {
  name = "petvet/dev/app"
}

resource "aws_secretsmanager_secret" "llm" {
  name = "petvet/dev/llm"
}

resource "aws_secretsmanager_secret" "database_url" {
  name = "petvet/dev/database-url"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = module.database.database_url
}

resource "aws_secretsmanager_secret" "redis_url" {
  name = "petvet/dev/redis-url"
}

resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = module.database.redis_url
}

# ACM Certificate (for dev, you might use a wildcard cert or self-signed)
data "aws_acm_certificate" "main" {
  domain   = "*.petvet.ai"
  statuses = ["ISSUED"]
}

# Compute
module "compute" {
  source = "../../modules/compute"

  environment           = "dev"
  aws_region            = var.aws_region
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  ecs_security_group_id = module.networking.ecs_security_group_id

  certificate_arn    = data.aws_acm_certificate.main.arn
  ecr_repository_url = var.ecr_repository_url
  image_tag          = var.image_tag

  # Dev sizing (smaller instances)
  whatsapp_cpu           = 256
  whatsapp_memory        = 512
  whatsapp_desired_count = 1
  whatsapp_min_count     = 1
  whatsapp_max_count     = 2

  api_cpu           = 256
  api_memory        = 512
  api_desired_count = 1
  api_min_count     = 1
  api_max_count     = 2

  ai_cpu           = 512
  ai_memory        = 1024
  ai_desired_count = 1
  ai_min_count     = 1
  ai_max_count     = 2

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

  environment    = "dev"
  aws_region     = var.aws_region
  alb_arn_suffix = module.compute.alb_arn
}
