import React, { useState, useEffect } from 'react';
import { Download, Code, Play, History, Settings } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import LanguageSelector from './components/LanguageSelector';
import TestRunner from './components/TestRunner';
import DiffViewer from './components/DiffViewer';
import ThemeToggle from './components/ThemeToggle';
import { detectLanguage, SUPPORTED_LANGUAGES } from './utils/languageDetection';
import { convertCode, runTestCases } from './utils/codeConverter';
import { useLocalStorage } from './hooks/useLocalStorage';

interface Conversion {
  id: string;
  timestamp: number;
  originalCode: string;
  convertedCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  mode: 'convert' | 'fix';
}

function App() {
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);
  const [originalCode, setOriginalCode] = useState('def is_even(n):\n    return n % 2 != 0  # Buggy logic - should return True for even numbers');
  const [convertedCode, setConvertedCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('python');
  const [targetLanguage, setTargetLanguage] = useState('javascript');
  const [testCasesJson, setTestCasesJson] = useState('[{"input": [2], "expected": true}, {"input": [3], "expected": false}]');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [mode, setMode] = useState<'convert' | 'fix'>('fix');
  const [conversions, setConversions] = useLocalStorage<Conversion[]>('conversions', []);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const detected = detectLanguage(originalCode);
    if (detected !== 'plaintext') {
      setSourceLanguage(detected);
    }
  }, [originalCode]);

  const parseTestCases = () => {
    try {
      return JSON.parse(testCasesJson);
    } catch {
      return [];
    }
  };

  const handleConvert = async () => {
    if (!originalCode.trim()) return;
    
    setIsConverting(true);
    try {
      const result = await convertCode(originalCode, sourceLanguage, targetLanguage, mode);
      setConvertedCode(result);
      
      // Save conversion to history
      const newConversion: Conversion = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalCode,
        convertedCode: result,
        sourceLanguage,
        targetLanguage,
        mode
      };
      setConversions(prev => [newConversion, ...prev.slice(0, 9)]); // Keep last 10
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleRunTests = async () => {
    if (!convertedCode.trim()) return;
    
    setIsRunningTests(true);
    try {
      const testCases = parseTestCases();
      const results = await runTestCases(convertedCode, mode === 'convert' ? targetLanguage : sourceLanguage, testCases);
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleExport = () => {
    if (!convertedCode.trim()) return;
    
    const blob = new Blob([convertedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_code.${targetLanguage === 'javascript' ? 'js' : targetLanguage === 'typescript' ? 'ts' : targetLanguage === 'python' ? 'py' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadConversion = (conversion: Conversion) => {
    setOriginalCode(conversion.originalCode);
    setConvertedCode(conversion.convertedCode);
    setSourceLanguage(conversion.sourceLanguage);
    setTargetLanguage(conversion.targetLanguage);
    setMode(conversion.mode);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Code Converter
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <History className="h-5 w-5" />
              </button>
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHistory && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Conversions</h2>
            {conversions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No recent conversions</p>
            ) : (
              <div className="space-y-2">
                {conversions.map((conversion) => (
                  <button
                    key={conversion.id}
                    onClick={() => loadConversion(conversion)}
                    className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {conversion.sourceLanguage} → {conversion.targetLanguage} ({conversion.mode})
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversion.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Input Code</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'convert' | 'fix')}
                      className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white"
                    >
                      <option value="fix">Fix Bugs</option>
                      <option value="convert">Convert Language</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <LanguageSelector
                  value={sourceLanguage}
                  onChange={setSourceLanguage}
                  label="Source Language"
                  languages={SUPPORTED_LANGUAGES}
                />
                {mode === 'convert' && (
                  <LanguageSelector
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    label="Target Language"
                    languages={SUPPORTED_LANGUAGES}
                  />
                )}
              </div>
              
              <CodeEditor
                value={originalCode}
                onChange={setOriginalCode}
                language={sourceLanguage}
                placeholder="Paste your code here..."
                theme={isDark ? 'vs-dark' : 'light'}
              />
              
              <button
                onClick={handleConvert}
                disabled={isConverting || !originalCode.trim()}
                className="mt-4 w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>{isConverting ? 'Processing...' : mode === 'fix' ? 'Fix Code' : 'Convert Code'}</span>
              </button>
            </div>

            {/* Test Cases */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Cases</h3>
              <textarea
                value={testCasesJson}
                onChange={(e) => setTestCasesJson(e.target.value)}
                placeholder='[{"input": [2], "expected": true}, {"input": [3], "expected": false}]'
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'fix' ? 'Fixed Code' : 'Converted Code'}
                </h2>
                <button
                  onClick={handleExport}
                  disabled={!convertedCode.trim()}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
              
              <CodeEditor
                value={convertedCode}
                onChange={() => {}} // Read-only
                language={mode === 'convert' ? targetLanguage : sourceLanguage}
                readOnly
                theme={isDark ? 'vs-dark' : 'light'}
                placeholder="Converted code will appear here..."
              />
            </div>

            {/* Test Results */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <TestRunner
                testCases={parseTestCases()}
                onRunTests={handleRunTests}
                testResults={testResults}
                isRunning={isRunningTests}
              />
            </div>
          </div>
        </div>

        {/* Diff Viewer */}
        {originalCode && convertedCode && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Code Comparison</h2>
              <DiffViewer
                originalCode={originalCode}
                convertedCode={convertedCode}
                originalLanguage={sourceLanguage}
                targetLanguage={mode === 'convert' ? targetLanguage : sourceLanguage}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;