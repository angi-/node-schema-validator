# nodejs-schema-validator

[![version](https://img.shields.io/npm/v/nodejs-schema-validator.svg?color=green)](http://npm.im/nodejs-schema-validator)
[![CircleCI](https://circleci.com/gh/angi-/node-schema-validator/tree/main.svg?style=svg)](https://circleci.com/gh/angi-/node-schema-validator/tree/main)
[![MIT License](https://img.shields.io/npm/l/nodejs-schema-validator.svg)](http://opensource.org/licenses/MIT)

NodeJS validation middleware for express router using schemas for both body and url parameters.

This library allows you to use any validation library, even your own. Examples are using [validator](https://github.com/validatorjs/validator.js)

# Table of contents
1. [Installation](#installation)
2. [Basic usage](#basic-usage)
3. [Schema structure](#schema-structure)
4. [Optional fields](#optional-fields)
5. [Validating both body and parameters](#validating-both-body-and-parameters)
6. [Custom validation output](#custom-validation-output)
7. [Using field values in messages](#using-field-values-in-messages)
8. [Async/await validation](#asyncawait-validation)
9. [Cross field validation](#cross-field-validation)
10. [Conditional validation](#conditional-validation)
11. [Using sanitizers](#using-sanitizers)
12. [Contributing](#contributing)

## Installation
> npm i nodejs-schema-validator

## Basic usage
This validates a post request by looking into `req.body` for email value.
```js
// Import SchemaValidator
const SchemaValidator = require('nodejs-schema-validator');

// Import a validator library of your choice
const validator = require('validator');

// Create a new schema validator instance
const schemaValidatorInstance = new SchemaValidator();

// Define your schema (or import it from a dedicated file)
const userEmailSchema = {
    email: {
        rules: [
            {
                rule: (input) => !input || validator.isEmpty('input'),
                message: 'Email address is required'
            },
            {
                rule: (input) => !validator.isEmail(input),
                message: 'This is not a valid email address'
            }
        ]
    }
};

// Add body schema validator as a middleware to your router endpoints
router.post(
    '/user/:id',
    schemaValidatorInstance.validateBody(userEmailSchema),
    (req, res) => { /* Data is valid, add your logic */ }
);
```

## Schema structure
Here's a breakdown of how the schema is structured:

```js
// Schema is an object containing the fields we want to validate from req.body
const schemaExample = {
    name: {
        // A field can have multiple rules
        rules: [
            // A rule contains the validation function and a message for failure
            {
                rule: (input) => !input || validator.isEmpty(input),
                message: 'Name is required'
            },
            {
                rule: (input) => !validator.isLength(3, 20),
                message: 'Name should have a length between 3 and 20 characters'
            }
        ]
    },
    bitcoin_address: {
        // Some fields can be optional
        optional: true,
        rules: [
            rule: (input) => !validator.isBtcAddress(input),
            message: 'This is not a valid Bitcoin address'
        ]
    }
};
```

## Optional fields
Marking fields as optional will validate only when they are not empty.
```js
const schema = {
    vatNo: {
        // Some fields can be optional
        optional: true,
        rules: [
            rule: (input) => !validator.isValidVatNo(input),
            message: 'Please insert a valid VAT number of leave empty'
        ]
    }
};
```

## Validating both body and parameters
Example of how to validate both body and url parameters

```js
// Schema for validating id as a valid UUID v4
const userParamSchema = {
    id: {
        rules: [
            {
                rule: (input) => !validator.isUUID(input, 4),
                message: 'User ID should be a valid v4 UUID'
            }
        ]
    }
};

const userBodySchema = {
    name: {
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'User name is mandatory'
            }
        ]
    }
};

// This validates user data
router.post(
    '/user/',
    schemaValidatorInstance.validateBody(userBodySchema),
    (req, res) => { /* Your logic */ }
);

// This validates both user id and user data
router.put(
    '/user/:id',
    schemaValidatorInstance.validateParams(userParamSchema),
    schemaValidatorInstance.validateBody(userBodySchema),
    (req, res) => { /* Your logic */ }
)
```

## Custom validation output
Validation failure returns status code 422 with a body in this format:
```js
{
    "message": [
        {
            "field": "name",
            "message": "Name is required"
        }
    ]
}
```

In case you want to customize the output and status code of the failure you can pass a function in the `SchemaValidator` constructor:

```js
// Define your function in this format
const myCustomValidationOutput = (req, res, errors) => {
    res.status(422).json({ message: errors });
};

// Pass it in constructor
const schemaValidatorInstance = new SchemaValidator(myCustomValidationOutput);
```

## Using field values in messages
Field names wrapped in double curly braces will be replaced with their values. **Please note that there should be no space between the field name and the braces**.
```js
const schema = {
    amount: {
        rules: [
            {
                rule: async (input) => amount < 100,
                message: 'You entered {{amount}} but should be at least 100'
            }
        ]
    }
};
```

## Async/await validation
Schema rules support async methods. Here's an example:

```js
const schema = {
    email: {
        rules: [
            {
                rule: async (input) => await emailExists(input),
                message: 'Email address {{email}} already exists'
            }
        ]
    }
};

```

## Cross field validation
Validation rules can depend on other values:
```js
const schema = {
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
```

## Conditional validation
Fields and rules can have validation skipped based on conditions using `when` function. Validation skips in case it returns `false`.

```js
const schema = {
     type: {
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'Type is required'
            }
        ]
    },
    resolution: {
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'Resolution is required',
                // Only validate this rule when type is 'monitor'
                when: ({ type }) => type === 'monitor'
            }
        ]
    },
    watts: {
        // Only validate this field when type is 'speaker'
        when: ({ type }) => type === 'speaker',
        rules: [
            {
                rule: (input) => !input || input === '',
                message: 'Power in watts is required',
            }
        ]
    }
}
```

## Using sanitizers
You can add an array of sanitizers that will be processed after validation:
```js
const lowercaseSanitizer = (input) => input.toLowerCase();
const reverseSanitizer = (input) => input.split('').reverse().join('');

const schema = {
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
```

Example payload:
```js
{ name: 'ELON MUSK' }
```

Sanitized output:
```js
{ name: 'ksum nole' }
```
## Contributing
Pull requests are welcome. Run tests with:
```console
npm run test
```

## License (MIT)

```
Copyright (c) 2021 Angelin Sirbu <angelin.sirbu@yahoo.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

