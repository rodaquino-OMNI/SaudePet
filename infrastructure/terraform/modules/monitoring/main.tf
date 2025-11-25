# Monitoring Module for PetVet AI
# Creates CloudWatch dashboards, alarms, and log groups

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "petvet-alerts-${var.environment}"

  tags = {
    Name        = "petvet-alerts-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "PetVet-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      # WhatsApp Metrics Row
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# WhatsApp Handler Metrics"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["PetVet/WhatsApp", "WebhookCount", "Status", "Success"],
            [".", ".", ".", "Error"]
          ]
          title  = "Webhook Count"
          region = var.aws_region
          period = 60
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["PetVet/WhatsApp", "WebhookDuration"]
          ]
          title  = "Webhook Response Time"
          region = var.aws_region
          period = 60
          stat   = "Average"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["PetVet/WhatsApp", "MessageCount", "Direction", "inbound"],
            [".", ".", ".", "outbound"]
          ]
          title  = "Message Count"
          region = var.aws_region
          period = 300
          stat   = "Sum"
        }
      },

      # ECS Metrics Row
      {
        type   = "text"
        x      = 0
        y      = 7
        width  = 24
        height = 1
        properties = {
          markdown = "# ECS Service Metrics"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "petvet-whatsapp-${var.environment}", "ClusterName", "petvet-${var.environment}"],
            [".", ".", "ServiceName", "petvet-api-${var.environment}", "."],
            [".", ".", "ServiceName", "petvet-ai-${var.environment}", "."]
          ]
          title  = "ECS CPU Utilization"
          region = var.aws_region
          period = 60
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 8
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ServiceName", "petvet-whatsapp-${var.environment}", "ClusterName", "petvet-${var.environment}"],
            [".", ".", "ServiceName", "petvet-api-${var.environment}", "."],
            [".", ".", "ServiceName", "petvet-ai-${var.environment}", "."]
          ]
          title  = "ECS Memory Utilization"
          region = var.aws_region
          period = 60
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 8
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix]
          ]
          title  = "ALB Request Count"
          region = var.aws_region
          period = 60
          stat   = "Sum"
        }
      },

      # Business Metrics Row
      {
        type   = "text"
        x      = 0
        y      = 14
        width  = 24
        height = 1
        properties = {
          markdown = "# Business Metrics"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 15
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["PetVet/Business", "ConsultationCount", "Status", "Completed"],
            [".", ".", ".", "Abandoned"]
          ]
          title  = "Consultations"
          region = var.aws_region
          period = 3600
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 15
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["PetVet/AI", "LLMLatency", "Provider", "openai"],
            [".", ".", ".", "anthropic"]
          ]
          title  = "LLM Response Latency"
          region = var.aws_region
          period = 60
          stat   = "Average"
        }
      }
    ]
  })
}

# CloudWatch Alarms

# WhatsApp webhook high error rate
resource "aws_cloudwatch_metric_alarm" "whatsapp_errors" {
  alarm_name          = "petvet-${var.environment}-whatsapp-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "WebhookCount"
  namespace           = "PetVet/WhatsApp"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "WhatsApp webhook errors exceeded threshold"

  dimensions = {
    Status = "Error"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# WhatsApp webhook high latency
resource "aws_cloudwatch_metric_alarm" "whatsapp_latency" {
  alarm_name          = "petvet-${var.environment}-whatsapp-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "WebhookDuration"
  namespace           = "PetVet/WhatsApp"
  period              = 60
  statistic           = "Average"
  threshold           = 5000 # 5 seconds
  alarm_description   = "WhatsApp webhook latency exceeded 5 seconds"

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# ECS Service CPU alarm
resource "aws_cloudwatch_metric_alarm" "ecs_cpu" {
  for_each = toset(["whatsapp", "api", "ai"])

  alarm_name          = "petvet-${var.environment}-${each.key}-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "ECS ${each.key} service CPU exceeded 80%"

  dimensions = {
    ServiceName = "petvet-${each.key}-${var.environment}"
    ClusterName = "petvet-${var.environment}"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# ALB 5xx errors
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "petvet-${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "ALB 5xx errors exceeded threshold"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# RDS CPU alarm
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "petvet-${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU exceeded 80%"

  dimensions = {
    DBInstanceIdentifier = "petvet-${var.environment}"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# Redis memory alarm
resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "petvet-${var.environment}-redis-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Redis memory usage exceeded 80%"

  dimensions = {
    CacheClusterId = "petvet-${var.environment}"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}
