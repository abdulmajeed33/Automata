// Regular Expression: [(a+b)*aa(b+ab)(aa+bb)*]*
// This means: zero or more repetitions of the pattern (a+b)*aa(b+ab)(aa+bb)*

// ===========================================
// EASILY MODIFIABLE REGEX PATTERN FUNCTIONS
// ===========================================
// To change the regex, modify these functions:

// Pattern part 1: (a+b)* - any sequence of 'a' and 'b'
// Modified to try different lengths (backtracking approach)
function isValidABChar(char) {
    return char === 'a' || char === 'b';
}

// Check if a substring from start to end contains only 'a' and 'b'
function isValidABSequence(str, start, length) {
    for (let i = 0; i < length; i++) {
        if (start + i >= str.length || !isValidABChar(str[start + i])) {
            return false;
        }
    }
    return true;
}

// Pattern part 2: aa - exactly "aa"
function matchExactAA(str, pos) {
    if (pos + 1 < str.length && str[pos] === 'a' && str[pos + 1] === 'a') {
        return pos + 2;
    } else {
        return -1; // Failed to match
    }
}

// Pattern part 3: (b+ab) - either "b" or "ab"
function matchBOrAB(str, pos) {
    if (pos < str.length) {
        if (str[pos] === 'b') {
            return pos + 1; // Matched "b"
        } else if (pos + 1 < str.length && str[pos] === 'a' && str[pos + 1] === 'b') {
            return pos + 2; // Matched "ab"
        }
    }
    return -1; // Failed to match
}

// Pattern part 4: (aa+bb)* - zero or more "aa" or "bb"
function matchOptionalAABB(str, pos) {
    while (pos + 1 < str.length) {
        if (str[pos] === 'a' && str[pos + 1] === 'a') {
            pos += 2; // Matched "aa"
        } else if (str[pos] === 'b' && str[pos + 1] === 'b') {
            pos += 2; // Matched "bb"
        } else {
            break; // No more matches
        }
    }
    return pos;
}

// Complete inner pattern with backtracking: (a+b)*aa(b+ab)(aa+bb)*
function matchSinglePattern(str, pos) {
    // Try different lengths for (a+b)* part - from 0 to remaining length
    let maxPossibleAB = str.length - pos - 3; // Need at least 3 chars for "aa" + ("b" or "ab")
    if (maxPossibleAB < 0) maxPossibleAB = 0;
    
    // Try each possible length for (a+b)* part
    for (let abLength = 0; abLength <= maxPossibleAB; abLength++) {
        // Check if this length gives us a valid (a+b)* sequence
        if (isValidABSequence(str, pos, abLength)) {
            let currentPos = pos + abLength;
            
            // Step 2: Try to match "aa"
            let afterAA = matchExactAA(str, currentPos);
            if (afterAA !== -1) {
                // Step 3: Try to match (b+ab)
                let afterBOrAB = matchBOrAB(str, afterAA);
                if (afterBOrAB !== -1) {
                    // Step 4: Try to match (aa+bb)* - try all possible end positions
                    let maxRemainingForAABB = str.length - afterBOrAB;
                    
                    // Try all possible lengths for (aa+bb)*, starting from 0
                    for (let targetEnd = afterBOrAB; targetEnd <= str.length; targetEnd++) {
                        if (canMatchAABBStar(str, afterBOrAB, targetEnd)) {
                            return targetEnd; // Return first valid match (shortest)
                        }
                    }
                }
            }
        }
    }
    
    return -1; // Failed to find any valid combination
}

// Helper function to check if a substring can be matched by (aa+bb)*
function canMatchAABBStar(str, start, end) {
    let pos = start;
    
    while (pos < end) {
        if (pos + 1 < end) {
            if ((str[pos] === 'a' && str[pos + 1] === 'a') ||
                (str[pos] === 'b' && str[pos + 1] === 'b')) {
                pos += 2; // Matched "aa" or "bb"
            } else {
                return false; // Can't match this pair
            }
        } else {
            return false; // Odd number of characters left, can't match
        }
    }
    
    return true; // Successfully matched all characters
}

// Full pattern: [(a+b)*aa(b+ab)(aa+bb)*]*
// This means zero or more repetitions of the single pattern
function matchFullPattern(str) {
    return matchFullPatternHelper(str, 0);
}

// Helper function with backtracking to try all possible pattern splits
function matchFullPatternHelper(str, pos) {
    // Handle empty string or reached end (zero repetitions)
    if (pos >= str.length) {
        return true;
    }
    
    // Try to match patterns of different lengths starting from pos
    for (let endPos = pos + 3; endPos <= str.length; endPos++) {
        // Try to match a single pattern from pos to endPos
        if (canMatchSinglePatternExactly(str, pos, endPos)) {
            // If this pattern matches, recursively try to match the rest
            if (matchFullPatternHelper(str, endPos)) {
                return true; // Found a complete solution
            }
        }
    }
    
    return false; // No valid pattern found
}

// Check if substring from start to end can be matched by exactly one pattern
function canMatchSinglePatternExactly(str, start, end) {
    let pos = start;
    let maxPossibleAB = end - start - 3; // Need at least 3 chars for "aa" + ("b" or "ab")
    if (maxPossibleAB < 0) return false;
    
    // Try each possible length for (a+b)* part
    for (let abLength = 0; abLength <= maxPossibleAB; abLength++) {
        // Check if this length gives us a valid (a+b)* sequence
        if (isValidABSequence(str, pos, abLength)) {
            let currentPos = pos + abLength;
            
            // Step 2: Try to match "aa"
            let afterAA = matchExactAA(str, currentPos);
            if (afterAA !== -1) {
                // Step 3: Try to match (b+ab)
                let afterBOrAB = matchBOrAB(str, afterAA);
                if (afterBOrAB !== -1) {
                    // Step 4: Check if remaining chars can be matched by (aa+bb)*
                    if (canMatchAABBStar(str, afterBOrAB, end)) {
                        return true; // Found exact match
                    }
                }
            }
        }
    }
    
    return false; // No valid combination found
}

// ===========================================
// INPUT VALIDATION AND MAIN LOGIC
// ===========================================

function isValidInput(str) {
    // Check if string contains only 'a' and 'b'
    for (let i = 0; i < str.length; i++) {
        if (str[i] !== 'a' && str[i] !== 'b') {
            return false;
        }
    }
    return true;
}

function checkString() {
    const input = document.getElementById('testString');
    const result = document.getElementById('result');
    const testString = input.value.trim();
    
    // Clear previous styling
    result.className = 'result-message';
    
    if (testString === '') {
        result.textContent = 'Please enter a string to test';
        result.classList.add('empty');
        return;
    }
    
    // Validate input characters
    if (!isValidInput(testString)) {
        result.textContent = 'Invalid string - Only \'a\' and \'b\' characters allowed';
        result.classList.add('invalid');
        return;
    }
    
    // Check if string matches the pattern
    if (matchFullPattern(testString)) {
        result.textContent = 'Valid string';
        result.classList.add('valid');
    } else {
        result.textContent = 'Invalid string';
        result.classList.add('invalid');
    }
}

// Allow Enter key to trigger check
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('testString');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkString();
        }
    });
});

// ===========================================
// DEBUGGING HELPER (FOR DEVELOPMENT/TESTING)
// ===========================================
// Uncomment the following function to test various strings automatically

/*
function runTests() {
    const testCases = [
        { input: "", expected: true },      // Empty string (zero repetitions)
        { input: "aab", expected: true },   // (a+b)*="", aa="aa", (b+ab)="b"
        { input: "aaab", expected: true },  // (a+b)*="", aa="aa", (b+ab)="ab"  
        { input: "baab", expected: true },  // (a+b)*="b", aa="aa", (b+ab)="b"
        { input: "aabaab", expected: true }, // Two patterns: "aab" + "aab"
        { input: "baabaabb", expected: true }, // Two patterns with (aa+bb)*
        { input: "ab", expected: false },   // Should fail because no "aa"
        { input: "aa", expected: false },   // Should fail because no (b+ab)
        { input: "abb", expected: false },  // Should fail because no "aa" (after trying all combinations)
    ];
    
    console.log("Running tests:");
    testCases.forEach((test, index) => {
        const result = matchFullPattern(test.input);
        const status = result === test.expected ? "PASS" : "FAIL";
        console.log(`Test ${index + 1}: "${test.input}" -> ${result} (expected ${test.expected}) [${status}]`);
    });
}
*/ 