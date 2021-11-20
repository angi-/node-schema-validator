const { schemaValidator } = require('./schema-validator');
const assert = require('assert');

const schema = {
    id: {
        rules: [
            {
                rule: (str) => !str,
                message: 'Id is required'
            }
        ]
    },
    name: {
        optional: true,
        rules: [
            {
                rule: (str) => !str,
                message: 'Should not reach here'
            }
        ]
    }
};

const successBody = {
    id: 'something'
};

const failBody = {};

const mocks = {
    req: {},
    res: {
        status: (code) => {
            return { json: (str) => str}
        }
    },
    next: () => {}
}

describe('Schema validator middleware', () => {
    it('Should call next()', () => {
        let call = 0;

        const nextFunction = () => call++;

        return schemaValidator(mocks.req, mocks.res, nextFunction, schema, successBody).then(result => {
            assert.equal(call, 1);
        });
    });

    it('Should return errors', () => {
        let middlewareErrors = null

        const failFunction = (req, res, errors) => { middlewareErrors = errors };

        return schemaValidator(mocks.req, mocks.res, mocks.next, schema, failBody, failFunction).then(result => {
            assert.notEqual(middlewareErrors, null);
            assert.equal(middlewareErrors[0].message, 'Id is required');
        });
    });
});
