import React from "react";
import { Zap, ShieldCheck, RefreshCw } from "lucide-react";

const OurPolicy = () => {
  const policies = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500 fill-amber-400" />,
      title: "⚡ 8-Min Express Delivery",
      desc: "Delivered to your doorstep in minutes from local dark stores.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0C831F]" />,
      title: "🛡 100% Sealed & Authentic",
      desc: "Directly sourced products checked for freshness & quality.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-600" />,
      title: "⚡ Instant Refunds & Returns",
      desc: "No questions asked instant refunds directly back to source.",
    },
  ];

  return (
    <section className="my-8 sm:my-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {policies.map((policy, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {policy.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                {policy.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {policy.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurPolicy;
