import mongoose from "mongoose";
import "dotenv/config";

// Minimal product schema matching the existing model
const productSchema = new mongoose.Schema({}, { strict: false, collection: "products" });
const Product = mongoose.model("ProductSeed", productSchema);

const newProducts = [
  {
    name: "Dettol Original Antibacterial Soap",
    description: "Trusted antibacterial protection soap with pine fragrance. Provides 100% better germ protection for the whole family.",
    price: 42,
    image: ["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&auto=format&fit=crop&q=80"],
    category: "Personal Care",
    subCategory: "Bath & Body",
    sizes: ["75g", "125g"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Colgate Strong Teeth Toothpaste",
    description: "India's #1 toothpaste with Amino Shakti Formula and calcium boost for 2x stronger teeth from the very first use.",
    price: 85,
    image: ["https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&auto=format&fit=crop&q=80"],
    category: "Personal Care",
    subCategory: "Oral Care",
    sizes: ["100g", "200g", "300g"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Head & Shoulders Anti-Dandruff Shampoo",
    description: "Clinically proven anti-dandruff shampoo with Zinc Pyrithione. Removes dandruff from the 1st wash for a flake-free scalp.",
    price: 195,
    image: ["https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&auto=format&fit=crop&q=80"],
    category: "Personal Care",
    subCategory: "Hair Care",
    sizes: ["180ml", "340ml", "650ml"],
    date: Date.now(),
    bestseller: false,
  },
  {
    name: "Nivea Body Lotion Deep Moisture",
    description: "Enriched with Serum and Almond Oil for 48-hour deep moisture. Non-greasy, fast-absorbing formula for soft smooth skin.",
    price: 220,
    image: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"],
    category: "Personal Care",
    subCategory: "Skin Care",
    sizes: ["200ml", "400ml"],
    date: Date.now(),
    bestseller: false,
  },
  {
    name: "Nestlé Cerelac Baby Wheat Dal Stage 2",
    description: "Fortified baby cereal with wheat-dal flavor for babies 8 months and above. Contains Iron, Vitamins, and 17 essential nutrients.",
    price: 275,
    image: ["https://images.unsplash.com/photo-1612187015718-37bfc4d27045?w=800&auto=format&fit=crop&q=80"],
    category: "Baby & Kids",
    subCategory: "Baby Food",
    sizes: ["300g", "500g"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Johnson's Baby Shampoo No More Tears",
    description: "Gentle, mild, and tear-free baby shampoo that is as gentle to the eyes as pure water. Clinically proven mild formula.",
    price: 165,
    image: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80"],
    category: "Baby & Kids",
    subCategory: "Baby Care",
    sizes: ["200ml", "500ml"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Fresh Bananas (Robusta)",
    description: "Farm-fresh, naturally ripened Robusta bananas. Rich in potassium, dietary fiber and natural energy for the whole family.",
    price: 45,
    image: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80"],
    category: "Fresh Fruits & Vegetables",
    subCategory: "Fresh Produce",
    sizes: ["6 pcs", "12 pcs"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Fresh Tomatoes (Hybrid)",
    description: "Hand-picked, vine-ripened hybrid tomatoes with rich red color. Perfect for curries, salads, chutneys, and daily cooking.",
    price: 35,
    image: ["https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=800&auto=format&fit=crop&q=80"],
    category: "Fresh Fruits & Vegetables",
    subCategory: "Fresh Produce",
    sizes: ["500g", "1kg"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Fresh Onions (Nashik)",
    description: "Premium quality Nashik onions known for strong pungent flavor and rich red-purple color. Essential for Indian cooking.",
    price: 38,
    image: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80"],
    category: "Fresh Fruits & Vegetables",
    subCategory: "Fresh Produce",
    sizes: ["500g", "1kg", "2kg"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Fresh Potatoes (Agra)",
    description: "Clean, sorted Agra potatoes with smooth skin. Versatile staple vegetable for frying, boiling, baking, and curries.",
    price: 32,
    image: ["https://images.unsplash.com/photo-1518977676601-b53f82ber95?w=800&auto=format&fit=crop&q=80"],
    category: "Fresh Fruits & Vegetables",
    subCategory: "Fresh Produce",
    sizes: ["500g", "1kg", "2kg", "5kg"],
    date: Date.now(),
    bestseller: false,
  },
  {
    name: "Tropicana Mixed Fruit Juice",
    description: "100% juice made from a blend of real fruits including apple, mango, and orange. No added sugar, no preservatives.",
    price: 90,
    image: ["https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&auto=format&fit=crop&q=80"],
    category: "Beverages & Tea",
    subCategory: "Beverages",
    sizes: ["200ml", "1L"],
    date: Date.now(),
    bestseller: true,
  },
  {
    name: "Paper Boat Aam Panna Drink",
    description: "Traditional raw mango drink made with cumin, mint, and jaggery. A refreshing summer cooler inspired by Indian heritage.",
    price: 30,
    image: ["https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80"],
    category: "Beverages & Tea",
    subCategory: "Beverages",
    sizes: ["250ml"],
    date: Date.now(),
    bestseller: false,
  },
];

async function seedNewProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    let added = 0;
    for (const product of newProducts) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        await Product.create(product);
        added++;
        console.log(`✅ Added: ${product.name}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${product.name}`);
      }
    }
    console.log(`\nDone. ${added} new products added.`);
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedNewProducts();
