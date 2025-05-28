/**
 * ===================================================================
 * REGULAR EXPRESSION CHECKER: [(a+b)*aa(b+ab)(aa+bb)*]*
 * ===================================================================
 * 
 * EASY MODIFICATION GUIDE:
 * 1. Change REGEX_CONFIG object to modify the pattern
 * 2. Modify pattern functions in PATTERN_MATCHERS section
 * 3. Update validateInput() for different alphabet
 * 
 * Current Pattern Breakdown:
 * - Outer: [INNER_PATTERN]*  (zero or more repetitions)
 * - Inner: (a+b)*aa(b+ab)(aa+bb)*
 *   ├─ (a+b)*: any sequence of 'a' and 'b' (zero or more)
 *   ├─ aa: exactly "aa"
 *   ├─ (b+ab): either "b" OR "ab"
 *   └─ (aa+bb)*: zero or more "aa" or "bb" pairs
 */

// ===================================================================
// CONFIGURATION - EASY TO MODIFY FOR DIFFERENT REGEX PATTERNS
// ===================================================================

const REGEX_CONFIG = {
    // Alphabet for (a+b)* part
    ALPHABET: ['a', 'b'],
    
    // Required exact sequences (array for flexibility)
    REQUIRED_SEQUENCE: ['aa'],
    
    // Alternative options for (b+ab) part
    ALTERNATIVE_OPTIONS: ['b', 'ab'],
    
    // Repeatable sequences for (aa+bb)* part (can be any length)
    REPEATABLE_SEQUENCES: ['aa', 'bb'],
    
    // ⭐ STAR (*) CONFIGURATION - Easy to modify!
    // Set to true/false to enable/disable each star operator
    STAR_CONFIG: {
        ALPHABET_STAR: true,        // (a+b)* vs (a+b)
        REPEATABLE_STAR: true,      // (aa+bb)* vs (aa+bb)
        PATTERN_STAR: true          // [pattern]* vs pattern (whole regex repetition)
    }
};

/**
 * Calculate minimum pattern length dynamically based on star configuration
 */
const getMinPatternLength = () => {
    let minLength = 0;
    
    // Alphabet part: (a+b)* vs (a+b)
    if (!REGEX_CONFIG.STAR_CONFIG.ALPHABET_STAR) {
        minLength += 1; // Must have exactly 1 alphabet character
    }
    // If ALPHABET_STAR=true, alphabet part can be 0, so no minimum
    
    // Required sequence part: always required (no star on this part)
    const requiredSequences = Array.isArray(REGEX_CONFIG.REQUIRED_SEQUENCE) 
        ? REGEX_CONFIG.REQUIRED_SEQUENCE 
        : [REGEX_CONFIG.REQUIRED_SEQUENCE];
    if (requiredSequences && requiredSequences.length > 0) {
        minLength += Math.min(...requiredSequences.map(seq => seq.length));
    }
    
    // Alternative part: always required (no star on this part)
    if (REGEX_CONFIG.ALTERNATIVE_OPTIONS && REGEX_CONFIG.ALTERNATIVE_OPTIONS.length > 0) {
        minLength += Math.min(...REGEX_CONFIG.ALTERNATIVE_OPTIONS.map(opt => opt.length));
    }
    
    // Repeatable part: (aa+bb)* vs (aa+bb)
    if (!REGEX_CONFIG.STAR_CONFIG.REPEATABLE_STAR) {
        if (REGEX_CONFIG.REPEATABLE_SEQUENCES && REGEX_CONFIG.REPEATABLE_SEQUENCES.length > 0) {
            minLength += Math.min(...REGEX_CONFIG.REPEATABLE_SEQUENCES.map(seq => seq.length));
        }
    }
    // If REPEATABLE_STAR=true, repeatable part can be 0, so no minimum
    
    return Math.max(minLength, 1); // At least 1 character for any valid pattern
};

// ===================================================================
// UTILITY FUNCTIONS - Using JavaScript Built-in Methods
// ===================================================================

/**
 * Check if character is in allowed alphabet using Array.includes()
 * Built-in: Array.includes() - cleaner than manual loop
 * Handles empty alphabet arrays gracefully
 */
const isValidAlphabetChar = (char) => {
    // If alphabet is empty, no characters are valid
    if (!REGEX_CONFIG.ALPHABET || REGEX_CONFIG.ALPHABET.length === 0) {
        return false;
    }
    return REGEX_CONFIG.ALPHABET.includes(char);
};

/**
 * Validate entire string contains only allowed characters using Array.every()
 * Built-in: String.split() + Array.every() - functional approach
 * Handles empty alphabet arrays gracefully
 */
const validateInput = (str) => {
    // If alphabet is empty, only empty strings are valid
    if (!REGEX_CONFIG.ALPHABET || REGEX_CONFIG.ALPHABET.length === 0) {
        return str.length === 0;
    }
    return str.split('').every(char => isValidAlphabetChar(char));
};

/**
 * Get substring using String.substring() - built-in method
 * More readable than manual character extraction
 */
const getSubstring = (str, start, end) => {
    return str.substring(start, end);
};

/**
 * Check if substring matches any option using Array.some()
 * Built-in: Array.some() - checks if at least one element satisfies condition
 */
const matchesAnyOption = (str, pos, options) => {
    return options.some(option => {
        const substring = getSubstring(str, pos, pos + option.length);
        return substring === option;
    });
};

// ===================================================================
// PATTERN MATCHERS - Modular Functions for Each Regex Component
// ===================================================================

/**
 * PATTERN PART 1: (a+b)* OR (a+b) - Alphabet characters (with or without star)
 * Uses: STAR_CONFIG.ALPHABET_STAR to determine if star is enabled
 */
const canMatchAlphabetStar = (str, start, length) => {
    if (!REGEX_CONFIG.STAR_CONFIG.ALPHABET_STAR) {
        // No star: must match exactly one alphabet character
        if (length !== 1) return false;
        const char = getSubstring(str, start, start + 1);
        return isValidAlphabetChar(char);
    }
    
    // With star: zero or more alphabet characters (original logic)
    if (length === 0) return true; // Zero repetitions allowed
    
    const substring = getSubstring(str, start, start + length);
    // Using Array.every() to check all characters are valid
    return substring.split('').every(char => isValidAlphabetChar(char));
};

/**
 * PATTERN PART 2: aa - Exact required sequence(s)
 * Uses: Flexible handling for both string and array formats
 * Handles empty arrays gracefully
 */
const canMatchRequiredSequence = (str, pos) => {
    // Handle both single string and array formats
    const requiredSequences = Array.isArray(REGEX_CONFIG.REQUIRED_SEQUENCE) 
        ? REGEX_CONFIG.REQUIRED_SEQUENCE 
        : [REGEX_CONFIG.REQUIRED_SEQUENCE];
    
    // If no required sequences, return current position (no consumption)
    if (!requiredSequences || requiredSequences.length === 0) {
        return pos; // No sequence required, continue from same position
    }
    
    // Sort required sequences by length (longest first) to ensure greedy matching
    const sortedRequired = [...requiredSequences].sort((a, b) => b.length - a.length);
    
    // Using Array.find() - returns first sequence that matches (now longest first)
    const matchedSequence = sortedRequired.find(sequence => {
        const substring = getSubstring(str, pos, pos + sequence.length);
        return substring === sequence;
    });
    
    return matchedSequence ? pos + matchedSequence.length : -1;
};

/**
 * PATTERN PART 3: (b+ab) - One of the alternative options
 * Uses: Array.find() to get first matching option (sorted by length, longest first)
 * Handles empty arrays gracefully
 */
const canMatchAlternatives = (str, pos) => {
    // If no alternatives, return current position (no consumption)
    if (!REGEX_CONFIG.ALTERNATIVE_OPTIONS || REGEX_CONFIG.ALTERNATIVE_OPTIONS.length === 0) {
        return pos; // No alternative required, continue from same position
    }
    
    // Sort alternatives by length (longest first) to ensure greedy matching
    const sortedAlternatives = [...REGEX_CONFIG.ALTERNATIVE_OPTIONS].sort((a, b) => b.length - a.length);
    
    // Using Array.find() - returns first option that matches (now longest first)
    const matchedOption = sortedAlternatives.find(option => {
        const substring = getSubstring(str, pos, pos + option.length);
        return substring === option;
    });
    
    return matchedOption ? pos + matchedOption.length : -1;
};

/**
 * PATTERN PART 4: (aa+bb)* OR (aa+bb) - Repeatable sequences (with or without star)
 * Uses: STAR_CONFIG.REPEATABLE_STAR to determine if star is enabled
 * Handles empty arrays gracefully
 */
const canMatchRepeatableSequences = (str, start, end) => {
    let pos = start;
    
    // If no repeatable sequences defined, check if remaining string is empty
    if (!REGEX_CONFIG.REPEATABLE_SEQUENCES || REGEX_CONFIG.REPEATABLE_SEQUENCES.length === 0) {
        // With empty sequences, only empty remaining string is valid
        return pos === end;
    }
    
    // Sort sequences by length (longest first) to ensure greedy matching
    const sortedSequences = [...REGEX_CONFIG.REPEATABLE_SEQUENCES].sort((a, b) => b.length - a.length);
    
    if (!REGEX_CONFIG.STAR_CONFIG.REPEATABLE_STAR) {
        // No star: must match exactly one sequence
        const matchedSequence = sortedSequences.find(sequence => {
            if (pos + sequence.length !== end) return false; // Must use entire remaining string
            const substring = getSubstring(str, pos, pos + sequence.length);
            return substring === sequence;
        });
        
        return matchedSequence !== undefined;
    }
    
    // With star: zero or more sequences (original logic)
    while (pos < end) {
        // Find the first (longest) sequence that matches at current position
        const matchedSequence = sortedSequences.find(sequence => {
            if (pos + sequence.length > end) return false; // Not enough characters
            const substring = getSubstring(str, pos, pos + sequence.length);
            return substring === sequence;
        });
        
        if (matchedSequence) {
            pos += matchedSequence.length;
        } else {
            return false; // No sequence matches at this position
        }
    }
    
    return true; // All characters successfully matched
};

// ===================================================================
// CORE PATTERN MATCHING LOGIC
// ===================================================================

/**
 * Check if a specific substring can match exactly one complete pattern
 * Uses functional approach with clear step-by-step validation
 */
const canMatchSinglePatternExactly = (str, start, end) => {
    const patternLength = end - start;
    const minLength = getMinPatternLength();
    
    if (patternLength < minLength) return false;
    
    // Calculate alphabet length range based on star configuration
    let alphabetLengthRange;
    
    if (!REGEX_CONFIG.STAR_CONFIG.ALPHABET_STAR) {
        // No star: exactly 1 alphabet character required
        alphabetLengthRange = [1];
    } else {
        // With star: 0 to (pattern_length - min_other_parts)
        const minOtherParts = minLength - (REGEX_CONFIG.STAR_CONFIG.ALPHABET_STAR ? 0 : 1);
        const maxAlphabetLength = Math.max(0, patternLength - minOtherParts);
        alphabetLengthRange = Array.from({length: maxAlphabetLength + 1}, (_, i) => i);
    }
    
    // Try different lengths for alphabet part
    return alphabetLengthRange.some(alphabetLength => {
        let currentPos = start;
        
        // Step 1: Try alphabet part with current length
        if (!canMatchAlphabetStar(str, currentPos, alphabetLength)) {
            return false;
        }
        currentPos += alphabetLength;
        
        // Step 2: Try required sequence
        const afterRequired = canMatchRequiredSequence(str, currentPos);
        if (afterRequired === -1) return false;
        currentPos = afterRequired;
        
        // Step 3: Try alternatives
        const afterAlternatives = canMatchAlternatives(str, currentPos);
        if (afterAlternatives === -1) return false;
        currentPos = afterAlternatives;
        
        // Step 4: Check if remaining can be matched by repeatable sequences
        return canMatchRepeatableSequences(str, currentPos, end);
    });
};

/**
 * Main recursive function with backtracking
 * Uses clean recursive approach for pattern matching
 */
const matchPatternsRecursively = (str, startPos = 0) => {
    // Base case: reached end of string
    if (startPos >= str.length) return true;
    
    const minPatternLength = getMinPatternLength();
    const possibleEndPositions = Array.from(
        {length: str.length - startPos - minPatternLength + 1}, 
        (_, i) => startPos + minPatternLength + i
    );
    
    // Try each possible pattern length using Array.some()
    return possibleEndPositions.some(endPos => {
        // If current pattern matches, try to match the rest recursively
        return canMatchSinglePatternExactly(str, startPos, endPos) && 
               matchPatternsRecursively(str, endPos);
    });
};

// ===================================================================
// MAIN INTERFACE FUNCTIONS
// ===================================================================

/**
 * Main pattern matching function - entry point
 * Uses: STAR_CONFIG.PATTERN_STAR to determine if whole pattern can repeat
 */
const matchPattern = (inputStr) => {
    // Handle invalid characters first
    if (!validateInput(inputStr)) return false; // Invalid characters
    
    if (!REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR) {
        // No star: must match exactly one complete pattern (no repetition)
        // Empty string is NOT valid when no star (need exactly 1 pattern)
        if (!inputStr || inputStr.length === 0) return false;
        return canMatchSinglePatternExactly(inputStr, 0, inputStr.length);
    }
    
    // With star: zero or more patterns (empty string valid)
    if (!inputStr || inputStr.length === 0) return true; // Empty string valid with star
    return matchPatternsRecursively(inputStr);
};

/**
 * UI Event Handler with enhanced error handling
 * Uses modern DOM methods and clean error handling
 */
const checkString = () => {
    const input = document.getElementById('testString');
    const result = document.getElementById('result');
    const testString = input.value.trim();
    
    // Clear previous styling using classList methods
    result.className = 'result-message';
    
    // Input validation with specific error messages
    if (!testString) {
        displayResult(result, 'Please enter a string to test', 'empty');
        return;
    }
    
    if (!validateInput(testString)) {
        const allowedChars = REGEX_CONFIG.ALPHABET.join("', '");
        displayResult(result, `Invalid input! Only '${allowedChars}' characters allowed`, 'invalid');
        return;
    }
    
    // Pattern matching with clear success/failure messages
    const isValid = matchPattern(testString);
    const message = isValid ? 'Valid string ✓' : 'Invalid string ✗';
    const className = isValid ? 'valid' : 'invalid';
    
    displayResult(result, message, className);
};

/**
 * Helper function to display results with consistent styling
 * Uses template literals and classList for clean DOM manipulation
 */
const displayResult = (element, message, className) => {
    element.textContent = message;
    element.classList.add(className);
};

// ===================================================================
// EVENT LISTENERS - Modern JavaScript Event Handling
// ===================================================================

/**
 * Initialize event listeners when DOM is ready
 * Uses modern event handling with arrow functions
 */
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('testString');
    
    // Enter key support using modern event handling
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkString();
        }
    });
    
    // Optional: Add real-time validation feedback
    input.addEventListener('input', () => {
        const value = input.value;
        const isValid = validateInput(value);
        
        // Use classList.toggle() for dynamic styling
        input.classList.toggle('invalid-input', value && !isValid);
    });
});

// ===================================================================
// DEBUGGING AND TESTING UTILITIES
// ===================================================================

/**
 * Debug function to trace pattern matching step by step
 */
const debugPatternMatch = (inputStr) => {
    console.log(`🔍 Debugging: "${inputStr}"`);
    console.log('Configuration:', REGEX_CONFIG);
    
    if (!inputStr || inputStr.length === 0) {
        console.log('✅ Empty string - Valid');
        return true;
    }
    
    if (!validateInput(inputStr)) {
        console.log('❌ Invalid characters');
        return false;
    }
    
    console.log('📍 Starting recursive matching...');
    return debugMatchPatternsRecursively(inputStr, 0, 1);
};

const debugMatchPatternsRecursively = (str, startPos, depth) => {
    const indent = '  '.repeat(depth);
    console.log(`${indent}🎯 Trying patterns from position ${startPos}`);
    
    if (startPos >= str.length) {
        console.log(`${indent}✅ Reached end of string - Success!`);
        return true;
    }
    
    const minPatternLength = getMinPatternLength();
    const possibleEndPositions = Array.from(
        {length: str.length - startPos - minPatternLength + 1}, 
        (_, i) => startPos + minPatternLength + i
    );
    
    console.log(`${indent}📋 Possible end positions:`, possibleEndPositions);
    
    for (const endPos of possibleEndPositions) {
        const substring = str.substring(startPos, endPos);
        console.log(`${indent}🔄 Trying pattern "${substring}" (${startPos}-${endPos})`);
        
        if (debugCanMatchSinglePatternExactly(str, startPos, endPos, depth + 1)) {
            console.log(`${indent}✅ Pattern "${substring}" matched! Continuing...`);
            if (debugMatchPatternsRecursively(str, endPos, depth + 1)) {
                return true;
            }
            console.log(`${indent}❌ Rest of string failed, backtracking...`);
        } else {
            console.log(`${indent}❌ Pattern "${substring}" failed`);
        }
    }
    
    console.log(`${indent}❌ No valid patterns found from position ${startPos}`);
    return false;
};

const debugCanMatchSinglePatternExactly = (str, start, end, depth) => {
    const indent = '  '.repeat(depth);
    const patternLength = end - start;
    const minLength = getMinPatternLength();
    const substring = str.substring(start, end);
    
    console.log(`${indent}🧩 Analyzing pattern "${substring}"`);
    
    if (patternLength < minLength) {
        console.log(`${indent}❌ Too short (${patternLength} < ${minLength})`);
        return false;
    }
    
    const maxAlphabetLength = patternLength - minLength;
    console.log(`${indent}📏 Max alphabet length: ${maxAlphabetLength}`);
    
    for (let alphabetLength = 0; alphabetLength <= maxAlphabetLength; alphabetLength++) {
        console.log(`${indent}🔄 Trying alphabet length: ${alphabetLength}`);
        let currentPos = start;
        
        // Step 1: (a+b)*
        const alphabetPart = str.substring(currentPos, currentPos + alphabetLength);
        console.log(`${indent}  1️⃣ (a+b)*: "${alphabetPart}"`);
        if (!canMatchAlphabetStar(str, currentPos, alphabetLength)) {
            console.log(`${indent}     ❌ Invalid alphabet sequence`);
            continue;
        }
        console.log(`${indent}     ✅ Valid alphabet sequence`);
        currentPos += alphabetLength;
        
        // Step 2: Required sequence
        const requiredSequences = Array.isArray(REGEX_CONFIG.REQUIRED_SEQUENCE) 
            ? REGEX_CONFIG.REQUIRED_SEQUENCE 
            : [REGEX_CONFIG.REQUIRED_SEQUENCE];
        
        // Handle empty required sequences
        if (!requiredSequences || requiredSequences.length === 0) {
            console.log(`🧩 Analyzing pattern "${str.substring(currentPos)}" - No required sequences configured`);
        } else {
            const requiredPart = str.substring(currentPos, currentPos + Math.max(...requiredSequences.map(seq => seq.length)));
            console.log(`🧩 Analyzing pattern "${str.substring(currentPos)}" - Required sequences ${JSON.stringify(requiredSequences)}: checking from "${str.substring(currentPos)}"`);
        }
        
        const afterRequired = canMatchRequiredSequence(str, currentPos);
        if (afterRequired === -1) {
            console.log(`🧩 Analyzing pattern "${str.substring(currentPos)}" - No required sequence found`);
            continue;
        }
        const requiredMatched = str.substring(currentPos, afterRequired);
        console.log(`🧩 Analyzing pattern "${str.substring(currentPos)}" - Matched required sequence: "${requiredMatched}"`);
        currentPos = afterRequired;
        
        // Step 3: Alternatives
        const remainingForAlt = str.substring(currentPos);
        console.log(`${indent}  3️⃣ Alternatives from "${remainingForAlt}"`);
        const afterAlternatives = canMatchAlternatives(str, currentPos);
        if (afterAlternatives === -1) {
            console.log(`${indent}     ❌ No alternative matched`);
            continue;
        }
        const altMatched = str.substring(currentPos, afterAlternatives);
        console.log(`${indent}     ✅ Matched alternative: "${altMatched}"`);
        currentPos = afterAlternatives;
        
        // Step 4: Repeatable sequences
        const remainingForSequences = str.substring(currentPos, end);
        console.log(`${indent}  4️⃣ Repeatable sequences: "${remainingForSequences}"`);
        if (canMatchRepeatableSequences(str, currentPos, end)) {
            console.log(`${indent}     ✅ All parts matched!`);
            return true;
        } else {
            console.log(`${indent}     ❌ Repeatable sequences failed`);
        }
    }
    
    return false;
};

/**
 * Test suite for debugging - uncomment to use
 * Uses modern array methods and template literals
 */
const runTestSuite = () => {
    const testCases = [
        // Basic valid cases
        { input: "", expected: true, description: "Empty string (zero repetitions)" },
        { input: "aab", expected: true, description: "Single pattern: '' + 'aa' + 'b' + ''" },
        { input: "aaab", expected: true, description: "Single pattern: '' + 'aa' + 'ab' + ''" },
        { input: "baab", expected: true, description: "Single pattern: 'b' + 'aa' + 'b' + ''" },
        
        // Test cases with NEW 'ba' alternative
        { input: "aaba", expected: true, description: "Single pattern: '' + 'aa' + 'ba' + ''" },
        { input: "baaba", expected: true, description: "Single pattern: 'b' + 'aa' + 'ba' + ''" },
        { input: "aabaaa", expected: true, description: "Single pattern: '' + 'aa' + 'ba' + 'aa'" },
        
        // Complex valid cases
        { input: "aabaab", expected: true, description: "Two patterns: 'aab' + 'aab'" },
        { input: "aabaabb", expected: true, description: "Single pattern with (aa+bb)*" },
        { input: "aabaabbaabb", expected: true, description: "Multiple patterns with pairs" },
        
        // Invalid cases (correctly invalid)
        { input: "ab", expected: false, description: "Missing required 'aa'" },
        { input: "aa", expected: false, description: "Missing required (b+ab+ba)" },
        { input: "abb", expected: false, description: "No valid 'aa' after any split" },
        { input: "aba", expected: false, description: "No 'aa' sequence anywhere in string" },
        { input: "bab", expected: false, description: "No 'aa' sequence anywhere in string" }
    ];
    
    console.log('🧪 Running Test Suite...\n');
    
    testCases.forEach((test, index) => {
        const result = matchPattern(test.input);
        const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
        const inputDisplay = test.input || '(empty)';
        
        console.log(`Test ${index + 1}: "${inputDisplay}" → ${result} ${status}`);
        console.log(`   Description: ${test.description}\n`);
    });
};

// Debug specific string - uncomment to debug "aaba"
debugPatternMatch("aaba");

// Quick test alternatives
console.log('🔍 Testing alternatives:');
console.log('Position 2 in "aaba":', '"aaba".substring(2, 4) =', "aaba".substring(2, 4));
console.log('Does "ba" match alternatives?', REGEX_CONFIG.ALTERNATIVE_OPTIONS.includes("ba"));
console.log('All alternatives:', REGEX_CONFIG.ALTERNATIVE_OPTIONS);

// Quick test for PATTERN_STAR configuration
console.log('\n🔧 Testing PATTERN_STAR Configuration:');
console.log('Current PATTERN_STAR:', REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR);

// Test with current configuration
console.log('With PATTERN_STAR =', REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR + ':');
console.log('  Empty string "":', matchPattern(""));
console.log('  Single pattern "aab":', matchPattern("aab"));
console.log('  Two patterns "aabaab":', matchPattern("aabaab"));

// Temporarily test with PATTERN_STAR = false
const originalPatternStar = REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR;
REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR = false;

console.log('\nWith PATTERN_STAR = false:');
console.log('  Empty string "":', matchPattern(""));
console.log('  Single pattern "aab":', matchPattern("aab"));
console.log('  Two patterns "aabaab":', matchPattern("aabaab"));

// Restore original configuration
REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR = originalPatternStar;
console.log('\n✅ Configuration restored to original settings\n');

// Uncomment the line below to run tests automatically
// runTestSuite();

// Quick test for REQUIRED_SEQUENCE formats
console.log('\n🔧 Testing REQUIRED_SEQUENCE Format Flexibility:');
console.log('Current format:', typeof REGEX_CONFIG.REQUIRED_SEQUENCE === 'string' ? 'string' : 'array');
console.log('Current value:', REGEX_CONFIG.REQUIRED_SEQUENCE);

// Test with current configuration
console.log('\nTesting "aab" with current format:');
console.log('Result:', matchPattern("aab"));

// Temporarily test with string format
const originalRequired = REGEX_CONFIG.REQUIRED_SEQUENCE;
REGEX_CONFIG.REQUIRED_SEQUENCE = 'aa';  // Single string

console.log('\nWith REQUIRED_SEQUENCE as string "aa":');
console.log('Format:', typeof REGEX_CONFIG.REQUIRED_SEQUENCE === 'string' ? 'string' : 'array');
console.log('Value:', REGEX_CONFIG.REQUIRED_SEQUENCE);
console.log('Testing "aab":', matchPattern("aab"));

// Restore original configuration
REGEX_CONFIG.REQUIRED_SEQUENCE = originalRequired;
console.log('\n✅ Configuration restored to original format\n');

// Comprehensive test for empty array configurations
console.log('\n🔧 Testing Empty Array Configurations:');

// Store original configuration
const originalConfig = {
    ALPHABET: [...REGEX_CONFIG.ALPHABET],
    REQUIRED_SEQUENCE: Array.isArray(REGEX_CONFIG.REQUIRED_SEQUENCE) ? [...REGEX_CONFIG.REQUIRED_SEQUENCE] : REGEX_CONFIG.REQUIRED_SEQUENCE,
    ALTERNATIVE_OPTIONS: [...REGEX_CONFIG.ALTERNATIVE_OPTIONS],
    REPEATABLE_SEQUENCES: [...REGEX_CONFIG.REPEATABLE_SEQUENCES]
};

// Test 1: Empty ALPHABET
console.log('\n1️⃣ Testing ALPHABET = []:');
REGEX_CONFIG.ALPHABET = [];
console.log('  Empty string "":', matchPattern(""));
console.log('  Non-empty string "a":', matchPattern("a"));

// Test 2: Empty REQUIRED_SEQUENCE  
console.log('\n2️⃣ Testing REQUIRED_SEQUENCE = []:');
REGEX_CONFIG.ALPHABET = ['a', 'b']; // Restore alphabet
REGEX_CONFIG.REQUIRED_SEQUENCE = [];
console.log('  String "ab":', matchPattern("ab"));
console.log('  String "ba":', matchPattern("ba"));

// Test 3: Empty ALTERNATIVE_OPTIONS
console.log('\n3️⃣ Testing ALTERNATIVE_OPTIONS = []:');
REGEX_CONFIG.REQUIRED_SEQUENCE = ['aa']; // Restore required
REGEX_CONFIG.ALTERNATIVE_OPTIONS = [];
console.log('  String "aa":', matchPattern("aa"));
console.log('  String "aab":', matchPattern("aab"));

// Test 4: Empty REPEATABLE_SEQUENCES
console.log('\n4️⃣ Testing REPEATABLE_SEQUENCES = []:');
REGEX_CONFIG.ALTERNATIVE_OPTIONS = ['b']; // Restore alternatives
REGEX_CONFIG.REPEATABLE_SEQUENCES = [];
console.log('  String "aab":', matchPattern("aab"));
console.log('  String "aabaa":', matchPattern("aabaa"));

// Test 5: All arrays empty (extreme case)
console.log('\n5️⃣ Testing ALL arrays empty:');
REGEX_CONFIG.ALPHABET = [];
REGEX_CONFIG.REQUIRED_SEQUENCE = [];
REGEX_CONFIG.ALTERNATIVE_OPTIONS = [];
REGEX_CONFIG.REPEATABLE_SEQUENCES = [];
console.log('  Empty string "":', matchPattern(""));
console.log('  Any string "test":', matchPattern("test"));

// Restore original configuration
console.log('\n✅ Restoring original configuration...');
REGEX_CONFIG.ALPHABET = originalConfig.ALPHABET;
REGEX_CONFIG.REQUIRED_SEQUENCE = originalConfig.REQUIRED_SEQUENCE;
REGEX_CONFIG.ALTERNATIVE_OPTIONS = originalConfig.ALTERNATIVE_OPTIONS;
REGEX_CONFIG.REPEATABLE_SEQUENCES = originalConfig.REPEATABLE_SEQUENCES;
console.log('✅ All configurations restored!\n');

// Comprehensive STAR_CONFIG testing - replace all previous tests
console.log('\n🌟 COMPREHENSIVE STAR_CONFIG TESTING 🌟');

// Store original configuration
const originalStarConfig = {
    ALPHABET_STAR: REGEX_CONFIG.STAR_CONFIG.ALPHABET_STAR,
    REPEATABLE_STAR: REGEX_CONFIG.STAR_CONFIG.REPEATABLE_STAR,
    PATTERN_STAR: REGEX_CONFIG.STAR_CONFIG.PATTERN_STAR
};

// Test all 8 combinations of star configurations
const starConfigurations = [
    { ALPHABET_STAR: true,  REPEATABLE_STAR: true,  PATTERN_STAR: true  },
    { ALPHABET_STAR: true,  REPEATABLE_STAR: true,  PATTERN_STAR: false },
    { ALPHABET_STAR: true,  REPEATABLE_STAR: false, PATTERN_STAR: true  },
    { ALPHABET_STAR: true,  REPEATABLE_STAR: false, PATTERN_STAR: false },
    { ALPHABET_STAR: false, REPEATABLE_STAR: true,  PATTERN_STAR: true  },
    { ALPHABET_STAR: false, REPEATABLE_STAR: true,  PATTERN_STAR: false },
    { ALPHABET_STAR: false, REPEATABLE_STAR: false, PATTERN_STAR: true  },
    { ALPHABET_STAR: false, REPEATABLE_STAR: false, PATTERN_STAR: false }
];

starConfigurations.forEach((config, index) => {
    console.log(`\n${index + 1}️⃣ Testing Configuration:`, config);
    
    // Apply configuration
    REGEX_CONFIG.STAR_CONFIG = { ...config };
    
    // Calculate and show dynamic minimum length
    const minLen = getMinPatternLength();
    console.log(`   📏 Dynamic min length: ${minLen}`);
    
    // Show what the pattern looks like
    const alphabetPart = config.ALPHABET_STAR ? '(a+b)*' : '(a+b)';
    const repeatablePart = config.REPEATABLE_STAR ? '(aa+bb)*' : '(aa+bb)';
    const patternPart = config.PATTERN_STAR ? '[pattern]*' : 'pattern';
    console.log(`   📝 Pattern: ${patternPart.replace('pattern', `${alphabetPart}aa(b+ab)${repeatablePart}`)}`);
    
    // Test key cases
    const testCases = [
        { input: '', desc: 'empty string' },
        { input: 'aab', desc: 'basic pattern' },
        { input: 'ab', desc: 'missing aa' },
        { input: 'aabaab', desc: 'two patterns' },
        { input: 'baabaa', desc: 'with alphabet+repeatable' }
    ];
    
    testCases.forEach(test => {
        const result = matchPattern(test.input);
        const inputDisplay = test.input || '(empty)';
        console.log(`   "${inputDisplay}" → ${result} (${test.desc})`);
    });
});

// Restore original configuration
console.log('\n✅ Restoring original STAR_CONFIG...');
REGEX_CONFIG.STAR_CONFIG = originalStarConfig;
console.log('✅ STAR_CONFIG testing complete!\n');