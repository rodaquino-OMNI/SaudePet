output "media_bucket_id" {
  description = "Media bucket ID"
  value       = aws_s3_bucket.media.id
}

output "media_bucket_arn" {
  description = "Media bucket ARN"
  value       = aws_s3_bucket.media.arn
}

output "media_bucket_domain_name" {
  description = "Media bucket domain name"
  value       = aws_s3_bucket.media.bucket_regional_domain_name
}

output "prescriptions_bucket_id" {
  description = "Prescriptions bucket ID"
  value       = aws_s3_bucket.prescriptions.id
}

output "prescriptions_bucket_arn" {
  description = "Prescriptions bucket ARN"
  value       = aws_s3_bucket.prescriptions.arn
}

output "backups_bucket_id" {
  description = "Backups bucket ID"
  value       = aws_s3_bucket.backups.id
}

output "backups_bucket_arn" {
  description = "Backups bucket ARN"
  value       = aws_s3_bucket.backups.arn
}

output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}
