module.exports = {
    id: {
        rules: [
            {
                rule: (input) => !input,
                message: 'Id is required'
            }
        ]
    },
    name: {
        optional: true,
        rules: [
            {
                rule: (input) => input.length < 3,
                message: 'Name should be at least 3 characters long'
            }
        ]
    }
};
