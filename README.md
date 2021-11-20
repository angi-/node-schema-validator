# nodejs-schema-validator

[![version](https://img.shields.io/npm/v/nodejs-schema-validator.svg?color=green)](http://npm.im/nodejs-schema-validator)
[![travis build](https://img.shields.io/travis/angi-/nodejs-schema-validator.svg)](https://travis-ci.org/angi-/nodejs-schema-validator)
[![MIT License](https://img.shields.io/npm/l/nodejs-schema-validator.svg)](http://opensource.org/licenses/MIT)

NodeJS validation middleware for express router using schemas for both body and url parameters.

This library allows you to use any validation library, even your own. Examples are using [validator](https://github.com/validatorjs/validator.js)

# Installation and usage
> npm i nodejs-schema-validator

## Quick example
This validates a post request

```js
const { bodySchemaValidator } = require('nodejs-schema-validator');
const validator = require('validator');

// Schema is an object containing the fields we want to validate
const userBodySchema = {
    name: {
        // A field can have multiple rules
        rules: [
            // A rule contains the validation function and a message for failure
            {
                rule: (str) => !str || validator.isEmpty(str),
                message: 'Name is required'
            },
            {
                rule: (str) => !validator.isLength(3, 20),
                message: 'Name should have a length between 3 and 20 characters'
            }
        ]
    },
    bitcoin_address: {
        // Some fields can be optional
        optional: true,
        rules: [
            rule: (str) => !validator.isBtcAddress(str),
            message: 'This is not a valid Bitcoin address'
        ]
    }
}

// Add body schema validator as a middleware to your router endpoints
router.post(
    '/user/',
    bodySchemaValidator(userBodySchema),
    (req, res) => { /* Your logic */ }
);

router.put(
    '/user/:id',
    bodySchemaValidator(userBodySchema),
    (req, res) => { /* Your logic */ }
)
```

## Parameter validation
You can also validate route parameters

```js
const { paramSchemaValidator } = require('nodejs-schema-validator');

const userParamSchema = {
    id: {
        rules: [
            {
                rule: (str) => !validator.isUUID(str, 4),
                message: 'User ID should be a valid v4 UUID'
            }
        ]
    }
}

router.get(
    '/user/:id',
    paramSchemaValidator(userParamSchema),
    (req, res) => { /* Your logic */ }
)
```

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

## Custom validation output
In case you want to customize the output and status code of the failure you can pass a function as the second parameter to the middleware. It can be passed to both `paramSchemaValidator` and `bodySchemaValidator`.

```js
const myCustomValidationOutput = (req, res, errors) => {
    res.status(422).json({ message: errors });
}

router.post(
    '/user/',
    bodySchemaValidator(userBodySchema, myCustomValidationOutput),
    (req, res) => { /* Your logic */ }
)
```

## Contributing
Allowing pull requests

## License (MIT)

```
Copyright (c) 2021 Angelin Sirbu <angelin.sirbu@yahoo.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

