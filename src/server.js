// const express = require("express") OLD IMPORT SYNTAX
import Express from "express"; // NEW IMPORT SYNTAX (We can use it only if we add "type": "module", to package.json)
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  genericErrorHandler,
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
  forbiddenErrorHandler,
} from "./errorsHandlers.js";
import productsRouter from "./api/products/index.js";

const server = Express();
// ************************** MIDDLEWARES *********************
server.use(cors());
server.use(Express.json()); // If you don't add this line BEFORE the endpoints all request bodies will be UNDEFINED!!!!!!!!!!!!!!!

// ************************** ENDPOINTS ***********************
server.use("/products", productsRouter);
// ************************* ERROR HANDLERS *******************
server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(forbiddenErrorHandler); // 403
server.use(notfoundHandler); // 404
server.use(genericErrorHandler); // 500 (this should ALWAYS be the last one)

export default server;
