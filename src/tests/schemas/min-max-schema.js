module.exports = {
    min: {
        rules: [
            {
                rule: (input) => !input,
                message: 'Min is required'
            }
        ]
    },
    max: {
        rules: [
            {
                rule: (input) => !input,
                message: 'Max is required'
            }
        ]
    },
    value: {
        rules: [
            {
                rule: (input, { min, max }) => input < min || input > max,
                message: 'This field must be between {{min}} and {{max}}'
            }
        ]
    }
};
