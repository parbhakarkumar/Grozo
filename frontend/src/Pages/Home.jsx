import React from "react";
import Hero from "../components/Hero";
import LiveOrderTracker from "../components/LiveOrderTracker";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";

const Home = () => {
  return (
    <div className="space-y-6">
      <Hero />
      <LiveOrderTracker compact={true} />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;