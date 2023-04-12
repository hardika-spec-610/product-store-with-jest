// By default Jest does not work with the import syntax
// If you want to use import syntax you should add NODE_OPTIONS=--experimental-vm-modules to the test script in package.json
// On Windows you cannot use NODE_OPTIONS (as well as other env vars in scripts) from the command line --> solution is to use cross-env in order to be able to pass
// env vars to command line scripts on all operative systems!
import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "../src/server.js";
import ProductsModel from "../src/api/products/model.js";

dotenv.config(); // This command forces .env vars to be loaded into process.env. This is the way to go when you can't use -r dotenv/config

// supertest is capable of running server.listen from our Express app if we pass the server to it
// It will give us back an object (client) that can be used to run http requests on that server
const client = supertest(server);

const validProduct = {
  name: "Google pixel 7",
  description:
    "A smartwatch is a portable computer device that combines mobile telephone functions and computing functions into one unit.",
  brand: "Google",
  imageUrl:
    "https://cdn.pixabay.com/photo/2016/12/09/11/33/smartphone-1894723__340.jpg",
  price: 250,
  category: "Electronics",
};

const notValidProduct = {
  name: "Google pixel 7",
  description: "Good phone",
  brand: "Google",
  imageUrl:
    "https://cdn.pixabay.com/photo/2016/12/09/11/33/smartphone-1894723__340.jpg",
  price: 250,
  category: "Phone",
};

let product;
const invalidId = "123456123456123456123456";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URL);
  product = new ProductsModel(validProduct);
  await product.save();
}); // beforeAll is a Jest hook which will be ran before all tests, usually this is used to connect to db and to do some initial setup like adding some mock data to the db

afterAll(async () => {
  //   await ProductsModel.deleteMany();
  await mongoose.connection.close();
}); // afterAll hook could to clean up the situation (close the connection to Mongo gently and clean up db/collections)

describe("Test Products APIs", () => {
  // it("Should test that GET /test endpoint returns 200 and a body containing a message", async () => {
  //   const response = await client.get("/test")
  //   expect(response.status).toBe(200)
  //   expect(response.body.message).toEqual("TEST SUCCESSFULL")
  // })

  it("Should test that env vars are loaded correctly", () => {
    expect(process.env.MONGO_TEST_URL).toBeDefined();
  });

  test("Should test that GET /products returns 201 success status code and a body", async () => {
    const response = await client.get("/products");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("Should test that POST /products returns 201 and an _id if a valid product is provided in req.body", async () => {
    const response = await client.post("/products").send(validProduct);
    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
  });

  it("Should test that POST /products returns 400 if a not valid product is provided in req.body", async () => {
    await client.post("/products").send(notValidProduct).expect(400);
  });

  test("Should return 404 with a non-existing id", async () => {
    const response = await client.get(`/products/${invalidId}`);
    expect(response.status).toBe(404);
  });

  test("Should return the correct product with a valid id", async () => {
    const response = await client.get(`/products/${product._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      brand: product.brand,
      imageUrl: product.imageUrl,
      category: product.category,
    });
  });

  test("Should return 404 with a non-existing id", async () => {
    const response = await client.delete(`/products/${invalidId}`);
    expect(response.status).toBe(404);
  });

  test("Should return delete the products", async () => {
    const response = await client.delete(`/products/${product._id}`);
    expect(response.status).toBe(204);
    const deletedProduct = await ProductsModel.findById(product._id);
    expect(deletedProduct).toBeNull();
  });

  // it("Should test that GET /products returns 200 and a body", async () => {
  //   const response = await client.get("/products").expect(200)
  //   console.log(response.body)
  // })
});
