import mongoose from "mongoose";
import { types, ageGroups, sizes } from "@/constants";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
    },
    img: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    listingType: {
      type: String,
      enum: ["adoption", "lost", "found"],
      default: "adoption",
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    type: {
    type: String,
    required: true,
    enum: types 
    },
    ageGroups: {
    type: String,
    required: true,
    enum: ageGroups 
    },
    sizes: {
    type: String,
    required: true,
    enum: sizes 
    },
    breed: {
      type: String,
      default: "",
    },
    breedDescription: {
      type: String,
      default: "",
    },
    breedTraits: {
      type: [String],
      default: [],
    },
    breedConfidence: {
      type: Number,
      default: null,
    },
    mlPredictions: {
      type: [
        {
          breed: String,
          rawBreed: String,
          confidence: Number,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["available", "reserved", "adopted"],
      default: "available",
    },
    city: {
      type: String,
      default: "",
    },
    sex: {
      type: String,
      enum: ["male", "female", ""],
      default: "",
    },
  },
  { timestamps: true }
);

const animalDocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const animalSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true,
      index: true,
    },
    foundLocation: {
      type: String,
      default: "",
    },
    foundByName: {
      type: String,
      default: "",
    },
    foundByContact: {
      type: String,
      default: "",
    },
    diseases: {
      type: [String],
      default: [],
    },
    documents: {
      type: [animalDocumentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const adoptionFormSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: String,
    experience: {
      type: String,
      required: true
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);


export const User = mongoose.models?.User || mongoose.model("User", userSchema);
export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);
export const Animal = mongoose.models?.Animal || mongoose.model("Animal", animalSchema);
export const AdoptionForm = mongoose.models?.AdoptionForm || mongoose.model('AdoptionForm', adoptionFormSchema);
