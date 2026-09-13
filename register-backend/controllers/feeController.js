
const Fee = require("../models/fee.model");

// ============================================================
// CREATE FEE
// POST /api/v1/fees
// ============================================================
exports.createFee = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Fee key is required",
            });
        }

        if (value === undefined || value === null) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Fee value is required",
            });
        }

        if (Number(value) < 0) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Fee value cannot be negative",
            });
        }

        const existingFee = await Fee.findOne({ key: key.trim() });

        if (existingFee) {
            return res.status(409).json({
                success: false,
                data: null,
                message: `Fee with key "${key}" already exists`,
            });
        }

        const fee = await Fee.create({
            key: key.trim(),
            value: Number(value),
        });

        return res.status(201).json({
            success: true,
            data: fee,
            message: "Fee created successfully",
        });
    } catch (error) {
        console.error("createFee error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                data: null,
                message: "Fee key already exists",
            });
        }

        return res.status(500).json({
            success: false,
            data: null,
            message: "Unable to create fee",
        });
    }
};


// ============================================================
// GET ALL FEES
// GET /api/v1/fees
// ============================================================
exports.getFees = async (req, res) => {
    try {
        const fees = await Fee.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: fees,
            message: "Fees fetched successfully",
        });
    } catch (error) {
        console.error("getFees error:", error);

        return res.status(500).json({
            success: false,
            data: null,
            message: "Unable to fetch fees",
        });
    }
};


// ============================================================
// GET SINGLE FEE
// GET /api/v1/fees/:id
// ============================================================
exports.getFeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const fee = await Fee.findById(id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Fee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: fee,
            message: "Fee fetched successfully",
        });
    } catch (error) {
        console.error("getFeeById error:", error);

        return res.status(500).json({
            success: false,
            data: null,
            message: "Unable to fetch fee",
        });
    }
};


// ============================================================
// GET FEE BY KEY
// GET /api/v1/fees/key/:key
// ============================================================
exports.getFeeByKey = async (req, res) => {
    try {
        const { key } = req.params;

        const fee = await Fee.findOne({
            key: key.trim(),
        });

        if (!fee) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Fee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: fee,
            message: "Fee fetched successfully",
        });
    } catch (error) {
        console.error("getFeeByKey error:", error);

        return res.status(500).json({
            success: false,
            data: null,
            message: "Unable to fetch fee",
        });
    }
};


// ============================================================
// UPDATE FEE
// PUT /api/v1/fees/:id
// ============================================================
exports.updateFee = async (req, res) => {
    try {
        const { id } = req.params;
        const { key, value } = req.body;

        const fee = await Fee.findById(id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Fee not found",
            });
        }

        if (key !== undefined) {
            const trimmedKey = key.trim();

            if (!trimmedKey) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message: "Fee key cannot be empty",
                });
            }

            const duplicateFee = await Fee.findOne({
                key: trimmedKey,
                _id: { $ne: id },
            });

            if (duplicateFee) {
                return res.status(409).json({
                    success: false,
                    data: null,
                    message: `Fee with key "${trimmedKey}" already exists`,
                });
            }

            fee.key = trimmedKey;
        }

        if (value !== undefined) {
            if (Number(value) < 0) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message: "Fee value cannot be negative",
                });
            }

            fee.value = Number(value);
        }

        await fee.save();

        return res.status(200).json({
            success: true,
            data: fee,
            message: "Fee updated successfully",
        });
    } catch (error) {
        console.error("updateFee error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                data: null,
                message: "Fee key already exists",
            });
        }

        return res.status(500).json({
            success: false,
            data: null,
            message: "Unable to update fee",
        });
    }
};


// ============================================================
// DELETE FEE
// DELETE /api/v1/fees/:id
// ============================================================
exports.deleteFee = async (req, res) => {
    try {
        const { id } = req.params;

        const fee = await Fee.findById(id);

        if (!fee) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Fee not found",
            });
        }

        await Fee.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            data: null,
            message: "Fee deleted successfully",
        });
    } catch (error) {
        console.error("deleteFee error:", error);

        return res.status(500).json({
            success: false,
            data: null,
            message: "Unable to delete fee",
        });
    }
};
