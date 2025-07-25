// Simple language detection based on syntax patterns
export const detectLanguage = (code: string): string => {
  const trimmedCode = code.trim();
  
  // C++ detection (check before C# to avoid conflicts)
  if (
    /#include\s*</.test(trimmedCode) ||
    /^int\s+main\s*\(/.test(trimmedCode) ||
    /std::\w+/.test(trimmedCode) ||
    /cout\s*<</.test(trimmedCode) ||
    /using\s+namespace\s+std/.test(trimmedCode)
  ) {
    return 'cpp';
  }
  
  // Python detection
  if (
    /^def\s+\w+\s*\(/.test(trimmedCode) ||
    /^class\s+\w+/.test(trimmedCode) ||
    /import\s+\w+/.test(trimmedCode) ||
    /from\s+\w+\s+import/.test(trimmedCode) ||
    /print\s*\(/.test(trimmedCode)
  ) {
    return 'python';
  }
  
  // JavaScript/TypeScript detection
  if (
    /^function\s+\w+\s*\(/.test(trimmedCode) ||
    /^const\s+\w+\s*=/.test(trimmedCode) ||
    /^let\s+\w+\s*=/.test(trimmedCode) ||
    /^var\s+\w+\s*=/.test(trimmedCode) ||
    /^export\s+(default\s+)?/.test(trimmedCode) ||
    /^import\s+.*from/.test(trimmedCode) ||
    /console\.log/.test(trimmedCode)
  ) {
    return trimmedCode.includes(': ') && trimmedCode.includes('function') ? 'typescript' : 'javascript';
  }
  
  // Java detection
  if (
    /^public\s+class\s+\w+/.test(trimmedCode) ||
    /^public\s+static\s+void\s+main/.test(trimmedCode) ||
    /^package\s+\w+/.test(trimmedCode) ||
    /System\.out\.println/.test(trimmedCode)
  ) {
    return 'java';
  }
  
  // C# detection
  if (
    /^using\s+System/.test(trimmedCode) ||
    /^namespace\s+\w+/.test(trimmedCode) ||
    /Console\.WriteLine/.test(trimmedCode)
  ) {
    return 'csharp';
  }
  
  // Go detection
  if (
    /^package\s+main/.test(trimmedCode) ||
    /^func\s+\w+/.test(trimmedCode) ||
    /fmt\.Print/.test(trimmedCode)
  ) {
    return 'go';
  }
  
  // Rust detection
  if (
    /^fn\s+\w+/.test(trimmedCode) ||
    /println!\s*\(/.test(trimmedCode) ||
    /let\s+mut\s+/.test(trimmedCode)
  ) {
    return 'rust';
  }
  
  return 'plaintext';
};

export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'plaintext', label: 'Plain Text' }
];