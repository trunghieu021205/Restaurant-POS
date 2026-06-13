require('dotenv').config();
const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'confirmed', 'cooking', 'done', 'delivered', 'cancelled'];

async function updateOrderValidator() {
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        family: 4
    });

    const validator = {
        $jsonSchema: {
            bsonType: 'object',
            required: ['orderNumber', 'tableId', 'billId', 'items', 'totalAmount', 'status'],
            properties: {
                orderNumber: { bsonType: 'string' },
                tableId: { bsonType: 'objectId' },
                billId: { bsonType: 'objectId' },
                user: { bsonType: 'objectId' },
                items: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        required: ['menuItemId', 'quantity', 'price'],
                        properties: {
                            menuItemId: { bsonType: 'objectId' },
                            quantity: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 1 },
                            price: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
                            note: { bsonType: 'string' }
                        }
                    }
                },
                subTotal: { bsonType: ['int', 'long', 'double', 'decimal'] },
                totalAmount: { bsonType: ['int', 'long', 'double', 'decimal'] },
                status: { enum: ORDER_STATUSES },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    };

    await mongoose.connection.db.command({
        collMod: 'orders',
        validator,
        validationLevel: 'moderate',
        validationAction: 'error'
    });

    console.log('Updated orders collection validator');
}

updateOrderValidator()
    .catch((error) => {
        console.error('Update orders validator failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
