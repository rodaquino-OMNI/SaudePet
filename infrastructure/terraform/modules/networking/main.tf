# VPC Module for PetVet AI
# Creates VPC with public/private subnets optimized for WhatsApp webhooks

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "petvet-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  enable_dns_hostnames   = true
  enable_dns_support     = true

  # Tags for ECS/ALB integration
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
    "Type"                   = "public"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
    "Type"                            = "private"
  }

  tags = {
    Project     = "petvet"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Security group for WhatsApp webhook (public facing)
resource "aws_security_group" "whatsapp_webhook" {
  name        = "petvet-whatsapp-webhook-${var.environment}"
  description = "Security group for WhatsApp webhook endpoint"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTPS from anywhere (Cloudflare handles DDoS)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "petvet-whatsapp-webhook-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Security group for ALB
resource "aws_security_group" "alb" {
  name        = "petvet-alb-${var.environment}"
  description = "Security group for Application Load Balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP for redirect"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "petvet-alb-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Security group for ECS services
resource "aws_security_group" "ecs_services" {
  name        = "petvet-ecs-services-${var.environment}"
  description = "Security group for ECS services"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Traffic from ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description = "Traffic from within VPC"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "petvet-ecs-services-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}
