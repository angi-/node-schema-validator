const validator = require('validator');

const productTypes = {
    MONITOR: 'monitor',
    SPEAKER: 'speaker'
}

module.exports = {
    type: {
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'Type is required'
            },
            {
                rule: (input) => !validator.isIn(input, [productTypes.MONITOR, productTypes.SPEAKER]),
                message: 'Type should be one of values ' + [productTypes.MONITOR, productTypes.SPEAKER].join(', ')
            }
        ]
    },
    resolution: {
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'Resolution is required',
                when: ({ type }) => type === productTypes.MONITOR
            }
        ]
    },
    watts: {
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'Watts is required',
                when: ({ type }) => type === productTypes.SPEAKER
            }
        ]
    }
};
