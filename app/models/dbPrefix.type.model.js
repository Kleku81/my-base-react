const mongoose = require("mongoose");


const DbPrefixSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Typ bazy jest wymagany.']
  },
  subType: {
    type: String,
    required: [true, 'Nazwa bazy jest wymagana.']
    //unique: [true, 'Baza o podanej nazwie już istnieje.']

  },
  description: {
    type: String
  }
},
  {
    timestamps: true
  }, {
  toObject: {
    virtuals: true
  }




});


DbPrefixSchema.index({ type: 1, subType: 1 }, { unique: [true, 'Index bazy musi być unikalny!'] });

DbPrefixSchema.virtual("title")
  .get(function () {
    return this.subType;
  });

DbPrefixSchema.virtual("key")
  .get(function () {
    return this.subType;
  });

DbPrefixSchema.set('toJSON', {
    virtuals: true
  });

  DbPrefixSchema.set('toObject', {
    virtuals: true
  });


const DbPrefixType = mongoose.model(
  "DbPrefixType", DbPrefixSchema

);





module.exports = DbPrefixType;