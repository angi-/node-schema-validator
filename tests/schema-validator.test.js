const { schemaValidator } = require('../src//schema-validator');
const assert = require('assert');

const requiredOptionalSchema = require('./schemas/required-optional-schema');
const emailSchema = require('./schemas/email-schema');
const minMaxSchema = require('./schemas/min-max-schema');

const mocks = {
    req: {},
    res: {
        status: (code) => {
            return { json: (input) => input }
        }
    },
    next: () => {}
}

const failFunction = (req, res, errors) => errors;

describe('Schema validator middleware', () => {
    it('Should call next()', () => {
        let increment = 0;
        const nextFunction = () => increment++;

        const schema = {};
        const body = {};

        return schemaValidator(mocks.req, mocks.res, nextFunction, schema, body)
            .then(() => {
                assert.equal(increment, 1);
            })
    });

    let validatorResponse = schemaValidator(mocks.req, mocks.res, mocks.next, requiredOptionalSchema, {}, failFunction)

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

        return schemaValidator(mocks.req, mocks.res, mocks.next, emailSchema, body, failFunction).then((validationErrors) => {
            assert.equal(validationErrors.length, 1);
        });
    });

    it('Should validate async method with non-existing email', () => {
        body = {
            email: 'does-not-exist@domain.com'
        }

        return schemaValidator(mocks.req, mocks.res, mocks.next, emailSchema, body, failFunction).then((validationErrors) => {
            assert.equal(typeof validationErrors, 'undefined');
        });
    });


    it('Value should be between min and max', () => {
        body = {
            min: 5,
            max: 100,
            value: 50
        }

        return schemaValidator(mocks.req, mocks.res, mocks.next, minMaxSchema, body, failFunction).then((validationErrors) => {
            assert.equal(typeof validationErrors, 'undefined');
        });
    });

    it('Value should be higher than max', () => {
        body = {
            min: 5,
            max: 100,
            value: 150
        }

        return schemaValidator(mocks.req, mocks.res, mocks.next, minMaxSchema, body, failFunction).then((validationErrors) => {
            assert.notEqual(typeof validationErrors, 'undefined');
        });
    });
});
