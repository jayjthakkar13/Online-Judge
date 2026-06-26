import { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
	email: {
    type: String,
    required: true
  },
	passwordHash: {
    type: String,
    required: true
  }
});

userSchema.index({ email: 1 }, { unique: true });

export default model("User", userSchema);

export type UserDocument = {
	_id: Types.ObjectId,
	email: string,
	passwordHash?: string
};