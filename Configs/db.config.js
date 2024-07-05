const { default: mongoose } = require("mongoose");

const dbUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/omitrek';
const dbConnect = async () => {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: "admin",
        });
    } catch (err) {
        throw err
    }
}

module.exports = dbConnect;