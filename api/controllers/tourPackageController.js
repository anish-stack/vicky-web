const {
    TourPackage,
} = require("../models");

const fs = require("fs");
const path = require("path");

const { Op } = require("sequelize");
// ============================================
// Helpers
// ============================================

const JSON_ARRAY_FIELDS = [
    "gallery",
    "highlights",
    "itinerary",
    "places_covered",
    "inclusions",
    "exclusions",
    "important_notes",
    "faqs",
    "vehicle_options",
    "hotel_options",
];
const parseJSON = (value, fallback = []) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    if (
        typeof value === "object"
    ) {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};
// MariaDB returns JSON columns as strings -> always hand out real arrays/objects
const parsePackage = (data) => {
    const out = { ...data };

    JSON_ARRAY_FIELDS.forEach((key) => {
        out[key] = asArray(out[key]);
    });

    const seo = parseJSON(out.seo, {});
    out.seo =
        seo && typeof seo === "object" && !Array.isArray(seo)
            ? seo
            : {};

    return out;
};
// GET responses: parsed JSON + startingPrice + absolute image URLs
const toResponse = (instance, req) => {
    const base = getBaseUrl(req);
    const plain =
        typeof instance?.toJSON === "function" ? instance.toJSON() : instance;
    return mapPackageImages(
        addStartingPrice(parsePackage(plain)),
        (url) => withBaseUrl(url, base)
    );
};

const parseBoolean = (
    value,
    fallback = false
) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    if (
        typeof value === "boolean"
    ) {
        return value;
    }

    return [
        "true",
        "1",
        "yes",
        "on",
    ].includes(
        String(value).toLowerCase()
    );
};


const parseNumber = (
    value,
    fallback = null
) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    const number = Number(value);

    return Number.isNaN(number)
        ? fallback
        : number;
};


const getFilePath = (file) => {
    if (!file) {
        return null;
    }

    return `/uploads/tour-packages/${file.filename}`;
};


const getFilesByField = (
    files = [],
    fieldname
) => {
    return files.filter(
        (file) =>
            file.fieldname === fieldname
    );
};

const toBoolFilter = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const v = String(value).toLowerCase();
    if (["1", "true", "yes"].includes(v)) return true;
    if (["0", "false", "no"].includes(v)) return false;
    return undefined;
};

const SORTS = {
    sort_order: [["sort_order", "ASC"], ["id", "DESC"]],
    latest: [["created_at", "DESC"]],
    oldest: [["created_at", "ASC"]],
    title: [["title", "ASC"]],
    days: [["days", "ASC"], ["sort_order", "ASC"]],
};

const getSingleFile = (
    files = [],
    fieldname
) => {
    return (
        files.find(
            (file) =>
                file.fieldname === fieldname
        ) || null
    );
};


const getBaseUrl = (req) =>
    (
        process.env.BASE_URL ||
        `${req.protocol}://${req.get("host")}`
    ).replace(/\/+$/, "");


const withBaseUrl = (url, base) => {
    if (!url || typeof url !== "string") {
        return url || null;
    }

    // already absolute / data uri
    if (
        /^(https?:)?\/\//i.test(url) ||
        url.startsWith("data:")
    ) {
        return url;
    }

    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};


const toRelative = (url, base) => {
    if (!url || typeof url !== "string") {
        return url || null;
    }

    if (base && url.startsWith(base)) {
        return url.slice(base.length) || null;
    }

    return url;
};


const asArray = (value) => {
    const parsed = parseJSON(value, []);
    return Array.isArray(parsed) ? parsed : [];
};


// map every image field of a package through `fn`
const mapPackageImages = (data, fn) => ({
    ...data,

    cover_image: fn(data.cover_image),

    gallery: asArray(data.gallery).map(fn),

    itinerary: asArray(data.itinerary).map(
        (day) => ({
            ...day,
            image: fn(day?.image),
        })
    ),

    places_covered: asArray(data.places_covered).map(
        (place) => ({
            ...place,
            image: fn(place?.image),
        })
    ),

    vehicle_options: asArray(data.vehicle_options).map(
        (vehicle) => ({
            ...vehicle,
            image: fn(vehicle?.image),
        })
    ),

    hotel_options: asArray(data.hotel_options).map(
        (hotel) => ({
            ...hotel,
            images: asArray(hotel?.images).map(fn),
        })
    ),
});


const applyBaseUrl = (data, req) => {
    const base = getBaseUrl(req);
    return mapPackageImages(data, (url) => withBaseUrl(url, base));
};


const stripBaseUrl = (data, req) => {
    const base = getBaseUrl(req);
    return mapPackageImages(data, (url) => toRelative(url, base));
};
const removeFile = (fileUrl) => {
    if (
        !fileUrl ||
        typeof fileUrl !== "string"
    ) {
        return;
    }

    if (
        !fileUrl.startsWith(
            "/uploads/tour-packages/"
        )
    ) {
        return;
    }

    try {
        const fullPath = path.join(
            process.cwd(),
            fileUrl.replace(
                /^\//,
                ""
            )
        );

        if (
            fs.existsSync(fullPath)
        ) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error(
            "Unable to remove image:",
            error.message
        );
    }
};


const deleteUploadedFiles = (
    files = []
) => {
    files.forEach((file) => {
        try {
            if (
                file?.path &&
                fs.existsSync(file.path)
            ) {
                fs.unlinkSync(file.path);
            }
        } catch (error) {
            console.error(
                "Unable to cleanup uploaded image:",
                error.message
            );
        }
    });
};


// ============================================
// Build image-aware package body
// ============================================

const buildPackageData = (
    req,
    existing = null
) => {
    const body = req.body || {};
    const files = req.files || [];

    /*
     * Frontend sends JSON fields as strings
     *
     * highlights
     * itinerary
     * places_covered
     * inclusions
     * exclusions
     * important_notes
     * faqs
     * vehicle_options
     * hotel_options
     * seo
     */

    const gallery = parseJSON(
        body.gallery,
        existing?.gallery || []
    );

    const highlights = parseJSON(
        body.highlights,
        existing?.highlights || []
    );

    const itinerary = parseJSON(
        body.itinerary,
        existing?.itinerary || []
    );

    const placesCovered = parseJSON(
        body.places_covered,
        existing?.places_covered || []
    );

    const inclusions = parseJSON(
        body.inclusions,
        existing?.inclusions || []
    );

    const exclusions = parseJSON(
        body.exclusions,
        existing?.exclusions || []
    );

    const importantNotes = parseJSON(
        body.important_notes,
        existing?.important_notes || []
    );

    const faqs = parseJSON(
        body.faqs,
        existing?.faqs || []
    );

    const vehicleOptions = parseJSON(
        body.vehicle_options,
        existing?.vehicle_options || []
    );

    const hotelOptions = parseJSON(
        body.hotel_options,
        existing?.hotel_options || []
    );

    const seo = parseJSON(
        body.seo,
        existing?.seo || {}
    );


    // ------------------------------------------
    // Cover Image
    // ------------------------------------------

    const coverFile = getSingleFile(
        files,
        "cover_image"
    );

    let coverImage =
        existing?.cover_image || null;

    if (coverFile) {
        coverImage =
            getFilePath(coverFile);
    }


    // ------------------------------------------
    // Gallery
    // ------------------------------------------

    const galleryFiles =
        getFilesByField(
            files,
            "gallery"
        );

    let finalGallery =
        Array.isArray(gallery)
            ? gallery
            : [];

    if (galleryFiles.length) {
        finalGallery = [
            ...finalGallery,
            ...galleryFiles.map(
                getFilePath
            ),
        ];
    }


    // ------------------------------------------
    // Itinerary Images
    // key: itinerary_0_image
    // ------------------------------------------

    const finalItinerary =
        Array.isArray(itinerary)
            ? itinerary.map(
                (item, index) => {
                    const file =
                        getSingleFile(
                            files,
                            `itinerary_${index}_image`
                        );

                    return {
                        ...item,

                        image: file
                            ? getFilePath(file)
                            : item.image ||
                            null,

                        items:
                            Array.isArray(
                                item.items
                            )
                                ? item.items
                                : [],
                    };
                }
            )
            : [];


    // ------------------------------------------
    // Places Covered Images
    // key: place_0_image
    // ------------------------------------------

    const finalPlacesCovered =
        Array.isArray(placesCovered)
            ? placesCovered.map(
                (item, index) => {
                    const file =
                        getSingleFile(
                            files,
                            `place_${index}_image`
                        );

                    return {
                        ...item,

                        image: file
                            ? getFilePath(file)
                            : item.image ||
                            null,
                    };
                }
            )
            : [];


    // ------------------------------------------
    // Vehicle Single Image
    // key: vehicle_0_image
    // ------------------------------------------

    const finalVehicleOptions =
        Array.isArray(vehicleOptions)
            ? vehicleOptions.map(
                (item, index) => {
                    const file =
                        getSingleFile(
                            files,
                            `vehicle_${index}_image`
                        );

                    return {
                        ...item,

                        image: file
                            ? getFilePath(file)
                            : item.image ||
                            null,

                        vehicle:
                            item.vehicle || null,

                        label:
                            item.label || "",

                        seats:
                            item.seats ||
                            "4+1 Seats",

                        suitcases:
                            item.suitcases ||
                            "2 Suitcases",

                        ac:
                            item.ac !== false,

                        price:
                            parseNumber(
                                item.price,
                                0
                            ),

                        sortOrder:
                            parseNumber(
                                item.sortOrder,
                                index
                            ),

                        isActive:
                            item.isActive !==
                            false,
                    };
                }
            )
            : [];


    // ------------------------------------------
    // Hotel Multiple Images
    //
    // key:
    // hotel_0_images
    // hotel_1_images
    // ------------------------------------------

    const finalHotelOptions =
        Array.isArray(hotelOptions)
            ? hotelOptions.map(
                (item, index) => {
                    const hotelFiles =
                        getFilesByField(
                            files,
                            `hotel_${index}_images`
                        );

                    let images =
                        Array.isArray(
                            item.images
                        )
                            ? item.images
                            : [];

                    if (
                        hotelFiles.length
                    ) {
                        images = [
                            ...images,
                            ...hotelFiles.map(
                                getFilePath
                            ),
                        ];
                    }

                    return {
                        ...item,

                        images,

                        hotel:
                            item.hotel || null,

                        name:
                            item.name || "",

                        location:
                            item.location || "",

                        priceOverride:
                            item.priceOverride ===
                                null
                                ? null
                                : parseNumber(
                                    item.priceOverride,
                                    null
                                ),

                        nights:
                            parseNumber(
                                item.nights,
                                1
                            ),

                        sortOrder:
                            parseNumber(
                                item.sortOrder,
                                index
                            ),

                        isActive:
                            item.isActive !==
                            false,
                    };
                }
            )
            : [];


    // ------------------------------------------
    // Complete model layout
    // ------------------------------------------

    const days = parseNumber(
        body.days,
        existing?.days
    );

    const nights = parseNumber(
        body.nights,
        existing?.nights
    );

    let durationLabel =
        body.duration_label ||
        existing?.duration_label ||
        null;

    if (
        !body.duration_label &&
        days !== null &&
        nights !== null
    ) {
        durationLabel =
            `${days} Days / ${nights} Night Tour`;
    }

    return {
        title:
            body.title ??
            existing?.title,

        slug:
            body.slug ??
            existing?.slug,

        from_city_name:
            body.from_city_name ??
            existing?.from_city_name,

        to_city_name:
            body.to_city_name ??
            existing?.to_city_name,

        from_city_id:
            body.from_city_id !==
                undefined
                ? parseNumber(
                    body.from_city_id,
                    null
                )
                : existing?.from_city_id ||
                null,

        cover_image:
            coverImage,

        gallery:
            finalGallery,

        days,

        nights,

        duration_label:
            durationLabel,

        trip_type:
            body.trip_type ||
            existing?.trip_type ||
            "roundTrip",

        short_description:
            body.short_description ??
            existing?.short_description ??
            "",

        description:
            body.description ??
            existing?.description ??
            "",

        highlights,

        hotel_optional:
            body.hotel_optional !==
                undefined
                ? parseBoolean(
                    body.hotel_optional,
                    true
                )
                : existing
                    ? !!existing.hotel_optional
                    : true,

        itinerary:
            finalItinerary,

        places_covered:
            finalPlacesCovered,

        inclusions,

        exclusions,

        important_notes:
            importantNotes,

        faqs,

        vehicle_options:
            finalVehicleOptions,

        hotel_options:
            finalHotelOptions,

        booking_charge_percent:
            body.booking_charge_percent !==
                undefined
                ? parseNumber(
                    body.booking_charge_percent,
                    10
                )
                : existing
                    ? Number(
                        existing.booking_charge_percent
                    )
                    : 10,

        rating:
            body.rating !==
                undefined
                ? parseNumber(
                    body.rating,
                    4.8
                )
                : existing
                    ? Number(existing.rating)
                    : 4.8,

        review_count:
            body.review_count !==
                undefined
                ? parseNumber(
                    body.review_count,
                    0
                )
                : existing?.review_count ||
                0,

        is_featured:
            body.is_featured !==
                undefined
                ? parseBoolean(
                    body.is_featured,
                    false
                )
                : existing
                    ? !!existing.is_featured
                    : false,

        is_active:
            body.is_active !==
                undefined
                ? parseBoolean(
                    body.is_active,
                    true
                )
                : existing
                    ? !!existing.is_active
                    : true,

        sort_order:
            body.sort_order !==
                undefined
                ? parseNumber(
                    body.sort_order,
                    0
                )
                : existing?.sort_order ||
                0,

        seo,

        created_by:
            existing?.created_by ||
            req.user?.id ||
            null,

        updated_by:
            req.user?.id || null,
    };
};


// ============================================
// CREATE
// ============================================

exports.createTourPackage =
    async (req, res) => {
        try {
            const data = stripBaseUrl(
                buildPackageData(req),
                req
            );
            if (
                !data.title ||
                !data.slug ||
                !data.from_city_name ||
                !data.to_city_name
            ) {
                deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "title, slug, from_city_name and to_city_name are required",
                    });
            }

            if (
                !data.days ||
                data.days < 1
            ) {
                deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Valid days is required",
                    });
            }

            if (
                data.nights ===
                null ||
                data.nights < 0
            ) {
                deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Valid nights is required",
                    });
            }

            const slugExists =
                await TourPackage.findOne({
                    where: {
                        slug: data.slug,
                    },
                });

            if (slugExists) {
                deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(409)
                    .json({
                        success: false,
                        message:
                            "Tour package slug already exists",
                    });
            }

            const tourPackage =
                await TourPackage.create(
                    data
                );

            return res
                .status(201)
                .json({
                    success: true,

                    message:
                        "Tour package created successfully",

                    data:
                        addStartingPrice(
                            tourPackage.toJSON()
                        ),
                });
        } catch (error) {
            deleteUploadedFiles(
                req.files
            );

            console.error(
                "Create Tour Package:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        error.message ||
                        "Unable to create tour package",
                });
        }
    };


// ============================================
// UPDATE
// ============================================

exports.updateTourPackage =
    async (req, res) => {
        try {
            const {
                id,
            } = req.params;

            const tourPackage =
                await TourPackage.findByPk(
                    id
                );

            if (!tourPackage) {
                deleteUploadedFiles(
                    req.files
                );

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Tour package not found",
                    });
            }

            const oldData =
                tourPackage.toJSON();

            const data = stripBaseUrl(
                buildPackageData(
                    req,
                    oldData
                ),
                req
            );

            if (
                data.slug !==
                oldData.slug
            ) {
                const exists =
                    await TourPackage.findOne({
                        where: {
                            slug: data.slug,
                        },
                    });

                if (
                    exists &&
                    String(exists.id) !==
                    String(id)
                ) {
                    deleteUploadedFiles(
                        req.files
                    );

                    return res
                        .status(409)
                        .json({
                            success: false,

                            message:
                                "Tour package slug already exists",
                        });
                }
            }

            await tourPackage.update(
                data
            );


            // Remove old cover image when replaced
            if (
                data.cover_image &&
                oldData.cover_image &&
                data.cover_image !==
                oldData.cover_image
            ) {
                removeFile(
                    oldData.cover_image
                );
            }


            return res.json({
                success: true,

                message:
                    "Tour package updated successfully",

                data:
                    addStartingPrice(
                        tourPackage.toJSON()
                    ),
            });
        } catch (error) {
            deleteUploadedFiles(
                req.files
            );

            console.error(
                "Update Tour Package:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,

                    message:
                        error.message ||
                        "Unable to update tour package",
                });
        }
    };


// ============================================
// GET ALL
// ============================================

exports.getTourPackages = async (req, res) => {
    try {
        const {
            search = "",
            trip_type,
            from_city_id,
            days,
            sort = "sort_order",
        } = req.query;

        const isActive = toBoolFilter(req.query.is_active);
        const isFeatured = toBoolFilter(req.query.is_featured);
        const all = toBoolFilter(req.query.all) === true;

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const perPage = Math.min(
            Math.max(parseInt(req.query.items_per_page ?? req.query.limit, 10) || 10, 1),
            100
        );

        // ---------- where ----------
        const where = {};
        const term = String(search).trim();

        if (term) {
            where[Op.or] = [
                { title: { [Op.like]: `%${term}%` } },
                { slug: { [Op.like]: `%${term}%` } },
                { from_city_name: { [Op.like]: `%${term}%` } },
                { to_city_name: { [Op.like]: `%${term}%` } },
            ];
        }
        if (isActive !== undefined) where.is_active = isActive;
        if (isFeatured !== undefined) where.is_featured = isFeatured;
        if (["roundTrip", "oneWay"].includes(trip_type)) where.trip_type = trip_type;
        if (from_city_id && !Number.isNaN(Number(from_city_id))) where.from_city_id = Number(from_city_id);
        if (days && !Number.isNaN(Number(days))) where.days = Number(days);

        const order = SORTS[sort] || SORTS.sort_order;

        // ---------- no pagination ----------
        if (all) {
            const rows = await TourPackage.findAll({ where, order });
            return res.json({
                success: true,
                data: rows.map((item) => toResponse(item, req)),
                query: { search: term, is_active: isActive, is_featured: isFeatured, trip_type: trip_type || null, from_city_id: from_city_id || null, days: days || null, sort },
                message: "Tour packages fetched successfully",
            });
        }

        // ---------- paginated ----------
        const { count, rows } = await TourPackage.findAndCountAll({
            where,
            order,
            offset: (page - 1) * perPage,
            limit: perPage,
        });

        const lastPage = Math.max(Math.ceil(count / perPage), 1);
        const from = count ? (page - 1) * perPage + 1 : 0;
        const to = Math.min(page * perPage, count);

        const pagination = {
            page,
            items_per_page: perPage,
            total: count,
            last_page: lastPage,
            from,
            to,
            has_prev: page > 1,
            has_next: page < lastPage,
            prev_page: page > 1 ? page - 1 : null,
            next_page: page < lastPage ? page + 1 : null,
        };

        return res.json({
            success: true,
            data: rows.map((item, index) => ({
                ...toResponse(item, req),
                index_no: from + index,
            })),
            query: {
                search: term,
                is_active: isActive,
                is_featured: isFeatured,
                trip_type: trip_type || null,
                from_city_id: from_city_id || null,
                days: days || null,
                sort,
            },
            pagination,              // website: res.pagination
            payload: { pagination }, // admin useList: res.payload.pagination
            message: "Tour packages fetched successfully",
        });
    } catch (error) {
        console.error("Get Tour Packages:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// GET ONE
// ============================================

exports.getTourPackageById =
    async (req, res) => {
        try {
            const item =
                await TourPackage.findByPk(
                    req.params.id
                );

            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,

                        message:
                            "Tour package not found",
                    });
            }

            return res.json({
                success: true,

                data: applyBaseUrl(
                    addStartingPrice(
                        item.toJSON()
                    ),
                    req
                ),
            });
        } catch (error) {
            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        error.message,
                });
        }
    };


// ============================================
// GET BY SLUG
// ============================================

exports.getTourPackageBySlug =
    async (req, res) => {
        try {
            const item =
                await TourPackage.findOne({
                    where: {
                        slug: req.params.slug,
                        is_active: true,
                    },
                });

            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,

                        message:
                            "Tour package not found",
                    });
            }

            return res.json({
                success: true,

                data: applyBaseUrl(
                    addStartingPrice(
                        item.toJSON()
                    ),
                    req
                ),
            });
        } catch (error) {
            return res
                .status(500)
                .json({
                    success: false,

                    message:
                        error.message,
                });
        }
    };


// ============================================
// DELETE
// ============================================

exports.deleteTourPackage =
    async (req, res) => {
        try {
            const item =
                await TourPackage.findByPk(
                    req.params.id
                );

            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,

                        message:
                            "Tour package not found",
                    });
            }

            const data =
                item.toJSON();

            // Cover
            removeFile(
                data.cover_image
            );

            // Gallery
            (
                data.gallery || []
            ).forEach(removeFile);

            // Itinerary
            (
                data.itinerary || []
            ).forEach((day) =>
                removeFile(day.image)
            );

            // Places
            (
                data.places_covered ||
                []
            ).forEach((place) =>
                removeFile(
                    place.image
                )
            );

            // Vehicles
            (
                data.vehicle_options ||
                []
            ).forEach((vehicle) =>
                removeFile(
                    vehicle.image
                )
            );

            // Hotels
            (
                data.hotel_options ||
                []
            ).forEach((hotel) => {
                (
                    hotel.images || []
                ).forEach(removeFile);
            });

            await item.destroy();

            return res.json({
                success: true,

                message:
                    "Tour package deleted successfully",
            });
        } catch (error) {
            console.error(
                "Delete Tour Package:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,

                    message:
                        error.message,
                });
        }
    };


// ============================================
// Starting Price
// ============================================

function addStartingPrice(
    packageData
) {
    const vehicles =
        Array.isArray(
            packageData.vehicle_options
        )
            ? packageData.vehicle_options
            : [];

    const prices =
        vehicles
            .filter(
                (vehicle) =>
                    vehicle?.isActive !==
                    false
            )
            .map((vehicle) =>
                Number(vehicle.price)
            )
            .filter(
                (price) =>
                    Number.isFinite(price)
            );

    return {
        ...packageData,

        startingPrice:
            prices.length
                ? Math.min(...prices)
                : 0,
    };
}