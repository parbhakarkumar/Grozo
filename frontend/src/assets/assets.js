import logo from './logo.png'
import hero_img from './hero_img.png'
import cart_icon from './cart_icon.png'
import bin_icon from './bin_icon.png'
import dropdown_icon from './dropdown_icon.png'
import exchange_icon from './exchange_icon.png'
import profile_icon from './profile_icon.png'
import quality_icon from './quality_icon.png'
import search_icon from './search_icon.png'
import star_dull_icon from './star_dull_icon.png'
import star_icon from './star_icon.png'
import support_img from './support_img.png'
import menu_icon from './menu_icon.png'
import about_img from './about_img.png'
import contact_img from './contact_img.png'
import razorpay_logo from './razorpay_logo.png'
import stripe_logo from './stripe_logo.png'
import cross_icon from './cross_icon.png'

export const assets = {
    logo,
    hero_img,
    cart_icon,
    dropdown_icon,
    exchange_icon,
    profile_icon,
    quality_icon,
    search_icon,
    star_dull_icon,
    star_icon,
    bin_icon,
    support_img,
    menu_icon,
    about_img,
    contact_img,
    razorpay_logo,
    stripe_logo,
    cross_icon
}

export const products = [
    {
        _id: "groc_001",
        name: "Everest Garam Masala",
        description: "A perfect blend of 13 rich spices, ground to perfection for authentic Indian curries and aromatic gravies.",
        price: 78,
        image: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["100g", "200g", "500g"],
        date: 1716634345448,
        bestseller: true
    },
    {
        _id: "groc_002",
        name: "MDH Deggi Mirch Powder",
        description: "Finely ground blend of specially selected red peppers that imparts a natural vibrant red color and mild spiciness.",
        price: 95,
        image: ["https://images.unsplash.com/photo-1599909625345-4e78a6ff6078?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["100g", "250g"],
        date: 1716621345448,
        bestseller: true
    },
    {
        _id: "groc_003",
        name: "Tata Sampann Turmeric / Haldi Powder",
        description: "100% pure turmeric with guaranteed minimum 3% curcumin content, providing high immunity and vibrant golden color.",
        price: 62,
        image: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["200g", "500g"],
        date: 1716234545448,
        bestseller: true
    },
    {
        _id: "groc_004",
        name: "Catch Coriander / Dhaniya Powder",
        description: "Aromatic ground coriander seeds packed with essential oils, adding earthy freshness and thick texture to gravies.",
        price: 58,
        image: ["https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["200g", "500g"],
        date: 1716621542448,
        bestseller: false
    },
    {
        _id: "groc_005",
        name: "MDH Chunky Chaat Masala",
        description: "Tangy and savory seasoning spice powder perfect for salads, fruits, street food, and finger snacks.",
        price: 72,
        image: ["https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["100g"],
        date: 1716622235448,
        bestseller: true
    },
    {
        _id: "groc_006",
        name: "Tata Salt Vacuum Evaporated Iodized",
        description: "India's most trusted vacuum-evaporated iodized salt, providing pure taste and essential daily iodine nutrition.",
        price: 28,
        image: ["https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Daily Essentials",
        sizes: ["1kg", "2kg"],
        date: 1716621545448,
        bestseller: true
    },
    {
        _id: "groc_007",
        name: "Royal Whole Cumin / Jeera Seeds",
        description: "Cleaned and sorted unadulterated cumin seeds with intense earthy aroma and high essential oil content.",
        price: 65,
        image: ["https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["100g", "250g"],
        date: 1716623345448,
        bestseller: false
    },
    {
        _id: "groc_008",
        name: "Royal Green Cardamom / Choti Elaichi",
        description: "Hand-picked whole green cardamom pods with intense sweet-spicy aroma, ideal for tea, sweets, and biryani.",
        price: 145,
        image: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"],
        category: "Masala & Spices",
        subCategory: "Cooking Essentials",
        sizes: ["50g", "100g"],
        date: 1716624445448,
        bestseller: false
    },
    {
        _id: "groc_009",
        name: "Aashirvaad Superior MP Shudh Chakki Atta",
        description: "100% whole wheat flour made from grain sourced from MP farms. Makes super soft rotis that stay fresh longer.",
        price: 245,
        image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"],
        category: "Atta, Rice & Oil",
        subCategory: "Daily Essentials",
        sizes: ["1kg", "5kg", "10kg"],
        date: 1716625545448,
        bestseller: true
    },
    {
        _id: "groc_010",
        name: "Daawat Rozana Super Basmati Rice",
        description: "Aged long-grain basmati rice with delightful aroma and fluffy non-sticky texture, perfect for everyday meals.",
        price: 125,
        image: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80"],
        category: "Atta, Rice & Oil",
        subCategory: "Daily Essentials",
        sizes: ["1kg", "5kg"],
        date: 1716626645448,
        bestseller: true
    },
    {
        _id: "groc_011",
        name: "Tata Sampann Unpolished Toor / Arhar Dal",
        description: "Unpolished toor dal rich in natural protein and dietary fiber without any chemical polishing or artificial colors.",
        price: 168,
        image: ["https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=800&auto=format&fit=crop&q=80"],
        category: "Atta, Rice & Oil",
        subCategory: "Daily Essentials",
        sizes: ["500g", "1kg", "2kg"],
        date: 1716627745448,
        bestseller: true
    },
    {
        _id: "groc_012",
        name: "Fortune Sunlite Refined Sunflower Oil",
        description: "Light and healthy refined sunflower oil enriched with Vitamins A & D, ideal for daily deep and shallow cooking.",
        price: 142,
        image: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80"],
        category: "Atta, Rice & Oil",
        subCategory: "Cooking Essentials",
        sizes: ["1L", "5L"],
        date: 1716628845448,
        bestseller: true
    },
    {
        _id: "groc_013",
        name: "Fortune Premium Kachi Ghani Mustard Oil",
        description: "Cold-pressed pure mustard oil with strong pungency and traditional taste, ideal for pickling and curries.",
        price: 155,
        image: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80"],
        category: "Atta, Rice & Oil",
        subCategory: "Cooking Essentials",
        sizes: ["1L", "2L"],
        date: 1716629945448,
        bestseller: false
    },
    {
        _id: "groc_014",
        name: "Amul Taaza Fresh Toned Milk",
        description: "Pasteurized homogenized toned milk with 3.0% fat and 8.5% SNF. Wholesome and nutritious for the entire family.",
        price: 27,
        image: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80"],
        category: "Dairy & Breakfast",
        subCategory: "Daily Essentials",
        sizes: ["500ml", "1L"],
        date: 1716631145448,
        bestseller: true
    },
    {
        _id: "groc_015",
        name: "Amul Pasteurized Salted Butter",
        description: "The iconic Utterly Butterly Delicious salted butter made from fresh cream, perfect for toast, parathas, and baking.",
        price: 58,
        image: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&auto=format&fit=crop&q=80"],
        category: "Dairy & Breakfast",
        subCategory: "Daily Essentials",
        sizes: ["100g", "500g"],
        date: 1716632245448,
        bestseller: true
    },
    {
        _id: "groc_016",
        name: "Britannia 100% Whole Wheat Bread",
        description: "Soft, wholesome brown bread baked with 100% whole wheat grains and rich dietary fiber for a healthy morning start.",
        price: 50,
        image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"],
        category: "Dairy & Breakfast",
        subCategory: "Daily Essentials",
        sizes: ["400g"],
        date: 1716633345448,
        bestseller: true
    },
    {
        _id: "groc_017",
        name: "Mother Dairy Classic Fresh Paneer",
        description: "Soft and spongy fresh cottage cheese made from pasteurized cow and buffalo milk, high in protein.",
        price: 90,
        image: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80"],
        category: "Dairy & Breakfast",
        subCategory: "Daily Essentials",
        sizes: ["200g", "400g"],
        date: 1716634445448,
        bestseller: true
    },
    {
        _id: "groc_018",
        name: "Maggi 2-Minute Masala Instant Noodles",
        description: "India's favorite instant noodles infused with signature blend of 10 spices and fortified with iron.",
        price: 56,
        image: ["https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80"],
        category: "Snacks & Instant Food",
        subCategory: "Instant Food",
        sizes: ["Pack of 4", "Pack of 8"],
        date: 1716635545448,
        bestseller: true
    },
    {
        _id: "groc_019",
        name: "Lay's India's Magic Masala Potato Chips",
        description: "Crunchy sliced potato chips seasoned with a mouth-watering combination of hot Indian spices and tangy herbs.",
        price: 20,
        image: ["https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=80"],
        category: "Snacks & Instant Food",
        subCategory: "Instant Food",
        sizes: ["50g", "90g"],
        date: 1716636645448,
        bestseller: true
    },
    {
        _id: "groc_020",
        name: "Haldiram's Nagpur Aloo Bhujia",
        description: "Classic spicy and crispy mint-infused potato and gram flour sev, the ultimate tea-time snack.",
        price: 55,
        image: ["https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&auto=format&fit=crop&q=80"],
        category: "Snacks & Instant Food",
        subCategory: "Instant Food",
        sizes: ["200g", "400g"],
        date: 1716637745448,
        bestseller: true
    },
    {
        _id: "groc_021",
        name: "Tata Tea Gold Premium Tea",
        description: "A blend of rich CTC tea granules with 15% long tea leaves that release an invigorating aroma and rich golden taste.",
        price: 310,
        image: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80"],
        category: "Beverages & Tea",
        subCategory: "Daily Essentials",
        sizes: ["250g", "500g", "1kg"],
        date: 1716638845448,
        bestseller: true
    },
    {
        _id: "groc_022",
        name: "Nescafé Classic Instant Coffee",
        description: "100% pure instant coffee crafted from dark roasted Robusta beans for a bold flavor and rich morning boost.",
        price: 185,
        image: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"],
        category: "Beverages & Tea",
        subCategory: "Daily Essentials",
        sizes: ["50g", "100g", "200g"],
        date: 1716639945448,
        bestseller: true
    },
    {
        _id: "groc_023",
        name: "Vim Lemon Dishwash Liquid Gel",
        description: "Powerful concentrated dishwash gel with real lemon extract that cuts through tough grease on 100 utensils in 1 spoon.",
        price: 110,
        image: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&auto=format&fit=crop&q=80"],
        category: "Cleaning & Household",
        subCategory: "Daily Essentials",
        sizes: ["250ml", "500ml", "1L"],
        date: 1716641145448,
        bestseller: false
    },
    {
        _id: "groc_024",
        name: "Surf Excel Easy Wash Detergent Powder",
        description: "Superfine detergent powder with power of 10 hands to remove tough stains effortlessly in machine or hand wash.",
        price: 145,
        image: ["https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&auto=format&fit=crop&q=80"],
        category: "Cleaning & Household",
        subCategory: "Daily Essentials",
        sizes: ["1kg", "3kg", "5kg"],
        date: 1716642245448,
        bestseller: true
    }
];