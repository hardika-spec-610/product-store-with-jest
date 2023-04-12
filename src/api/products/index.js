import express from "express";
import createError from "http-errors";
import ProductsRouter from "./model.js";

const productsRouter = express.Router();

productsRouter.post("/", async (req, res, next) => {
  try {
    const newResource = new ProductsRouter(req.body);
    const { _id } = await newResource.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const resources = await ProductsRouter.find();
    res.send(resources);
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
