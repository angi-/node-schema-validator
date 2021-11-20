/**
 * Processes schema rules by passing a data source
 * 
 * @param {Object} schema 
 * @param {Object} dataSource 
 * @returns {Promise<boolean>}
 */
const processSchema = async (schema, dataSource) => {
    const errors = [];
    let foundError = false;
    const schemaKeys = Object.keys(schema);

    for (const key of schemaKeys) {
        const inputValue = dataSource.hasOwnProperty(key) ? dataSource[key] : '';
        foundError = false;

        const optionalValidation = schema[key].hasOwnProperty('optional') && schema[key].optional && (
            !dataSource.hasOwnProperty(key) ||
            dataSource[key] === '' ||
            dataSource[key] === null ||
            dataSource[key] === undefined
        );

        if (!optionalValidation) {
            for (const rule of schema[key].rules) {
                const ruleOutcome = await rule.rule(inputValue);

                if (!foundError && ruleOutcome === true) {
                    foundError = true;
                    errors.push({
                        field: key,
                        message: rule.message
                    });
                }
            }
        }
    }

    return errors;
}

/**
 * Default fail callback function
 * 
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object[]} errors Array containing the validation errors
 * @returns {Function}
 */
const defaultFailCallback = (req, res, errors) => res.status(422).json({ message: errors });

/**
 * Validates a schema based on a targer object
 * Calls next() on success, failCallback() on failure
 * 
 * @param {Object} schema           Schema onject
 * @param {Object} targetObject     Target object (request ot response)
 * @param {Function} failCallback   Function to be called on failure
 * @returns {Function}              Middleware function
 */
const schemaValidator = async (req, res, next, schema, targetObject, failCallback) => {
    const errors = await processSchema(schema, targetObject);

    if (errors.length === 0) {
        return next();
    }

    if (!failCallback) {
        failCallback = defaultFailCallback;
    }

    failCallback(req, res, errors);
};

module.exports = {
    /**
     * 
     * @param {Object} schema           Validation schema
     * @param {Function} failCallback   Failure callback function (optional)
     * @returns {Function}              Middleware function
     */
    bodySchemaValidator: (schema, failCallback) => {
        return async (req, res, next) => await schemaValidator(req, res, next, schema, req.body, failCallback);
    },

    /**
     * 
     * @param {Object} schema           Validation schema
     * @param {Function} failCallback   Failure callback function (optional)
     * @returns {Function}              Middleware function
     */
    paramSchemaValidator: (schema, failCallback) => {
        return async (req, res, next) => schemaValidator(req, res, next, schema, req.params, failCallback);
    }
}
