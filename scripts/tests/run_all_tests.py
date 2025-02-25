#!/usr/bin/env python3

"""
RAPTOR Documentation Assistant - Test Runner

This script runs all the test scripts in sequence and reports the results.
"""

import os
import sys
import subprocess
import time
from datetime import datetime

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_header(text):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.HEADER}{text.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'=' * 80}{Colors.END}\n")

def print_section(text):
    """Print a section header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}[{text}]{Colors.END}")

def print_result(name, success):
    """Print a test result."""
    status = f"{Colors.GREEN}PASSED{Colors.END}" if success else f"{Colors.RED}FAILED{Colors.END}"
    print(f"{Colors.BOLD}{name.ljust(40)}{Colors.END} {status}")

def run_test(test_file):
    """Run a test script and return True if it succeeds."""
    print_section(f"Running {test_file}")
    result = subprocess.run(
        [sys.executable, test_file],
        capture_output=True,
        text=True
    )
    
    # Print the output with proper indentation
    for line in result.stdout.split('\n'):
        if line.strip():
            print(f"    {line}")
    
    # If there's an error, print it
    if result.returncode != 0:
        print(f"\n{Colors.RED}Error output:{Colors.END}")
        for line in result.stderr.split('\n'):
            if line.strip():
                print(f"    {line}")
    
    return result.returncode == 0

def main():
    """Main function to run all tests."""
    start_time = time.time()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print_header("RAPTOR Documentation Assistant - Test Suite")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Find all test files
    test_files = [f for f in os.listdir(current_dir) if f.startswith('test-') and f.endswith('.py')]
    test_files.sort()  # Sort for consistent order
    
    print(f"Found {len(test_files)} test scripts to run")
    
    # Run each test
    results = {}
    for test_file in test_files:
        file_path = os.path.join(current_dir, test_file)
        success = run_test(file_path)
        results[test_file] = success
    
    # Print summary
    print_header("Test Results Summary")
    
    passed = sum(1 for success in results.values() if success)
    failed = len(results) - passed
    
    for test_file, success in results.items():
        print_result(test_file, success)
    
    print(f"\n{Colors.BOLD}Summary:{Colors.END}")
    print(f"  Total tests: {len(results)}")
    print(f"  Passed: {Colors.GREEN}{passed}{Colors.END}")
    print(f"  Failed: {Colors.RED if failed > 0 else ''}{failed}{Colors.END}")
    
    duration = time.time() - start_time
    print(f"\nTotal runtime: {duration:.2f} seconds")
    
    # Return non-zero exit code if any test failed
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())