import React from "react";
import { RefreshCw, ShieldCheck, Headphones, Truck } from "lucide-react";

const OurPolicy = () => {
  const policies = [
    {
      icon: <RefreshCw className="w-6 h-6 text-zinc-900 stroke-[1.5]" />,
      title: "Hassle-Free Exchange",
      desc: "Exchange sizes or styles seamlessly within 7 days of delivery.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-zinc-900 stroke-[1.5]" />,
      title: "7 Days Free Returns",
      desc: "Guaranteed authentic quality with 100% money-back assurance.",
    },
    {
      icon: <Headphones className="w-6 h-6 text-zinc-900 stroke-[1.5]" />,
      title: "24/7 Concierge Support",
      desc: "Dedicated personal styling and order assistance around the clock.",
    },
  ];

  return (
    <section className="my-16 sm:my-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((policy, idx) => (
          <div
            key={idx}
            className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-zinc-200/70 hover:border-zinc-300 hover:shadow-elevated transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300">
              <div className="group-hover:[&>svg]:text-white transition-colors">
                {policy.icon}
              </div>
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 tracking-wide mb-1.5">
              {policy.title}
            </h4>
            <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed font-light">
              {policy.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurPolicy;

