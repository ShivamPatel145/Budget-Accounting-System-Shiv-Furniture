import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
import { validate } from "../middlewares/validate.js";
import { productValidation } from "../validations/product.validation.js";

const router = Router();

router.use(authenticate);

router.get("/products", authorize("ADMIN", "PORTAL"), listProducts);
router.get("/products/:id", authorize("ADMIN", "PORTAL"), getProduct);
router.post(
  "/products",
  authorize("ADMIN"),
  validate(productValidation.createProduct),
  createProduct,
);
router.put(
  "/products/:id",
  authorize("ADMIN"),
  validate(productValidation.updateProduct),
  updateProduct,
);
router.delete("/products/:id", authorize("ADMIN"), deleteProduct);

export default router;
