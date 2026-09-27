const express = require("express");

const router =
    express.Router();



const controller = require(
    "../controllers/tourPackageController"
);
const TourPackageUpload = require("../middlewares/tourPackageUpload");


router.get(
    "/",
    controller.getTourPackages
);

router.get(
    "/slug/:slug",
    controller.getTourPackageBySlug
);

router.get(
    "/:id",
    controller.getTourPackageById
);

router.post(
    "/",
    TourPackageUpload.any(),
    controller.createTourPackage
);

router.put(
    "/:id",
    TourPackageUpload.any(),
    controller.updateTourPackage
);

router.delete(
    "/:id",
    controller.deleteTourPackage
);


module.exports = router;