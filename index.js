const express = require('express');
const cors = require('cors');
const validator = require('validator');

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
                rule: (str) => !validator.isUUID(str, 4),
                message: 'ID should be a valid v4 UUID'
            }
        ]
    }
};

const bodySchema = {
    name: {
        rules: [
            {
                rule: (str) => !str || validator.isEmpty(str),
                message: 'Name is required'
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
