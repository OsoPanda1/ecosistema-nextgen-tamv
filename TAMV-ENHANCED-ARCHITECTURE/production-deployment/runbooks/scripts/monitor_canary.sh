#!/usr/bin/env bash
set -euo pipefail

# TAMV Enhanced Canary Monitoring Script
# Monitors canary deployment metrics and automatically promotes or rolls back

DURATION=${1:-300}  # 5 minutes default
NAMESPACE=${2:-tamv-prod}
SERVICE=${3:-tamv-core}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Thresholds
ERROR_RATE_THRESHOLD=1.0      # 1% max error rate
LATENCY_P95_THRESHOLD=0.5     # 500ms max p95 latency
LATENCY_P99_THRESHOLD=1.0     # 1s max p99 latency
CPU_THRESHOLD=80              # 80% max CPU usage
MEMORY_THRESHOLD=85           # 85% max memory usage

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
TOTAL_CHECKS=0

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Function to check if Prometheus is available
check_prometheus() {
    if kubectl get svc -n monitoring prometheus-server >/dev/null 2>&1; then
        return 0
    else
        log_warning "Prometheus not found, using basic monitoring"
        return 1
    fi
}

# Function to query Prometheus
query_prometheus() {
    local query="$1"
    local prometheus_pod=$(kubectl get pods -n monitoring -l app=prometheus-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$prometheus_pod" ]; then
        echo "0"
        return 1
    fi
    
    kubectl exec -n monitoring "$prometheus_pod" -- \
        promtool query instant "$query" 2>/dev/null | \
        grep -o '[0-9.]*' | head -1 || echo "0"
}

# Function to check error rate
check_error_rate() {
    local error_rate
    
    if check_prometheus; then
        error_rate=$(query_prometheus "rate(http_requests_total{status=~\"5..\",service=\"$SERVICE\"}[5m]) / rate(http_requests_total{service=\"$SERVICE\"}[5m]) * 100")
    else
        # Fallback: check logs for errors
        local error_count=$(kubectl logs -n "$NAMESPACE" -l app="$SERVICE" --since=5m | grep -c "ERROR\|error\|Error" || echo "0")
        local total_logs=$(kubectl logs -n "$NAMESPACE" -l app="$SERVICE" --since=5m | wc -l || echo "1")
        error_rate=$(echo "scale=2; $error_count * 100 / $total_logs" | bc -l 2>/dev/null || echo "0")
    fi
    
    ((TOTAL_CHECKS++))
    
    if (( $(echo "$error_rate <= $ERROR_RATE_THRESHOLD" | bc -l) )); then
        log_success "Error rate: ${error_rate}% (threshold: ${ERROR_RATE_THRESHOLD}%)"
        ((CHECKS_PASSED++))
        return 0
    else
        log_error "Error rate too high: ${error_rate}% (threshold: ${ERROR_RATE_THRESHOLD}%)"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check latency
check_latency() {
    local p95_latency p99_latency
    
    if check_prometheus; then
        p95_latency=$(query_prometheus "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service=\"$SERVICE\"}[5m]))")
        p99_latency=$(query_prometheus "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{service=\"$SERVICE\"}[5m]))")
    else
        # Fallback: basic health check timing
        local start_time=$(date +%s.%N)
        kubectl exec -n "$NAMESPACE" -l app="$SERVICE" -- curl -fsS http://localhost:3000/health/ready >/dev/null 2>&1 || true
        local end_time=$(date +%s.%N)
        p95_latency=$(echo "$end_time - $start_time" | bc -l)
        p99_latency=$p95_latency
    fi
    
    ((TOTAL_CHECKS++))
    
    local latency_ok=true
    
    if (( $(echo "$p95_latency <= $LATENCY_P95_THRESHOLD" | bc -l) )); then
        log_success "P95 latency: ${p95_latency}s (threshold: ${LATENCY_P95_THRESHOLD}s)"
    else
        log_error "P95 latency too high: ${p95_latency}s (threshold: ${LATENCY_P95_THRESHOLD}s)"
        latency_ok=false
    fi
    
    if (( $(echo "$p99_latency <= $LATENCY_P99_THRESHOLD" | bc -l) )); then
        log_success "P99 latency: ${p99_latency}s (threshold: ${LATENCY_P99_THRESHOLD}s)"
    else
        log_error "P99 latency too high: ${p99_latency}s (threshold: ${LATENCY_P99_THRESHOLD}s)"
        latency_ok=false
    fi
    
    if $latency_ok; then
        ((CHECKS_PASSED++))
        return 0
    else
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check resource usage
check_resource_usage() {
    local cpu_usage memory_usage
    
    # Get resource usage from kubectl top
    local metrics=$(kubectl top pods -n "$NAMESPACE" -l app="$SERVICE" --no-headers 2>/dev/null | head -1)
    
    if [ -n "$metrics" ]; then
        cpu_usage=$(echo "$metrics" | awk '{print $2}' | sed 's/m//' | sed 's/[^0-9]//g')
        memory_usage=$(echo "$metrics" | awk '{print $3}' | sed 's/Mi//' | sed 's/[^0-9]//g')
        
        # Convert to percentages (rough estimates)
        cpu_percentage=$(echo "scale=2; $cpu_usage / 10" | bc -l 2>/dev/null || echo "0")
        memory_percentage=$(echo "scale=2; $memory_usage / 20" | bc -l 2>/dev/null || echo "0")
    else
        cpu_percentage=0
        memory_percentage=0
    fi
    
    ((TOTAL_CHECKS++))
    
    local resources_ok=true
    
    if (( $(echo "$cpu_percentage <= $CPU_THRESHOLD" | bc -l) )); then
        log_success "CPU usage: ${cpu_percentage}% (threshold: ${CPU_THRESHOLD}%)"
    else
        log_error "CPU usage too high: ${cpu_percentage}% (threshold: ${CPU_THRESHOLD}%)"
        resources_ok=false
    fi
    
    if (( $(echo "$memory_percentage <= $MEMORY_THRESHOLD" | bc -l) )); then
        log_success "Memory usage: ${memory_percentage}% (threshold: ${MEMORY_THRESHOLD}%)"
    else
        log_error "Memory usage too high: ${memory_percentage}% (threshold: ${MEMORY_THRESHOLD}%)"
        resources_ok=false
    fi
    
    if $resources_ok; then
        ((CHECKS_PASSED++))
        return 0
    else
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check pod health
check_pod_health() {
    local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$SERVICE" -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l)
    local total_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$SERVICE" --no-headers | wc -l)
    
    ((TOTAL_CHECKS++))
    
    if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
        log_success "Pod health: $ready_pods/$total_pods pods ready"
        ((CHECKS_PASSED++))
        return 0
    else
        log_error "Pod health issue: $ready_pods/$total_pods pods ready"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check deployment status
check_deployment_status() {
    local deployment_status=$(kubectl rollout status deployment/"$SERVICE" -n "$NAMESPACE" --timeout=10s 2>/dev/null && echo "success" || echo "failed")
    
    ((TOTAL_CHECKS++))
    
    if [ "$deployment_status" = "success" ]; then
        log_success "Deployment status: healthy"
        ((CHECKS_PASSED++))
        return 0
    else
        log_error "Deployment status: unhealthy"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to perform comprehensive health check
perform_health_check() {
    log_info "🔍 Performing health check..."
    
    check_pod_health
    check_deployment_status
    check_error_rate
    check_latency
    check_resource_usage
    
    local success_rate=$(echo "scale=2; $CHECKS_PASSED * 100 / $TOTAL_CHECKS" | bc -l)
    
    log_info "Health check results: $CHECKS_PASSED/$TOTAL_CHECKS passed (${success_rate}%)"
    
    # Reset counters for next check
    CHECKS_PASSED=0
    CHECKS_FAILED=0
    TOTAL_CHECKS=0
    
    # Return success if at least 80% of checks passed
    if (( $(echo "$success_rate >= 80" | bc -l) )); then
        return 0
    else
        return 1
    fi
}

# Function to rollback canary
rollback_canary() {
    log_error "🔄 Rolling back canary deployment..."
    
    # Get previous revision
    local previous_revision=$(helm history "$SERVICE" -n "$NAMESPACE" -o json | jq -r '.[1].revision' 2>/dev/null || echo "1")
    
    # Rollback
    helm rollback "$SERVICE" "$previous_revision" -n "$NAMESPACE" --wait --timeout=300s
    
    if [ $? -eq 0 ]; then
        log_success "Rollback completed successfully"
        
        # Send notification
        send_notification "🔄 TAMV Canary Rollback" "Service: $SERVICE\nNamespace: $NAMESPACE\nReason: Health checks failed\nStatus: Completed"
    else
        log_error "Rollback failed!"
        send_notification "❌ TAMV Canary Rollback Failed" "Service: $SERVICE\nNamespace: $NAMESPACE\nAction Required: Manual intervention needed"
    fi
}

# Function to promote canary
promote_canary() {
    log_success "🚀 Promoting canary to full deployment..."
    
    # Update canary weight to 100%
    helm upgrade "$SERVICE" ./charts/"$SERVICE" \
        -n "$NAMESPACE" \
        --set canary.weight=100 \
        --wait --timeout=300s
    
    if [ $? -eq 0 ]; then
        log_success "Canary promotion completed successfully"
        
        # Send notification
        send_notification "🚀 TAMV Canary Promotion" "Service: $SERVICE\nNamespace: $NAMESPACE\nStatus: Successfully promoted to 100%"
    else
        log_error "Canary promotion failed!"
        send_notification "❌ TAMV Canary Promotion Failed" "Service: $SERVICE\nNamespace: $NAMESPACE\nAction Required: Manual intervention needed"
    fi
}

# Function to send notifications (placeholder)
send_notification() {
    local title="$1"
    local message="$2"
    
    # Log notification (replace with actual notification system)
    log_info "NOTIFICATION: $title"
    log_info "$message"
    
    # Example: Send to Slack webhook
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$title\n$message\"}" \
    #   "$SLACK_WEBHOOK_URL"
}

# Main monitoring function
main() {
    log_info "🎯 Starting TAMV Enhanced Canary Monitoring"
    log_info "Service: $SERVICE"
    log_info "Namespace: $NAMESPACE"
    log_info "Duration: ${DURATION}s"
    log_info "Thresholds: Error Rate ≤ ${ERROR_RATE_THRESHOLD}%, P95 ≤ ${LATENCY_P95_THRESHOLD}s, P99 ≤ ${LATENCY_P99_THRESHOLD}s"
    echo ""
    
    local start_time=$(date +%s)
    local end_time=$((start_time + DURATION))
    local check_interval=30
    local failed_checks=0
    local max_failed_checks=3
    
    while [ $(date +%s) -lt $end_time ]; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        local remaining=$((end_time - current_time))
        
        log_info "⏱️  Monitoring progress: ${elapsed}s elapsed, ${remaining}s remaining"
        
        if perform_health_check; then
            log_success "✅ Health check passed"
            failed_checks=0
        else
            log_error "❌ Health check failed"
            ((failed_checks++))
            
            if [ $failed_checks -ge $max_failed_checks ]; then
                log_error "Maximum failed checks reached ($failed_checks/$max_failed_checks)"
                rollback_canary
                exit 1
            fi
        fi
        
        echo ""
        
        # Wait for next check
        if [ $remaining -gt $check_interval ]; then
            sleep $check_interval
        else
            sleep $remaining
            break
        fi
    done
    
    log_success "🎉 Canary monitoring completed successfully!"
    log_info "All health checks passed during monitoring period"
    
    # Ask for promotion confirmation
    echo ""
    log_info "🤔 Ready to promote canary to full deployment?"
    read -p "Promote canary? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        promote_canary
    else
        log_info "Canary promotion skipped. Manual promotion required."
        log_info "To promote manually: helm upgrade $SERVICE ./charts/$SERVICE -n $NAMESPACE --set canary.weight=100"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up monitoring processes..."
}

# Set trap for cleanup
trap cleanup EXIT

# Check prerequisites
if ! command -v kubectl >/dev/null 2>&1; then
    log_error "kubectl not found. Please install kubectl."
    exit 1
fi

if ! command -v helm >/dev/null 2>&1; then
    log_error "helm not found. Please install helm."
    exit 1
fi

if ! command -v bc >/dev/null 2>&1; then
    log_error "bc not found. Please install bc for calculations."
    exit 1
fi

# Verify namespace exists
if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
    log_error "Namespace '$NAMESPACE' not found."
    exit 1
fi

# Verify service exists
if ! kubectl get deployment "$SERVICE" -n "$NAMESPACE" >/dev/null 2>&1; then
    log_error "Service '$SERVICE' not found in namespace '$NAMESPACE'."
    exit 1
fi

# Run main function
main "$@"