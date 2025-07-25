import React from 'react';
import { Play, CheckCircle, XCircle } from 'lucide-react';

interface TestCase {
  input: any[];
  expected: any;
}

interface TestResult {
  passed: boolean;
  actual: any;
  expected: any;
  input: any[];
  error?: string;
}

interface TestRunnerProps {
  testCases: TestCase[];
  onRunTests: () => void;
  testResults: TestResult[];
  isRunning: boolean;
}

const TestRunner: React.FC<TestRunnerProps> = ({
  testCases,
  onRunTests,
  testResults,
  isRunning
}) => {
  const passedTests = testResults.filter(result => result.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Test Results
        </h3>
        <button
          onClick={onRunTests}
          disabled={isRunning || testCases.length === 0}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Play className="h-4 w-4" />
          <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {passedTests}/{totalTests} tests passed
          </div>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  result.passed
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}
              >
                {result.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Test {index + 1}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Input: {JSON.stringify(result.input)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Expected: {JSON.stringify(result.expected)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Actual: {JSON.stringify(result.actual)}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;