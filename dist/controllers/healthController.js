"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = void 0;
const getHealthStatus = (req, res) => {
    res.status(200).json({ status: "OK", message: "MARD API is healthy 🚀" });
};
exports.getHealthStatus = getHealthStatus;
exports.default = { getHealthStatus: exports.getHealthStatus };
