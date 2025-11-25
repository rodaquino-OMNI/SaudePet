# Storage Module for PetVet AI
# Creates S3 buckets for media, documents, and backups

# KMS Key for encryption
resource "aws_kms_key" "main" {
  description             = "KMS key for PetVet ${var.environment}"
  deletion_window_in_days = var.environment == "production" ? 30 : 7
  enable_key_rotation     = true

  tags = {
    Name        = "petvet-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/petvet-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}

# Media bucket (pet photos, consultation images)
resource "aws_s3_bucket" "media" {
  bucket = "petvet-media-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "petvet-media-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Prescriptions bucket (PDF storage)
resource "aws_s3_bucket" "prescriptions" {
  bucket = "petvet-prescriptions-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "petvet-prescriptions-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "prescriptions" {
  bucket = aws_s3_bucket.prescriptions.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "prescriptions" {
  bucket = aws_s3_bucket.prescriptions.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "prescriptions" {
  bucket = aws_s3_bucket.prescriptions.id

  rule {
    id     = "retain-prescriptions"
    status = "Enabled"

    transition {
      days          = 365
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 1825 # 5 years
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "prescriptions" {
  bucket = aws_s3_bucket.prescriptions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Backups bucket
resource "aws_s3_bucket" "backups" {
  bucket = "petvet-backups-${var.environment}-${var.aws_account_id}"

  tags = {
    Name        = "petvet-backups-${var.environment}"
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "backup-retention"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = var.environment == "production" ? 2555 : 90 # 7 years for prod
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
