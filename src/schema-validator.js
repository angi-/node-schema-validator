const validator = require('validator');

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

module.exports = {
    validator,

    /**
     * 
     * @param {*} schema 
     * @returns 
     */
    validateBodySchema: schema => {
        return async (req, res, next) => {
            const errors = await processSchema(schema, req.body);

            if (errors.length === 0) {
                return next();
            }

            res.status(422).json({ message: errors });
        }
    },

    /**
     * 
     * @param {*} schema 
     * @returns 
     */
    validateParamSchema: schema => {
        return async (req, res, next) => {
            const errors = await processSchema(schema, req.params);

            if (errors.length === 0) {
                return next();
            }

            res.status(422).json({ message: errors });
        }
    }
}
