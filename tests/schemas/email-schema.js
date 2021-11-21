const emailExists = require('../email-exists');

module.exports = {
    email: {
        rules: [
            {
                rule: async (input) => await emailExists(input),
                message: 'This email address already exists'
            }
        ]
    }
};
