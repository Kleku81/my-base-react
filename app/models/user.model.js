const mongoose = require("mongoose");

const UserSchema =   new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ]
},{
  timestamps: true
});

UserSchema.virtual("title")
  .get(function () {
    return this.username;
  });

UserSchema.virtual("key")
  .get(function () {
    return this.username;
  });

  UserSchema.set('toJSON', {
    virtuals: true
  });



  const User = mongoose.model(
    "User", UserSchema
  
  );

// const User = mongoose.model(
//   "User",
//   new mongoose.Schema({
//     username: String,
//     email: String,
//     password: String,
//     roles: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Role"
//       }
//     ]
//   })
// );



module.exports = User;
