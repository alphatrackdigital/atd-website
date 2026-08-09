import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  source: "contact_form" | "tracking_audit_offer";
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message?: string;
  websiteUrl?: string;
  monthlyAdSpend?: string;
  adPlatforms?: string;
  serviceInterest?: string[];
  monthlyBudget?: string;
  ip?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    source:          { type: String, enum: ["contact_form", "tracking_audit_offer"], required: true },
    firstName:       { type: String, required: true, trim: true },
    lastName:        { type: String, required: true, trim: true },
    email:           { type: String, required: true, trim: true, lowercase: true },
    company:         { type: String, trim: true, default: "" },
    message:         { type: String, default: "" },
    websiteUrl:      { type: String, default: "" },
    monthlyAdSpend:  { type: String, default: "" },
    adPlatforms:     { type: String, default: "" },
    serviceInterest: { type: [String], default: [] },
    monthlyBudget:   { type: String, default: "" },
    ip:              { type: String, default: "" },
    read:            { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
