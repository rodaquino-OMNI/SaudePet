variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS services"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

# WhatsApp Handler configuration
variable "whatsapp_cpu" {
  description = "CPU units for WhatsApp handler"
  type        = number
  default     = 512
}

variable "whatsapp_memory" {
  description = "Memory for WhatsApp handler"
  type        = number
  default     = 1024
}

variable "whatsapp_desired_count" {
  description = "Desired count for WhatsApp handler"
  type        = number
  default     = 2
}

variable "whatsapp_min_count" {
  description = "Min count for WhatsApp handler auto scaling"
  type        = number
  default     = 2
}

variable "whatsapp_max_count" {
  description = "Max count for WhatsApp handler auto scaling"
  type        = number
  default     = 10
}

# API configuration
variable "api_cpu" {
  description = "CPU units for API"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Memory for API"
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Desired count for API"
  type        = number
  default     = 2
}

variable "api_min_count" {
  description = "Min count for API auto scaling"
  type        = number
  default     = 2
}

variable "api_max_count" {
  description = "Max count for API auto scaling"
  type        = number
  default     = 10
}

# AI Services configuration
variable "ai_cpu" {
  description = "CPU units for AI services"
  type        = number
  default     = 1024
}

variable "ai_memory" {
  description = "Memory for AI services"
  type        = number
  default     = 2048
}

variable "ai_desired_count" {
  description = "Desired count for AI services"
  type        = number
  default     = 2
}

variable "ai_min_count" {
  description = "Min count for AI services auto scaling"
  type        = number
  default     = 2
}

variable "ai_max_count" {
  description = "Max count for AI services auto scaling"
  type        = number
  default     = 10
}

# Secrets ARNs
variable "whatsapp_secrets_arn" {
  description = "ARN of WhatsApp secrets in Secrets Manager"
  type        = string
}

variable "app_secrets_arn" {
  description = "ARN of app secrets in Secrets Manager"
  type        = string
}

variable "llm_secrets_arn" {
  description = "ARN of LLM secrets in Secrets Manager"
  type        = string
}

variable "database_url_secret_arn" {
  description = "ARN of database URL secret"
  type        = string
}

variable "redis_url_secret_arn" {
  description = "ARN of Redis URL secret"
  type        = string
}

# S3 Bucket ARNs
variable "media_bucket_arn" {
  description = "ARN of media S3 bucket"
  type        = string
}

variable "prescriptions_bucket_arn" {
  description = "ARN of prescriptions S3 bucket"
  type        = string
}
