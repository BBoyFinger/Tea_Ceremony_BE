"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Define HTTP status codes as constants
const HttpStatusCode = {
    OK: 200,
    Created: 201,
    Accepted: 202,
    NoContent: 204,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    Conflict: 409,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
};
exports.default = HttpStatusCode;
