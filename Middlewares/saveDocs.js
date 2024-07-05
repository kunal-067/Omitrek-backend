const mongoose = require("mongoose");

const saveDocs = async (docs) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log(docs)
        const savePromises = docs.map(doc => doc.save({ session }));

        await Promise.all(savePromises);

        await session.commitTransaction();
        session.endSession();
        return { msg: 'saved successfully' };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

module.exports = saveDocs;
