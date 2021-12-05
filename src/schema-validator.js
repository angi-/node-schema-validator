/**
 * Injects values in message
 * 
 * @param {Object} vars 
 * @param {String} message 
 * 
 * @returns {String} 
 */
const injectVarsInMessage = (vars, message) => {
    const keys = Object.keys(vars);
    
    keys.forEach(key => {
        message = message.replace('{{' + key + '}}', vars[key]);
    });

    return message;
};

/**
 * Checks if a schema field has optional validation
 * 
 * @param {Object} schema 
 * @param {Object} dataSource 
 * @param {String} key 
 * 
 * @returns {Boolean}
 */
const isOptionalValidation = (schema, dataSource, key) => {
    return schema[key].hasOwnProperty('optional') && schema[key].optional && (
        !dataSource.hasOwnProperty(key) ||
        dataSource[key] === '' ||
        dataSource[key] === null ||
        dataSource[key] === undefined
    );
};

/**
 * Checks if rule validation should be skipped
 * 
 * @param {Function} rule 
 * @param {Object} targetObject 
 * 
 * @returns {Boolean}
 */
const shouldSkipRuleValidation = (rule, targetObject) => {
    return rule.hasOwnProperty('when') && typeof rule.when === 'function' && rule.when(targetObject) === false;
};

/**
 * Processes a validation rule
 * 
 * @param {SchemaValidator} context 
 * @param {Function} rule 
 * @param {String} field 
 * @param {String} inputValue 
 */
const processRule = async (context, rule, field, inputValue) => {
    if (typeof rule.rule !== 'function') {
        throw new Error('Rules need to be functions.');
    }

    if (!shouldSkipRuleValidation(rule, context.targetObject)) {
        const ruleOutcome = await rule.rule(inputValue, context.targetObject);

        if (!context.foundError && ruleOutcome === true) {
            context.foundError = true;

            if (!rule.hasOwnProperty('message')) {
                throw new Error('All rules must have a message');
            }

            context.addError(field, injectVarsInMessage(context.targetObject, rule.message));
        }
    }
}

/**
 * Processes schema rules by passing a data source
 * 
 * @param {SchemaValidator} context
 * @param {String} fieldName
 * 
 * @returns {Promise}
 */
const processField = async (context, fieldName) => {
    const inputValue = context.targetObject.hasOwnProperty(fieldName) ? context.targetObject[fieldName] : '';
    context.foundError = false;

    if (!isOptionalValidation(context.schema, context.targetObject, fieldName)) {
        for (const rule of context.schema[fieldName].rules) {
            await processRule(context, rule, fieldName, inputValue)
        }
    }

    if (context.schema[fieldName].hasOwnProperty('sanitizers')) {
        for (const sanitizerFunction of context.schema[fieldName].sanitizers) {
            if (typeof sanitizerFunction !== 'function') {
                throw new Error('Sanitizers need to be functions.');
            }

            context.targetObject[fieldName] = sanitizerFunction(context.targetObject[fieldName]);
        }
    }
}

class SchemaValidator {
    /**
     * @constructor
     * @param {Function} failCallback 
     */
    constructor(failCallback) {
        this.failCallback = failCallback || this.defaultFailCallback;
    }

    /**
     * Default fail callback function
     * 
     * @param {Object}   req        Request object
     * @param {Object}   res        Response object
     * @param {Object[]} errors     Array containing the validation errors
     * 
     * @returns {Function}
     */
    defaultFailCallback = (req, res, errors) => res.status(422).json({ message: errors });

    /**
     * Validates a schema based on a targer object
     * Calls next() on success, failCallback() on failure
     * 
     * @param {Object}   req            Request object
     * @param {Object}   res            Response object
     * @param {Function} next           Function to be called on success
     * @param {Object}   targetObject   Object to be validated
     * 
     * @returns {Function}
     */
    async runValidationMiddleware(req, res, next, schema, targetObject) {
        this.errors = [];
        this.foundError = false;
        this.schema = schema;
        this.targetObject = targetObject;

        for (const fieldName of Object.keys(this.schema)) {
            await processField(this, fieldName);
        }

        if (this.errors.length === 0) {
            return next();
        }

        return this.failCallback(req, res, this.errors);
    };

    /**
     * Adds field error in errors list
     * 
     * @param {String} field 
     * @param {String} message 
     */
    addError (field, message) {
        this.errors.push({ field, message });
    };

    /**
     * Validates a schema based on req.body
     * 
     * @param {Object} schema   Validation schema
     * @returns {Function}      Middleware function
     */
    validateBody(schema) {
        return async (req, res, next) => await this.runValidationMiddleware(req, res, next, schema, req.body);
    };

    /**
     * Validates a schema based on req.params
     * 
     * @param {Object} schema   Validation schema
     * @returns {Function}      Middleware function
     */
    validateParams(schema) {
        return async (req, res, next) => await this.runValidationMiddleware(req, res, next, schema, req.params);
    }
}

module.exports = SchemaValidator;
