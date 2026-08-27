import { describe, it, expect } from "vitest";
import {
  listProductsService,
  removeProductService,
  singleProductService,
} from "../../services/productService.js";
import productModel from "../../models/productModel.js";

describe("Product Service Tests", () => {
  it("should list all products", async () => {
    await productModel.create({
      name: "Test Shirt",
      description: "A comfortable cotton shirt",
      price: 999,
      category: "Men",
      subCategory: "Topwear",
      sizes: ["S", "M", "L"],
      image: ["https://example.com/shirt.jpg"],
    });

    const products = await listProductsService();
    expect(products.length).toBe(1);
    expect(products[0].name).toBe("Test Shirt");
  });

  it("should return single product by id", async () => {
    const created = await productModel.create({
      name: "Test Denim Jacket",
      description: "Stylish jacket",
      price: 2499,
      category: "Men",
      subCategory: "Winterwear",
      sizes: ["M", "L"],
      image: ["https://example.com/jacket.jpg"],
    });

    const product = await singleProductService(created._id);
    expect(product.name).toBe("Test Denim Jacket");
    expect(product.price).toBe(2499);
  });

  it("should throw error if product not found for singleProductService", async () => {
    const fakeId = "60c72b2f9b1d8b0015f6e800";
    await expect(singleProductService(fakeId)).rejects.toThrow("Product not found.");
  });

  it("should remove product by id", async () => {
    const created = await productModel.create({
      name: "Test Dress",
      description: "Summer dress",
      price: 1299,
      category: "Women",
      subCategory: "Topwear",
      sizes: ["S", "M"],
      image: ["https://example.com/dress.jpg"],
    });

    await removeProductService(created._id);
    const inDb = await productModel.findById(created._id);
    expect(inDb).toBeNull();
  });
});
