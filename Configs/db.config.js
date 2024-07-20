const { default: mongoose } = require("mongoose");

const dbUrl = process.env.MONGO_URI || 'mongodb+srv://trekomi:AkqEPipnajKeTrTC@cluster0.uy9ofus.mongodb.net/omitrek-new-trial';

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