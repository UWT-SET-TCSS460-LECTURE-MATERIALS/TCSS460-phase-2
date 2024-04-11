"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkParamsIdToJwtId = void 0;
const checkParamsIdToJwtId = (request, response, next) => {
    if (request.params.id !== request.claims.id) {
        response.status(400).send({
            message: 'Credentials do not match for this user.',
        });
    }
    next();
};
exports.checkParamsIdToJwtId = checkParamsIdToJwtId;
//# sourceMappingURL=verificationChecks.js.map