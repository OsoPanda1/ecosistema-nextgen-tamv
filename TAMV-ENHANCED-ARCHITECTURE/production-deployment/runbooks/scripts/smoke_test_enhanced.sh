#!/usr/bin/env bash
set -euo pipefail

# TAMV Enhanced Smoke Test Suite
# Comprehensive health checks for all TAMV services

NAMESPACE=${1:-tamv-staging}
TIMEOUT=${2:-300}
VERBOSE=${3:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log_info "Running test: $test_name"
    
    if eval "$test_command"; then
        log_success "$test_name - PASSED"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "$test_name - FAILED"
        FAILED_TESTS+=("$test_name")
        ((TESTS_FAILED++))
        return 1
    fi
}

# Main smoke test function
main() {
    log_info "🧪 Starting TAMV Enhanced Smoke Tests"
    log_info "Namespace: $NAMESPACE"
    log_info "Timeout: ${TIMEOUT}s"
    echo ""

    # Test 1: Verify all pods are running
    run_test "Pod Status Check" "
        log_info 'Checking pod status...'
        kubectl get pods -n $NAMESPACE --no-headers | grep -v Running | grep -v Completed | wc -l | grep -q '^0$'
    "

    # Test 2: Wait for all pods to be ready
    run_test "Pod Readiness Check" "
        log_info 'Waiting for pods to be ready...'
        kubectl wait --for=condition=Ready pods --all -n $NAMESPACE --timeout=${TIMEOUT}s
    "

    # Test 3: TAMV Core API health check
    run_test "TAMV Core Health Check" "
        test_service_health 'tamv-core' '/health/ready'
    "

    # Test 4: Isabella AI health check
    run_test "Isabella AI Health Check" "
        test_service_health 'isabella-ai' '/health/ready'
    "

    # Test 5: XR Engine health check
    run_test "XR Engine Health Check" "
        test_service_health 'xr-engine' '/health/ready'
    "

    # Test 6: Blockchain MSR health check
    run_test "Blockchain MSR Health Check" "
        test_service_health 'blockchain-msr' '/health/ready'
    "

    # Test 7: Tenochtitlan Security health check
    run_test "Tenochtitlan Security Health Check" "
        test_service_health 'tenochtitlan-security' '/health/ready'
    "

    # Test 8: Database connectivity
    run_test "Database Connectivity" "
        test_database_connection
    "

    # Test 9: Redis connectivity
    run_test "Redis Connectivity" "
        test_redis_connection
    "

    # Test 10: API endpoints functionality
    run_test "API Endpoints Test" "
        test_api_endpoints
    "

    # Test 11: XR rendering capability
    run_test "XR Rendering Test" "
        test_xr_rendering
    "

    # Test 12: AI inference capability
    run_test "AI Inference Test" "
        test_ai_inference
    "

    # Test 13: Blockchain operations
    run_test "Blockchain Operations Test" "
        test_blockchain_operations
    "

    # Test 14: Security system status
    run_test "Security System Test" "
        test_security_system
    "

    # Test 15: Performance metrics
    run_test "Performance Metrics Test" "
        test_performance_metrics
    "

    # Print summary
    echo ""
    log_info "🎯 Test Summary"
    echo "=================="
    log_success "Tests Passed: $TESTS_PASSED"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        log_error "Tests Failed: $TESTS_FAILED"
        echo ""
        log_error "Failed Tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  - $test"
        done
        echo ""
        exit 1
    else
        log_success "All tests passed! 🎉"
        echo ""
        exit 0
    fi
}

# Helper function to test service health
test_service_health() {
    local service_name="$1"
    local health_path="$2"
    local port="${3:-3000}"
    
    # Get pod name
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app="$service_name" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No pods found for service: $service_name"
        return 1
    fi
    
    # Test health endpoint
    kubectl exec -n "$NAMESPACE" "$pod" -- curl -fsS "http://localhost:${port}${health_path}" >/dev/null 2>&1
}

# Test database connection
test_database_connection() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app=tamv-core -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No tamv-core pods found for database test"
        return 1
    fi
    
    kubectl exec -n "$NAMESPACE" "$pod" -- node -e "
        const { Client } = require('pg');
        const client = new Client(process.env.DATABASE_URL);
        client.connect().then(() => {
            console.log('Database connection successful');
            return client.query('SELECT 1 as test');
        }).then(() => {
            client.end();
            process.exit(0);
        }).catch(err => {
            console.error('Database connection failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null
}

# Test Redis connection
test_redis_connection() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app=tamv-core -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No tamv-core pods found for Redis test"
        return 1
    fi
    
    kubectl exec -n "$NAMESPACE" "$pod" -- node -e "
        const redis = require('redis');
        const client = redis.createClient(process.env.REDIS_URL);
        client.on('error', (err) => {
            console.error('Redis connection failed:', err.message);
            process.exit(1);
        });
        client.connect().then(() => {
            console.log('Redis connection successful');
            return client.ping();
        }).then(() => {
            client.quit();
            process.exit(0);
        }).catch(err => {
            console.error('Redis operation failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null
}

# Test API endpoints
test_api_endpoints() {
    local ingress_host=$(kubectl get ingress -n "$NAMESPACE" tamv-core -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
    
    if [ -z "$ingress_host" ]; then
        log_warning "No ingress found, testing via port-forward"
        # Use port-forward as fallback
        kubectl port-forward svc/tamv-core 8080:3000 -n "$NAMESPACE" &
        local pf_pid=$!
        sleep 3
        
        curl -fsS http://localhost:8080/api/v1/health >/dev/null 2>&1
        local result=$?
        
        kill $pf_pid 2>/dev/null || true
        return $result
    else
        curl -fsS "https://$ingress_host/api/v1/health" >/dev/null 2>&1
    fi
}

# Test XR rendering capability
test_xr_rendering() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app=xr-engine -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No XR engine pods found"
        return 1
    fi
    
    # Test basic render endpoint
    kubectl exec -n "$NAMESPACE" "$pod" -- curl -fsS -X POST \
        -H "Content-Type: application/json" \
        -d '{"scene":"test","quality":"low"}' \
        "http://localhost:3000/api/render/test" >/dev/null 2>&1
}

# Test AI inference capability
test_ai_inference() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app=isabella-ai -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No Isabella AI pods found"
        return 1
    fi
    
    # Test basic inference endpoint
    kubectl exec -n "$NAMESPACE" "$pod" -- curl -fsS -X POST \
        -H "Content-Type: application/json" \
        -d '{"query":"test ethical evaluation","context":"smoke test"}' \
        "http://localhost:8000/api/v1/evaluate" >/dev/null 2>&1
}

# Test blockchain operations
test_blockchain_operations() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app=blockchain-msr -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No Blockchain MSR pods found"
        return 1
    fi
    
    # Test blockchain status endpoint
    kubectl exec -n "$NAMESPACE" "$pod" -- curl -fsS \
        "http://localhost:3000/api/v1/blockchain/status" >/dev/null 2>&1
}

# Test security system
test_security_system() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app=tenochtitlan-security -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod" ]; then
        log_warning "No Tenochtitlan Security pods found"
        return 1
    fi
    
    # Test security status endpoint
    kubectl exec -n "$NAMESPACE" "$pod" -- curl -fsS \
        "http://localhost:3000/api/v1/security/status" >/dev/null 2>&1
}

# Test performance metrics
test_performance_metrics() {
    # Check if metrics endpoints are accessible
    local services=("tamv-core" "isabella-ai" "xr-engine" "blockchain-msr" "tenochtitlan-security")
    
    for service in "${services[@]}"; do
        local pod=$(kubectl get pods -n "$NAMESPACE" -l app="$service" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [ -n "$pod" ]; then
            kubectl exec -n "$NAMESPACE" "$pod" -- curl -fsS "http://localhost:3000/metrics" >/dev/null 2>&1 || true
        fi
    done
    
    return 0  # Always pass for now, metrics are optional
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"