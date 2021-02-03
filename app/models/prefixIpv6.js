"use strict";

console.log("module prefixipv6 start loading"); 

const mongoose = require("mongoose"),
  normalize = require("normalize-mongoose"),
  //helper = require("../helpers/validate"),
  prefixipv6Schema = mongoose.Schema(
    {
      prefix: {
        type: String,
        validate: {
          validator: function(v) {
            return /^((([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/([0-9]|[1-9][0-9]|1[0-2][0-8])$)/.test(v);
          },
          message: props => `${props.value} is not a valid IPv6 address!`
        },
        required: [true,'IP address is required'],
        //unique: [true, 'IP address have to be unique']
      },
      prefix_full: {
        type: String,
        required: [true,'IP address is required'],
        //unique: [true, 'IP address have to be unique']
      },
      mask: {
        type: Number,
        required: true,
        min: [0, "Mask is too short"],
        max: [128, "Mask is too long"]
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

  prefixipv6Schema.index({prefix: 1, dbName: 1}, {unique: [true, 'Index have to be unique']});
  prefixipv6Schema.index({parent: 1, dbName: 1});

prefixipv6Schema.virtual("key")
  .get(function () {
    return this.prefix;
  });

  prefixipv6Schema.virtual("id")
  .get(function () {
    return this.prefix;
  });

prefixipv6Schema.virtual("title")
  .get(function () {
    return this.prefix + "  " + this.description;
  });

  prefixipv6Schema.virtual("name")
  .get(function () {
    return this.prefix + "  " + this.description;
  });
  

prefixipv6Schema.set('toJSON', {
  virtuals: true
});

prefixipv6Schema.set('toObject', {
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



console.log("module prefixipv6 finish loading"); 



module.exports = mongoose.model("PrefixIpv6", prefixipv6Schema);
