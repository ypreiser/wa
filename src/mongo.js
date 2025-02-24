
const mongoose = require('mongoose');
// Load the session data
mongoose.connect(process.env.MONGO).then(console.log("db connect"));
