const { Router } = require("express");
const { register, login } = require("../Controllers/user.controller");
const productController = require("../Controllers/product.controller");
const { getProductreview } = require("../Controllers/review.controller");
const shopController = require("../Controllers/shop.controller")
const router = Router();

//user controller 

//@body - {name, phone, password, referredBy(optional)}
//@response -- data:{user:{name, role}, token}
router.post('/register', register);

//@body -- {phone, password}
//@response -- data:{user:{name, role}, token}
router.post('/login', login);

//product route

//get random products
//@query - coordinates(optional), size, page all optional
//response -- data:{name ...}
router.get('/products', productController.getRandomProducts);

//@query -- key, size, page, coordinates
router.get('/search-products', productController.searchProduct);
router.get('/category-products', productController.getByCategory);
router.get('/product-info/:id', productController.getProductInfo);

//review route
router.get('/review', getProductreview);

//shop routes
router.get('/v2/:id', shopController.getShopInfo);
router.get('/shops', shopController.getShops)
router.get("/shop-products", shopController.getShopProducts);
router.get("/search-product-in-shop", shopController.searchProductInShop);
router.get("/search-shop", shopController.searchShop);
router.get("/shop-info",shopController.getShopInfo);


module.exports = router;

