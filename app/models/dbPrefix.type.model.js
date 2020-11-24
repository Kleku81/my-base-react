const mongoose = require("mongoose");


const DbPrefixSchema =   new mongoose.Schema({
  type: {
    type: String,
    required: [true,'Typ bazy jest wymagany.']
   },
  subType:{
    type: String,
    required: [true,'Nazwa bazy jest wymagana.']
  //unique: [true, 'Baza o podanej nazwie już istnieje.']

  },
  description: String
});


DbPrefixSchema.index({type: 1, subType: 1}, {unique: [true, 'Index bazy musi być unikalny!']});


const DbPrefixType = mongoose.model(
  "DbPrefixType",DbPrefixSchema 

);



module.exports = DbPrefixType;