const SchemaValidator = require('../src/schema-validator');
const assert = require('assert');

// Test schemas
const requiredOptionalSchema = require('./schemas/required-optional-schema');
const emailSchema = require('./schemas/email-schema');
const minMaxSchema = require('./schemas/min-max-schema');
const sanitizedSchema = require('./schemas/sanitized-schema');
const conditionalSchema = require('./schemas/conditional-schema');

// Custom fail function
const failFunction = (req, res, errors) => errors;

// Schema validator instance
const schemaValidator = new SchemaValidator(failFunction);

// Middleware req, res, next mock
const mock = {
    req: {},
    res: {
        status: (code) => {
            return { json: (input) => input }
        }
    },
    next: () => {}
}

describe('Schema validator middleware', () => {
    it('Should call next()', () => {
        let increment = 0;
        const nextFunction = () => increment++;

        const schema = {};
        const body = {};

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, nextFunction, schema, body)
            .then(() => {
                assert.equal(increment, 1);
            })
    });

    let validatorResponse = schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, requiredOptionalSchema, {}, failFunction)

    it('Should contain exactly one validation error', () => {
        return validatorResponse.then((validationErrors) => {
            assert.equal(validationErrors.length, 1);
        });
    });

    it('First validation error message should relate to Id', () => {
        return validatorResponse.then((validationErrors) => {
            assert.equal(validationErrors[0].message, 'Id is required');
        });
    });

    it('Should validate async method with existing email', () => {
        body = {
            email: 'exists@domain.com'
        }

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, emailSchema, body, failFunction).then((validationErrors) => {
            assert.equal(validationErrors.length, 1);
        });
    });

    it('Should validate async method with non-existing email', () => {
        body = {
            email: 'does-not-exist@domain.com'
        }

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, emailSchema, body, failFunction).then((validationErrors) => {
            assert.equal(typeof validationErrors, 'undefined');
        });
    });


    it('Value should be between min and max', () => {
        body = {
            min: 5,
            max: 100,
            value: 50
        }

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, minMaxSchema, body, failFunction).then((validationErrors) => {
            assert.equal(typeof validationErrors, 'undefined');
        });
    });

    it('Value should be higher than max', () => {
        body = {
            min: 5,
            max: 100,
            value: 150
        }

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, minMaxSchema, body, failFunction).then((validationErrors) => {
            assert.notEqual(typeof validationErrors, 'undefined');
        });
    });

    it('Should sanitize input', () => {
        body = { name: 'ELON MUSK' };

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, sanitizedSchema, body, failFunction).then((validationErrors) => {
            assert.equal(body.name, 'ksum nole');
        });
    });

    it('Should take conditional rules into account', () => {
        body = {
            type: 'monitor'
        }

        return schemaValidator.runValidationMiddleware(mock.req, mock.res, mock.next, conditionalSchema, body, failFunction).then((validationErrors) => {
            assert.equal(validationErrors.length, 1);
            assert.equal(validationErrors[0].field, 'resolution');
        })
    });
});
