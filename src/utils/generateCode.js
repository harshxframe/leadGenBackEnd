export function generateCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

// Examples:
console.log(generateCode());    // Outputs a 6-digit code (e.g., "482015")
console.log(generateCode(4));   // Outputs a 4-digit code (e.g., "9301")
console.log(generateCode(8));   // Outputs an 8-digit code (e.g., "75193042")
