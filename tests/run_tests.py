 #!/usr/bin/env python3
"""
Script to run all tests and generate a comprehensive report.
"""

import os
import sys
import argparse
import subprocess
import datetime
import webbrowser
from pathlib import Path

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Run tests and generate reports")
    parser.add_argument("--html", action="store_true", help="Generate HTML report")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--open", action="store_true", help="Open report in browser after generation")
    parser.add_argument("--api-only", action="store_true", help="Run only API tests")
    parser.add_argument("--frontend-only", action="store_true", help="Run only frontend tests")
    parser.add_argument("--database-only", action="store_true", help="Run only database tests")
    parser.add_argument("--skip-slow", action="store_true", help="Skip slow tests")
    return parser.parse_args()

def run_tests(args):
    """Run the tests based on the provided arguments."""
    # Create reports directory if it doesn't exist
    reports_dir = Path("reports")
    reports_dir.mkdir(exist_ok=True)
    
    # Generate timestamp for report filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = reports_dir / f"test_report_{timestamp}.html"
    
    # Build pytest command
    cmd = ["pytest"]
    
    # Add markers based on arguments
    markers = []
    if args.api_only:
        markers.append("api")
    if args.frontend_only:
        markers.append("frontend")
    if args.database_only:
        markers.append("database")
    if args.skip_slow:
        markers.append("not slow")
    
    if markers:
        cmd.append("-m")
        cmd.append(" and ".join(markers))
    
    # Add HTML report option
    if args.html:
        cmd.extend(["--html", str(report_file), "--self-contained-html"])
    
    # Add parallel execution option
    if args.parallel:
        cmd.extend(["-n", "auto"])
    
    # Add verbose output
    cmd.append("-v")
    
    # Run the tests
    print(f"Running command: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
    
    # Open report in browser if requested
    if args.html and args.open and result.returncode == 0:
        webbrowser.open(f"file://{report_file.absolute()}")
    
    return result.returncode

def main():
    """Main function."""
    args = parse_args()
    return run_tests(args)

if __name__ == "__main__":
    sys.exit(main())