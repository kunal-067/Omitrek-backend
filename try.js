const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/shop-try', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
}).then(() => console.log('connected to database')).catch(err => {
    console.log('error in connecting to db', err.message)
})

const trySchema = new mongoose.Schema({
    name: String,
    shop: [{
        shop: String,
        location: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: [Number]
        },
    }]
})
trySchema.index({
    "shop.location": "2dsphere"
});

const Try = mongoose.model('try', trySchema)


const saveDocs = async (docs) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // console.log(docs)
        const savePromises = docs.map(doc => doc.save({
            session
        }));

        await Promise.all(savePromises);

        await session.commitTransaction();
        session.endSession();
        return {
            msg: 'saved successfully'
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}


const doc1 = new Try({
    name: 'prod-xy',
    shop: [{
        shop: 'shop-1',
        location: {
            coordinates: [20, 45]
        }
    }]
})
const doc2 = new Try({
    name: 'prod-4',
    // vg:'mp',
    shop: [{
        shop: 'shop-1',
        location: {
            coordinates: [20, 45]
        }
    }]
})

async function xy() {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
       
        await Promise.all([
            doc1.save({
                session
            }),
            doc2.save({
                session
            })
        ]);


        await session.commitTransaction();
        session.endSession();
        return {
            msg: 'saved successfully'
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error)
    }
}

xy()
// saveDocs([doc1, doc2])