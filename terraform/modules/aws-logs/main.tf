/**
 * Module that sets up a single S3 bucket storing logs from various AWS services.
 * Logs will expire after a default of 90 days.
 *
 * The following services are supported:
 *  * CloudTrail
 *  * ELB
 *  * RedShift
 *
 * Usage:
 *
 *     module "aws_logs" {
 *       source         = "../modules/aws_logs"
 *       s3_bucket_name = "truss-aws-logs"
 *       region         = "us-west-2"
 *       expiration     = 90
 *     }
 *
 */

variable "s3_bucket_name" {
  description = "The name of the s3 bucket that will be used for AWS logs"
  type        = "string"
}

variable "region" {
  description = "The region where the AWS S3 bucket will be created"
  type        = "string"
}

variable "expiration" {
  description = "The number of days to keep AWS logs around"
  default     = 90
}

variable "elb_logs_prefix" {
  description = "The S3 prefix for ELB logs"
  default     = "elb"
  type        = "string"
}

variable "cloudtrail_logs_prefix" {
  description = "The S3 prefix for CloudTrail logs"
  default     = "cloudtrail"
  type        = "string"
}

variable "redshift_logs_prefix" {
  description = "The S3 prefix for RedShift logs"
  default     = "redshift"
  type        = "string"
}

variable "enable_cloudtrail" {
  description = "Enable CloudTrail logs"
  default     = true
}

// get the account id of the AWS ELB service account in a given region for the
// purpose of whitelisting in a S3 bucket policy.
data "aws_elb_service_account" "main" {}

// get the account id of the RedShift service account in a given region for
// the purpose of allowing RedShift to store audit data in S3.
data "aws_redshift_service_account" "main" {}

// JSON template defining all the access controls to allow
// AWS services to write to this bucket
data "template_file" "aws_logs_policy" {
  template = "${file("${path.module}/aws-logs-policy.json")}"

  vars = {
    bucket_name             = "${var.s3_bucket_name}"
    elb_log_account_arn     = "${data.aws_elb_service_account.main.arn}"
    redshift_log_account_id = "${data.aws_redshift_service_account.main.id}"
    elb_logs_prefix         = "${var.elb_logs_prefix}"
    redshift_logs_prefix    = "${var.redshift_logs_prefix}"
    cloudtrail_logs_prefix  = "${var.cloudtrail_logs_prefix}"
  }
}

resource "aws_s3_bucket" "aws_logs" {
  bucket = "${var.s3_bucket_name}"
  region = "${var.region}"
  policy = "${data.template_file.aws_logs_policy.rendered}"

  lifecycle_rule {
    id      = "expire_all_logs"
    prefix  = "/*"
    enabled = true

    expiration {
      days = "${var.expiration}"
    }
  }

  tags {
    Name = "${var.s3_bucket_name}"
  }
}

resource "aws_cloudtrail" "cloudtrail" {
  count          = "${var.enable_cloudtrail ? 1 : 0}"
  name           = "${var.cloudtrail_logs_prefix}"
  s3_key_prefix  = "${var.cloudtrail_logs_prefix}"
  s3_bucket_name = "${var.s3_bucket_name}"

  // use a single s3 bucket for all aws regions
  is_multi_region_trail = true

  // enable log file validation to detect tampering
  enable_log_file_validation = true
  depends_on                 = ["aws_s3_bucket.aws_logs"]
}

// AWS logs S3 bucket name
output "aws_logs_bucket" {
  value = "${aws_s3_bucket.aws_logs.id}"
}

// S3 path for cloudtrail logs
output "cloudtrail_logs_path" {
  value = "${aws_s3_bucket.aws_logs.id}/${cloudtrail_logs_prefix}/"
}

// S3 path for ELB logs
output "elb_logs_path" {
  value = "${aws_s3_bucket.aws_logs.id}/${elb_logs_prefix}/"
}

// S3 path for RedShift logs
output "redshift_logs_path" {
  value = "${aws_s3_bucket.aws_logs.id}/${redshift_logs_prefix}/"
}
