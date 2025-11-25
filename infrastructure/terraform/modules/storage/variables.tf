variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["https://petvet.ai", "https://*.petvet.ai"]
}
