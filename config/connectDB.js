const mongoose = require('mongoose');

module.exports= async function(){
    try { await mongoose.connect(process.env.MONGO_URL);
        console.log('Database is connected!')
    }
     catch (err) {
      console.log(`Cannot connect to database!
      error: ${err}`)
        
    }
} 