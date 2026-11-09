import mongoose from "mongoose";
import passportLocalMongoosePkg from "passport-local-mongoose";

const passportLocalMongoose = passportLocalMongoosePkg.default || passportLocalMongoosePkg;

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

// Users log in with their email. The plugin adds password hashing + register()/authenticate().
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameLowerCase: true,
  errorMessages: {
    UserExistsError: "An account with this email already exists.",
    IncorrectPasswordError: "Incorrect email or password.",
    IncorrectUsernameError: "Incorrect email or password.",
    MissingUsernameError: "Email is required.",
    MissingPasswordError: "Password is required.",
  },
});

export default mongoose.model("User", userSchema);
