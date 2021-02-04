"use strict";

console.log("module prefixipv4 start loading"); 

const mongoose = require("mongoose"),
  normalize = require("normalize-mongoose"),
  //helper = require("../helpers/validate"),
  prefixipv4Schema = mongoose.Schema(
    {
      prefix: {
        type: String,
        validate: {
          validator: function(v) {
            return /^((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([0-9]|[12][0-9]|3[0-2]))$)/.test(v);
          },
          message: props => `${props.value} is not a valid IPv4 address!`
        },
        required: [true,'IP address is required'],
        //unique: [true, 'IP address have to be unique']
      },
      mask: {
        type: Number,
        required: true,
        min: [0, "Mask is too short"],
        max: 32
      },
      //parent: { type: mongoose.Schema.Types.ObjectId, ref: "PrefixIpv4" }
      parent: {
        type: String,
        required: true
      },
      dbName:{
        type: String, 
        required: true
      },
      description:{
        type: String, 
      },
      tag:{
        type: String, 
      }
      //created_by: {
      //  type: mongoose.Schema.Types.ObjectId, 
      //  ref: "User"
      //created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }    
      //}
    },
    {
      timestamps: true
    }, {
    toObject: {
      virtuals: true
    }

  }

  );

  prefixipv4Schema.index({prefix: 1, dbName: 1}, {unique: [true, 'Index have to be unique']});

  prefixipv4Schema.virtual("key")
  .get(function () {
    return this.prefix;
  });

prefixipv4Schema.virtual("id")
  .get(function () {
    return this.prefix;
  });

prefixipv4Schema.virtual("text")
  .get(function () {
    return this.prefix + "  " + this.description;
  });
  
  prefixipv4Schema.virtual("title")
  .get(function () {
    return this.prefix + "  " + this.description;
  });

prefixipv4Schema.set('toJSON', {
  virtuals: true
});

prefixipv4Schema.set('toObject', {
  virtuals: true
});
//prefixipv4Schema.plugin(normalize);


// prefixipv4Schema.methods.toClient = function () {
//   var obj = this.toObject();
//   obj.id = obj._id;
//   delete obj._id;
//   return obj;
// };

//  prefixipv4Schema.methods.addToDB = async function(){

//   var adress = helper.takeAddress(this.text);
//   var prefixes = await this.find({ "parent": "#" });
//   var prefix_iter;
//   var matched_prefix_up = null;
//   var matched_prefix_down = null;
//   var i = 0;
//   while (prefixes.length > 0) {
//       // for (i = 0; i < prefix.length; i++) {
//       prefix_iter = prefixes[i];
//       //if()
//       if (prefix_iter.mask < this.mask) {
//           if (ip.cidrSubnet(prefix_iter.text).contains(adress) == true) {
//               matched_prefix_up = prefix_iter;
//               //await PrefixIpv4.populate(prefix_iter, "subnetworks").then(prefix_1 => console.log(prefix_1));
//               prefixes = await PrefixIpv4.find({ "parent": prefix_iter.text });
//               i = 0;
//           }
//           else
//           {
//               if(i == (prefixes.length-1) )
//               {
//                   break;
//               }
//               i++; 
//           }
//       }
//       else if (prefix_iter.mask > this.mask) {
//           if (ip.cidrSubnet(this.text).contains(takeAddress(prefix_iter.text)) == true) {
//               matched_prefix_down = prefix_iter;
//               //prefixes = prefix_iter.subnetworks;
//               break;
//           }
//       }
//       else {
//           if(i == (prefixes.length-1) )
//           {
//               break;
//           }
//           i++;
//       }


//       //}

//   }
//   if (matched_prefix_up != null) {
//       this.parent = matched_prefix_up.text;
//   };
//   if (matched_prefix_down != null) {
//       //matched_prefix_down.parent = this.text;
//       //matched_prefix_down.save();
//   }
//   this.save();
//   //matched_prefix_up.subnetworks.push(prefix);
//   //matched_prefix_up.save();

// };

console.log("module prefixipv4 finish loading"); 






module.exports = mongoose.model("PrefixIpv4", prefixipv4Schema);
