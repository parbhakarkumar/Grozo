import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [relProduct, setRelProduct] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      let copyProducts = products.slice();
      copyProducts = copyProducts.filter((item) => category === item.category);
      if (subCategory) {
        copyProducts = copyProducts.filter((item) => subCategory === item.subCategory);
      }
      setRelProduct(copyProducts.slice(0, 5));
    }
  }, [products, category, subCategory]);

  if (relProduct.length === 0) return null;

  return (
    <section className="my-24 border-t border-zinc-200/80 pt-16">
      <div className="flex flex-col items-center text-center mb-10">
        <Title text1="COMPLETE" text2="THE LOOK" />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md font-light tracking-wide -mt-3">
          Pairs seamlessly with our curated selection of foundational wardrobe staples.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-6">
        {relProduct.map((product, i) => (
          <ProductItem key={product._id || i} {...product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;

