require('dotenv').config();

const dbConnect = require('./Configs/db.config');
const app = require('./app');


const port = process.env.PORT || 80;

// db connection
dbConnect().then(() => {
    app.listen(port, (err) => {
        if (err) {
            console.log('error in starting server', err)
        } else {
            console.log(`server started on https://localhost:${port}`)
        }
    })
}).catch(err=>{
    console.error('Error in connecting to the database', err);
    process.exit(1);
})