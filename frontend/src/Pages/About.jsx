import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { ShieldCheck, Sparkles, HeartHandshake, Leaf, Award, Compass } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Award className="w-6 h-6 text-zinc-950" />,
      title: "Uncompromising Quality",
      desc: "Every single garment is fabricated with long-staple combed cotton and reinforced micro-stitching for enduring beauty.",
    },
    {
      icon: <Leaf className="w-6 h-6 text-zinc-950" />,
      title: "Sustainable Practices",
      desc: "We prioritize low-impact organic dyes, fair living wages, and zero plastic packaging throughout our fulfillment chain.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-zinc-950" />,
      title: "Customer Dedication",
      desc: "Our personal stylists and 24/7 concierge ensure your wardrobe experience is frictionless from browsing to delivery.",
    },
  ];

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 animate-fade-in">
      
      {/* Page Title */}
      <div className="text-center mb-12">
        <Title text1="ABOUT" text2="OUR STUDIO" />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto font-light tracking-wide -mt-3">
          Redefining contemporary Indian fashion through architectural minimalism, sustainable yarns, and timeless tailoring.
        </p>
      </div>

      {/* Story Showcase (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20">
        <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-subtle group">
          <img
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            src={assets.about_img}
            alt="ShopEase Studio Story"
          />
        </div>

        <div className="lg:col-span-6 flex flex-col justify-center space-y-5 text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold tracking-widest text-zinc-800 uppercase w-fit">
            <Compass className="w-3.5 h-3.5" />
            <span>Our Founding Philosophy</span>
          </div>

          <h3 className="font-editorial text-2xl sm:text-3xl text-zinc-950 font-normal leading-tight">
            Crafting Essentials That Transcends Fleeting Seasons
          </h3>

          <p>
            Cartivo Studio was established with a singular vision: to eliminate wardrobe clutter by offering carefully engineered foundational garments that look impeccable, feel luxurious, and last for years.
          </p>

          <p>
            By designing in deliberate capsule collections and partnering directly with master weavers, we bridge the gap between runway luxury tailoring and daily functional comfort.
          </p>

          <div className="pt-4 border-t border-zinc-100 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-zinc-950 font-serif">100%</p>
              <p className="text-[10px] text-zinc-400 uppercase font-medium">Organic Yarns</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-950 font-serif">7 Days</p>
              <p className="text-[10px] text-zinc-400 uppercase font-medium">Free Exchange</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-950 font-serif">50,000+</p>
              <p className="text-[10px] text-zinc-400 uppercase font-medium">Wardrobes Styled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Values Grid */}
      <div className="my-20">
        <div className="text-center mb-10">
          <Title text1="WHY CHOOSE" text2="CARTIVO" />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-elevated transition-all duration-300 flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-5">
                {v.icon}
              </div>
              <h4 className="text-sm font-bold text-zinc-950 tracking-wide mb-2">
                {v.title}
              </h4>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default About;

