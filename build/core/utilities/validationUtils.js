"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationFunctions = void 0;
/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 *
 * @param {string} param the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
function isStringProvided(param) {
    // TODO: rewrite for TS
    return param !== undefined && param.length > 0;
}
function isNumberProvided(value) {
    return value != null && value != '' && !isNaN(Number(value.toString()));
}
// Feel free to add your own validations functions!
// for example: isNumericProvided, isValidPassword, isValidEmail, etc
// don't forget to export any
const validationFunctions = {
    isStringProvided,
    isNumberProvided,
};
exports.validationFunctions = validationFunctions;
//# sourceMappingURL=validationUtils.js.map