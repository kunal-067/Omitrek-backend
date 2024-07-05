const { Router } = require("express");
const shopController = require("../Controllers/shop.controller");
const { addProduct, editProduct, addExistingProduct, approveProduct } = require("../Controllers/product.controller");
const { getShopOrders, updateOrderStatus, approveOrderStatus } = require("../Controllers/order.controller");
const multer = require("multer");
const { ApiError, ApiResponse } = require("../Utils/api.util");
const cloudinary = require("../Configs/cloudinary.config")

const storage = multer.diskStorage({ destination: "./uploads" });
const upload = multer({ storage });

const router = Router()

router.post('/upload', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(404).json(new ApiError(404, "nothing is here to upload."));
        }

        const uploadPromises = files.map(file => 
            cloudinary.uploader.upload(file.path)
        );

        const uploadResults = await Promise.all(uploadPromises);

        const urls = uploadResults.map(result => result.secure_url);

        res.status(200).json(new ApiResponse(200, "Uploaded successfully !", urls));
    } catch (error) {
        res.status(500).json(new ApiError(500, "An error occurred during the upload process."));
    }
});



//product route ---

/* @quantity,@price,@discount */
router.post('/product/new', addProduct);
router.put('/product/edit', editProduct);

router.patch('/product/status', approveProduct)

//order route ---
router.get('/shop-orders', getShopOrders)
//seller on order status
router.patch('/order/update', approveOrderStatus)

router.get("/shop-info", shopController.getShopInfoBySeller);
/* take shop-id from cookies
@modifiedData - in body */
router.put("/edit-shop", shopController.editShop);

module.exports = router;