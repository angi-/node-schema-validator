const lowercaseSanitizer = (input) => input.toLowerCase();
const reverseSanitizer = (input) => input.split('').reverse().join('');

module.exports = {
    name: {
        rules: [
            {
                rule: async (input) => !input,
                message: 'Name is required'
            }
        ],
        sanitizers: [
            lowercaseSanitizer,
            reverseSanitizer
        ]
    }
};
