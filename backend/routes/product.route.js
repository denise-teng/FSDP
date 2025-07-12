import express from 'express';
import {createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getproductsByCategory, getRecommendedProducts, toggleFeaturedProduct} from '../controllers/product.controller.js';
import {adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/near", getFeaturedProducts);
router.get("/recommended", getRecommendedProducts);
router.get("/category/:category", getproductsByCategory);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router