#!/bin/bash

# Script to run all tests and generate a comprehensive report

# Create reports directory if it doesn't exist
mkdir -p reports

# Get current timestamp for report filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
HTML_REPORT="reports/test_report_${TIMESTAMP}.html"
XML_REPORT="reports/test_report_${TIMESTAMP}.xml"
LOG_FILE="reports/test_log_${TIMESTAMP}.log"

# Print header
echo "====================================================="
echo "Running all tests for comment deletion functionality"
echo "====================================================="
echo "Started at: $(date)"
echo "====================================================="

# Run tests with pytest and generate reports
echo "Running tests..."
python -m pytest tests/ \
    --html="${HTML_REPORT}" \
    --self-contained-html \
    --junitxml="${XML_REPORT}" \
    -v | tee "${LOG_FILE}"

# Get the exit code
EXIT_CODE=$?

# Print summary
echo "====================================================="
echo "Test execution completed at: $(date)"
echo "Exit code: ${EXIT_CODE}"
echo "====================================================="
echo "Reports generated:"
echo "- HTML Report: ${HTML_REPORT}"
echo "- XML Report: ${XML_REPORT}"
echo "- Log File: ${LOG_FILE}"
echo "====================================================="

# Open the HTML report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Opening HTML report..."
    open "${HTML_REPORT}"
fi

# Exit with the same code as pytest
exit ${EXIT_CODE} 