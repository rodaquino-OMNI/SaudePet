# Compute Module for PetVet AI
# Creates ECS Cluster, Services, and ALB

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "petvet-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = var.environment == "production" ? "FARGATE" : "FARGATE_SPOT"
  }
}

# Service Discovery Namespace
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.environment}.petvet.local"
  description = "Private DNS namespace for PetVet services"
  vpc         = var.vpc_id

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "petvet-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# HTTP to HTTPS redirect
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "whatsapp" {
  name              = "/ecs/petvet-whatsapp-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/petvet-api-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "ai" {
  name              = "/ecs/petvet-ai-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}
