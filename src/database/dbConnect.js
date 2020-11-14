const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://fyp:.%2Fjobseekers123%2F.@fypcluster.53h65.mongodb.net/LINKED?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});