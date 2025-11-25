# ECS WhatsApp Handler Service

# Service Discovery
resource "aws_service_discovery_service" "whatsapp" {
  name = "whatsapp-handler"

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
resource "aws_lb_target_group" "whatsapp" {
  name        = "petvet-whatsapp-${var.environment}"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 15
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  deregistration_delay = 30

  tags = {
    Name        = "petvet-whatsapp-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Listener Rule for WhatsApp webhook
resource "aws_lb_listener_rule" "whatsapp" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.whatsapp.arn
  }

  condition {
    path_pattern {
      values = ["/webhooks/whatsapp", "/webhooks/whatsapp/*"]
    }
  }
}

# Task Definition
resource "aws_ecs_task_definition" "whatsapp" {
  family                   = "petvet-whatsapp-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.whatsapp_cpu
  memory                   = var.whatsapp_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "whatsapp-handler"
      image = "${var.ecr_repository_url}/petvet-whatsapp:${var.image_tag}"

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "PORT", value = "3001" },
        { name = "API_URL", value = "http://api.${var.environment}.petvet.local:3000" },
        { name = "AI_SERVICES_URL", value = "http://ai.${var.environment}.petvet.local:8000" }
      ]

      secrets = [
        { name = "WHATSAPP_VERIFY_TOKEN", valueFrom = "${var.whatsapp_secrets_arn}:verify_token::" },
        { name = "WHATSAPP_ACCESS_TOKEN", valueFrom = "${var.whatsapp_secrets_arn}:access_token::" },
        { name = "WHATSAPP_PHONE_NUMBER_ID", valueFrom = "${var.whatsapp_secrets_arn}:phone_number_id::" },
        { name = "WHATSAPP_APP_SECRET", valueFrom = "${var.whatsapp_secrets_arn}:app_secret::" },
        { name = "REDIS_URL", valueFrom = var.redis_url_secret_arn }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.whatsapp.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "whatsapp"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "petvet-whatsapp-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# ECS Service
resource "aws_ecs_service" "whatsapp" {
  name            = "petvet-whatsapp-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.whatsapp.arn
  desired_count   = var.whatsapp_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.whatsapp.arn
    container_name   = "whatsapp-handler"
    container_port   = 3001
  }

  service_registries {
    registry_arn = aws_service_discovery_service.whatsapp.arn
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
    Name        = "petvet-whatsapp-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Auto Scaling
resource "aws_appautoscaling_target" "whatsapp" {
  max_capacity       = var.whatsapp_max_count
  min_capacity       = var.whatsapp_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.whatsapp.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "whatsapp_cpu" {
  name               = "whatsapp-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.whatsapp.resource_id
  scalable_dimension = aws_appautoscaling_target.whatsapp.scalable_dimension
  service_namespace  = aws_appautoscaling_target.whatsapp.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 60.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "whatsapp_memory" {
  name               = "whatsapp-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.whatsapp.resource_id
  scalable_dimension = aws_appautoscaling_target.whatsapp.scalable_dimension
  service_namespace  = aws_appautoscaling_target.whatsapp.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
