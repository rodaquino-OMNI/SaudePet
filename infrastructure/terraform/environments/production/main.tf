# PetVet AI - Production Environment
# This configuration creates all infrastructure for the production environment
# Features: Multi-AZ, enhanced monitoring, blue-green deployment support

terraform {
  backend "s3" {
    bucket         = "petvet-terraform-state"
    key            = "production/terraform.tfstate"
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
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

# Networking with Multi-AZ
module "networking" {
  source = "../../modules/networking"

  environment        = "production"
  vpc_cidr           = "10.2.0.0/16"
  enable_nat_gateway = true
  single_nat_gateway = false  # Multi-AZ NAT for high availability
}

# Database with Multi-AZ
module "database" {
  source = "../../modules/database"

  environment           = "production"
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id

  db_instance_class     = "db.r6g.large"
  db_storage_size       = 100
  db_username           = var.db_username
  db_password           = var.db_password
  db_multi_az           = true
  db_backup_retention   = 7
  db_deletion_protection = true

  redis_node_type        = "cache.r6g.large"
  redis_num_cache_nodes  = 2
  redis_automatic_failover = true
}

# Storage with versioning and lifecycle
module "storage" {
  source = "../../modules/storage"

  environment    = "production"
  aws_account_id = data.aws_caller_identity.current.account_id

  allowed_origins = [
    "https://petvet.ai",
    "https://www.petvet.ai",
    "https://api.petvet.ai"
  ]

  enable_versioning = true
}

# KMS Key for encryption
resource "aws_kms_key" "main" {
  description             = "PetVet production encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "petvet-production-key"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/petvet-production"
  target_key_id = aws_kms_key.main.key_id
}

# Secrets
resource "aws_secretsmanager_secret" "whatsapp" {
  name       = "petvet/production/whatsapp"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret" "app" {
  name       = "petvet/production/app"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret" "llm" {
  name       = "petvet/production/llm"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret" "stripe" {
  name       = "petvet/production/stripe"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret" "database_url" {
  name       = "petvet/production/database-url"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = module.database.database_url
}

resource "aws_secretsmanager_secret" "redis_url" {
  name       = "petvet/production/redis-url"
  kms_key_id = aws_kms_key.main.arn
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

# Compute with Blue-Green deployment support
module "compute" {
  source = "../../modules/compute"

  environment           = "production"
  aws_region            = var.aws_region
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  ecs_security_group_id = module.networking.ecs_security_group_id

  certificate_arn    = data.aws_acm_certificate.main.arn
  ecr_repository_url = var.ecr_repository_url
  image_tag          = var.image_tag

  # Production sizing (high availability)
  whatsapp_cpu           = 1024
  whatsapp_memory        = 2048
  whatsapp_desired_count = 3
  whatsapp_min_count     = 2
  whatsapp_max_count     = 10

  api_cpu           = 1024
  api_memory        = 2048
  api_desired_count = 3
  api_min_count     = 2
  api_max_count     = 10

  ai_cpu           = 2048
  ai_memory        = 4096
  ai_desired_count = 3
  ai_min_count     = 2
  ai_max_count     = 10

  # Enable blue-green deployment
  enable_blue_green = true

  # Secrets
  whatsapp_secrets_arn    = aws_secretsmanager_secret.whatsapp.arn
  app_secrets_arn         = aws_secretsmanager_secret.app.arn
  llm_secrets_arn         = aws_secretsmanager_secret.llm.arn
  stripe_secrets_arn      = aws_secretsmanager_secret.stripe.arn
  database_url_secret_arn = aws_secretsmanager_secret.database_url.arn
  redis_url_secret_arn    = aws_secretsmanager_secret.redis_url.arn

  # S3 buckets
  media_bucket_arn         = module.storage.media_bucket_arn
  prescriptions_bucket_arn = module.storage.prescriptions_bucket_arn
}

# Monitoring with enhanced alerting
module "monitoring" {
  source = "../../modules/monitoring"

  environment    = "production"
  aws_region     = var.aws_region
  alb_arn_suffix = module.compute.alb_arn

  # Enable PagerDuty integration
  enable_pagerduty        = true
  pagerduty_endpoint      = var.pagerduty_endpoint

  # Lower thresholds for production
  error_threshold         = 5
  latency_threshold_ms    = 3000
  cpu_threshold_percent   = 70
}

# WAF for additional security
resource "aws_wafv2_web_acl" "main" {
  name        = "petvet-production-waf"
  description = "WAF rules for PetVet production"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled  = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled  = true
    }
  }

  rule {
    name     = "RateLimitRule"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "RateLimitRuleMetric"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "petvet-production-waf"
    sampled_requests_enabled  = true
  }

  tags = {
    Name = "petvet-production-waf"
  }
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = module.compute.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
