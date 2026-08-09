import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:     { type: String, required: true, trim: true },
    content:     { type: String, required: true },
    image:       { type: String, default: "" },
    category:    { type: String, required: true, trim: true },
    readTime:    { type: String, default: "5 min read" },
    author:      { type: String, default: "Alphatrack Team" },
    status:      { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BlogPostSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

export const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
