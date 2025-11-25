# ECS AI Services

# Service Discovery
resource "aws_service_discovery_service" "ai" {
  name = "ai"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# Target Group
resource "aws_lb_target_group" "ai" {
  name        = "petvet-ai-${var.environment}"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 10
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "petvet-ai-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Task Definition
resource "aws_ecs_task_definition" "ai" {
  family                   = "petvet-ai-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ai_cpu
  memory                   = var.ai_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "ai-services"
      image = "${var.ecr_repository_url}/petvet-ai:${var.image_tag}"

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "ENVIRONMENT", value = var.environment },
        { name = "PORT", value = "8000" },
        { name = "LOG_LEVEL", value = var.environment == "production" ? "INFO" : "DEBUG" }
      ]

      secrets = [
        { name = "OPENAI_API_KEY", valueFrom = "${var.llm_secrets_arn}:openai_api_key::" },
        { name = "ANTHROPIC_API_KEY", valueFrom = "${var.llm_secrets_arn}:anthropic_api_key::" },
        { name = "REDIS_URL", valueFrom = var.redis_url_secret_arn }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ai.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ai"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }
    }
  ])

  tags = {
    Name        = "petvet-ai-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# ECS Service
resource "aws_ecs_service" "ai" {
  name            = "petvet-ai-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ai.arn
  desired_count   = var.ai_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.ai.arn
  }

  deployment_configuration {
    minimum_healthy_percent = 100
    maximum_percent         = 200
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Name        = "petvet-ai-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Auto Scaling
resource "aws_appautoscaling_target" "ai" {
  max_capacity       = var.ai_max_count
  min_capacity       = var.ai_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.ai.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ai_cpu" {
  name               = "ai-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ai.resource_id
  scalable_dimension = aws_appautoscaling_target.ai.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ai.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
