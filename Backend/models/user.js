import mongoose from "mongoose";
import passportLocalMongoosePkg from "passport-local-mongoose";

// Resolve default export if wrapped in an object
const passportLocalMongoose = passportLocalMongoosePkg.default || passportLocalMongoosePkg;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

export default User;