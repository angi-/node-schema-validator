const express = require('express');
const cors = require('cors');
const validator = require('validator');
const emailExists = require('./src/tests/email-exists');

const { paramSchemaValidator, bodySchemaValidator } = require('./src/schema-validator');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

const port = 4321;

const paramSchema = {
    id: {
        rules: [
            {
                rule: (input) => !validator.isUUID(input, 4),
                message: 'ID should be a valid v4 UUID'
            }
        ]
    }
};

const bodySchema = {
    name: {
        rules: [
            {
                rule: (input) => !input || validator.isEmpty(input),
                message: 'Name is required'
            }
        ]
    },
    email: {
        rules: [
            {
                rule: (input) => !input || validator.isEmpty(input),
                message: 'Email is required'
            },
            {
                rule: async (input) => await emailExists(input),
                message: 'This email address already exists'
            }
        ]
    }
};

const router = new express.Router();
router.post('/update/test/:id',
    paramSchemaValidator(paramSchema),
    bodySchemaValidator(bodySchema),
    (req, res) => {
        res.status(200).json({ message: 'SUCCESS' });
    }
);

app.use(router);

app.listen(port, () => {
    console.log(`Running in ${process.env.NODE_ENV} environment on port ${port}`);
});
