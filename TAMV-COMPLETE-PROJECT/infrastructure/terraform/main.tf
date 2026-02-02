# TAMV Production Infrastructure
# Terraform Configuration for Complete Deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Provider Configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "TAMV"
      Environment = var.environment
      Owner       = "Edwin Oswaldo Castillo Trejo"
      Purpose     = "Civilizational Architecture"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for TAMV deployment"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "tamv-production"
}

# VPC Configuration
resource "aws_vpc" "tamv_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "tamv-vpc"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "tamv_igw" {
  vpc_id = aws_vpc.tamv_vpc.id

  tags = {
    Name = "tamv-igw"
  }
}

# Subnets for Multi-AZ deployment
resource "aws_subnet" "tamv_subnet_public" {
  count = 3

  vpc_id                  = aws_vpc.tamv_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "tamv-public-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_subnet" "tamv_subnet_private" {
  count = 3

  vpc_id            = aws_vpc.tamv_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "tamv-private-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# NAT Gateways for private subnets
resource "aws_eip" "tamv_nat_eip" {
  count = 3
  domain = "vpc"

  tags = {
    Name = "tamv-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "tamv_nat" {
  count = 3

  allocation_id = aws_eip.tamv_nat_eip[count.index].id
  subnet_id     = aws_subnet.tamv_subnet_public[count.index].id

  tags = {
    Name = "tamv-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.tamv_igw]
}

# Route Tables
resource "aws_route_table" "tamv_public_rt" {
  vpc_id = aws_vpc.tamv_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.tamv_igw.id
  }

  tags = {
    Name = "tamv-public-rt"
  }
}

resource "aws_route_table" "tamv_private_rt" {
  count = 3

  vpc_id = aws_vpc.tamv_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.tamv_nat[count.index].id
  }

  tags = {
    Name = "tamv-private-rt-${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "tamv_public_rta" {
  count = 3

  subnet_id      = aws_subnet.tamv_subnet_public[count.index].id
  route_table_id = aws_route_table.tamv_public_rt.id
}

resource "aws_route_table_association" "tamv_private_rta" {
  count = 3

  subnet_id      = aws_subnet.tamv_subnet_private[count.index].id
  route_table_id = aws_route_table.tamv_private_rt[count.index].id
}

# Security Groups
resource "aws_security_group" "tamv_cluster_sg" {
  name_prefix = "tamv-cluster-sg"
  vpc_id      = aws_vpc.tamv_vpc.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "XR/VR Traffic"
    from_port   = 8080
    to_port     = 8090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Quantum Computing Ports"
    from_port   = 9000
    to_port     = 9010
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "tamv-cluster-sg"
  }
}

# IAM Roles for EKS
resource "aws_iam_role" "tamv_cluster_role" {
  name = "tamv-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "tamv_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.tamv_cluster_role.name
}

resource "aws_iam_role" "tamv_node_role" {
  name = "tamv-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "tamv_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.tamv_node_role.name
}

resource "aws_iam_role_policy_attachment" "tamv_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.tamv_node_role.name
}

resource "aws_iam_role_policy_attachment" "tamv_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.tamv_node_role.name
}

# EKS Cluster
resource "aws_eks_cluster" "tamv_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.tamv_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = concat(aws_subnet.tamv_subnet_public[*].id, aws_subnet.tamv_subnet_private[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.tamv_cluster_sg.id]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.tamv_cluster_policy,
  ]

  tags = {
    Name = "tamv-production-cluster"
  }
}

# EKS Node Groups
resource "aws_eks_node_group" "tamv_quantum_nodes" {
  cluster_name    = aws_eks_cluster.tamv_cluster.name
  node_group_name = "tamv-quantum-nodes"
  node_role_arn   = aws_iam_role.tamv_node_role.arn
  subnet_ids      = aws_subnet.tamv_subnet_private[*].id

  instance_types = ["c5.4xlarge", "p3.2xlarge"] # CPU + GPU for quantum simulation
  ami_type       = "AL2_x86_64_GPU"
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "quantum-processing"
    tier = "compute"
  }

  tags = {
    Name = "tamv-quantum-nodes"
  }

  depends_on = [
    aws_iam_role_policy_attachment.tamv_worker_node_policy,
    aws_iam_role_policy_attachment.tamv_cni_policy,
    aws_iam_role_policy_attachment.tamv_registry_policy,
  ]
}

resource "aws_eks_node_group" "tamv_xr_nodes" {
  cluster_name    = aws_eks_cluster.tamv_cluster.name
  node_group_name = "tamv-xr-nodes"
  node_role_arn   = aws_iam_role.tamv_node_role.arn
  subnet_ids      = aws_subnet.tamv_subnet_private[*].id

  instance_types = ["g4dn.2xlarge", "g4dn.4xlarge"] # GPU-optimized for XR rendering
  ami_type       = "AL2_x86_64_GPU"
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 5
    max_size     = 20
    min_size     = 2
  }

  update_config {
    max_unavailable = 2
  }

  labels = {
    role = "xr-rendering"
    tier = "graphics"
  }

  tags = {
    Name = "tamv-xr-nodes"
  }

  depends_on = [
    aws_iam_role_policy_attachment.tamv_worker_node_policy,
    aws_iam_role_policy_attachment.tamv_cni_policy,
    aws_iam_role_policy_attachment.tamv_registry_policy,
  ]
}

resource "aws_eks_node_group" "tamv_general_nodes" {
  cluster_name    = aws_eks_cluster.tamv_cluster.name
  node_group_name = "tamv-general-nodes"
  node_role_arn   = aws_iam_role.tamv_node_role.arn
  subnet_ids      = aws_subnet.tamv_subnet_private[*].id

  instance_types = ["m5.2xlarge", "m5.4xlarge"] # General purpose
  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 6
    max_size     = 30
    min_size     = 3
  }

  update_config {
    max_unavailable = 3
  }

  labels = {
    role = "general-workload"
    tier = "application"
  }

  tags = {
    Name = "tamv-general-nodes"
  }

  depends_on = [
    aws_iam_role_policy_attachment.tamv_worker_node_policy,
    aws_iam_role_policy_attachment.tamv_cni_policy,
    aws_iam_role_policy_attachment.tamv_registry_policy,
  ]
}

# RDS for PostgreSQL (Primary Database)
resource "aws_db_subnet_group" "tamv_db_subnet_group" {
  name       = "tamv-db-subnet-group"
  subnet_ids = aws_subnet.tamv_subnet_private[*].id

  tags = {
    Name = "tamv-db-subnet-group"
  }
}

resource "aws_security_group" "tamv_rds_sg" {
  name_prefix = "tamv-rds-sg"
  vpc_id      = aws_vpc.tamv_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.tamv_cluster_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "tamv-rds-sg"
  }
}

resource "random_password" "tamv_db_password" {
  length  = 32
  special = true
}

resource "aws_db_instance" "tamv_postgres" {
  identifier = "tamv-postgres-production"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r5.2xlarge"

  allocated_storage     = 1000
  max_allocated_storage = 5000
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "tamv_production"
  username = "tamv_admin"
  password = random_password.tamv_db_password.result

  vpc_security_group_ids = [aws_security_group.tamv_rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.tamv_db_subnet_group.name

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "tamv-postgres-final-snapshot"

  performance_insights_enabled = true
  monitoring_interval         = 60

  tags = {
    Name = "tamv-postgres-production"
  }
}

# ElastiCache Redis for caching
resource "aws_elasticache_subnet_group" "tamv_redis_subnet_group" {
  name       = "tamv-redis-subnet-group"
  subnet_ids = aws_subnet.tamv_subnet_private[*].id
}

resource "aws_security_group" "tamv_redis_sg" {
  name_prefix = "tamv-redis-sg"
  vpc_id      = aws_vpc.tamv_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.tamv_cluster_sg.id]
  }

  tags = {
    Name = "tamv-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "tamv_redis" {
  replication_group_id       = "tamv-redis-production"
  description                = "TAMV Redis cluster for caching and sessions"

  node_type            = "cache.r6g.2xlarge"
  port                 = 6379
  parameter_group_name = "default.redis7"

  num_cache_clusters = 3
  
  subnet_group_name  = aws_elasticache_subnet_group.tamv_redis_subnet_group.name
  security_group_ids = [aws_security_group.tamv_redis_sg.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = true
  multi_az_enabled          = true

  tags = {
    Name = "tamv-redis-production"
  }
}

# S3 Buckets for storage
resource "aws_s3_bucket" "tamv_storage" {
  bucket = "tamv-production-storage-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "tamv-production-storage"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "tamv_storage_versioning" {
  bucket = aws_s3_bucket.tamv_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "tamv_storage_encryption" {
  bucket = aws_s3_bucket.tamv_storage.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "tamv_cluster_logs" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 30

  tags = {
    Name = "tamv-cluster-logs"
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Outputs
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.tamv_cluster.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.tamv_cluster.vpc_config[0].cluster_security_group_id
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.tamv_cluster.name
}

output "postgres_endpoint" {
  description = "PostgreSQL database endpoint"
  value       = aws_db_instance.tamv_postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.tamv_redis.primary_endpoint_address
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.tamv_storage.bucket
}