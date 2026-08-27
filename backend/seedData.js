import mongoose from "mongoose";
import "dotenv/config";
import productModel from "./models/productModel.js";

const demoProducts = [
  {
    name: "Women Round Neck Cotton Top",
    description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
    price: 1500,
    image: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Men Slim Fit Cotton Shirt",
    description: "Tailored slim fit casual shirt with breathable organic cotton weave and button-down collar.",
    price: 2200,
    image: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["M", "L", "XL"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Girls Round Neck Organic Cotton Tee",
    description: "Soft skin-friendly kids t-shirt with durable double stitching and stretch neckline.",
    price: 850,
    image: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: false,
    date: new Date(),
  },
  {
    name: "Men Casual Linen Trousers",
    description: "Relaxed fit linen blend trousers with adjustable drawstring waist and deep side pockets.",
    price: 2800,
    image: ["https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&auto=format&fit=crop&q=80"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Women Oversized Denim Jacket",
    description: "Classic vintage wash denim jacket with silver hardware and structured drop shoulders.",
    price: 3900,
    image: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Women High-Rise Tapered Trousers",
    description: "Elegant high-waisted pleated pants designed for versatile desk-to-dinner styling.",
    price: 2600,
    image: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L"],
    bestseller: false,
    date: new Date(),
  },
  {
    name: "Men Heavyweight Fleece Hoodie",
    description: "Ultra-soft brushed fleece pullover hoodie with double-layer hood and kangaroo pocket.",
    price: 3200,
    image: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["M", "L", "XL", "XXL"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Kids Warm Knit Sweater",
    description: "Cozy hypoallergenic wool-mix sweater designed to keep children warm and comfortable.",
    price: 1400,
    image: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80"],
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L"],
    bestseller: false,
    date: new Date(),
  },
  {
    name: "Women Ribbed Knit Midi Dress",
    description: "Form-fitting ribbed midi dress with subtle side slit and elegant boat neck.",
    price: 3100,
    image: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Men Tailored Wool Trench Coat",
    description: "Luxury double-breasted wool blend trench coat with belt fastening and interior pockets.",
    price: 6500,
    image: ["https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["M", "L", "XL"],
    bestseller: true,
    date: new Date(),
  },
  {
    name: "Kids Comfort Fit Denim Shorts",
    description: "Durable cotton denim shorts with soft elastic waistband for active toddlers and kids.",
    price: 950,
    image: ["https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L"],
    bestseller: false,
    date: new Date(),
  },
  {
    name: "Women Pure Silk Blouse",
    description: "Handcrafted 100% mulberry silk blouse with concealed buttons and french cuffs.",
    price: 4200,
    image: ["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&auto=format&fit=crop&q=80"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: true,
    date: new Date(),
  }
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is missing");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected!");

    // Clear existing products and re-seed
    await productModel.deleteMany({});
    console.log("Cleared existing products.");

    const inserted = await productModel.insertMany(demoProducts);
    console.log(`Successfully seeded ${inserted.length} catalog items into MongoDB database!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
