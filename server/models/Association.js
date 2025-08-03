import mongoose from "mongoose";

const AssociationSchema = new mongoose.Schema({
  sub: { type: String, unique: true, required: true },
  walletAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Association", AssociationSchema);
