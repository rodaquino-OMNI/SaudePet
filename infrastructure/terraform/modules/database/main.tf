# Database Module for PetVet AI
# Creates PostgreSQL RDS and Redis ElastiCache

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "petvet-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "petvet-rds-${var.environment}"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  tags = {
    Name        = "petvet-rds-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "petvet-${var.environment}"

  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_storage_size
  max_allocated_storage = var.db_max_storage_size
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = "petvet"
  username = var.db_username
  password = var.db_password

  multi_az               = var.environment == "production"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "petvet-${var.environment}-final" : null
  deletion_protection     = var.environment == "production"

  performance_insights_enabled          = true
  performance_insights_retention_period = var.environment == "production" ? 7 : 7

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "petvet-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name        = "petvet-redis-${var.environment}"
  description = "Security group for Redis ElastiCache"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  tags = {
    Name        = "petvet-redis-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# Redis Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  name   = "petvet-redis-${var.environment}"
  family = "redis7"

  # Optimize for session storage
  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }

  tags = {
    Name        = "petvet-redis-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

# ElastiCache Redis Replication Group
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "petvet-${var.environment}"
  description          = "Redis for PetVet WhatsApp sessions and cache"

  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = var.environment == "production"

  parameter_group_name = aws_elasticache_parameter_group.main.name

  snapshot_retention_limit = var.environment == "production" ? 7 : 1
  snapshot_window          = "02:00-03:00"

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}
