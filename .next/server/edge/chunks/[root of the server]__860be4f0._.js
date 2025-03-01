(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__860be4f0._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, d: __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, d: __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, d: __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
// Regex to match static assets
const STATIC_ASSETS = /\.(jpg|jpeg|png|gif|webp|svg|ico|ttf|woff|woff2|css|js)$/;
// Function to determine if a URL is for a static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.test(url);
}
function middleware(request) {
    const url = request.nextUrl.pathname;
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // Add caching headers for static assets
    if (isStaticAsset(url)) {
        // Cache static assets for 7 days (604800 seconds)
        response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        // Add ETag support for conditional requests
        response.headers.set('Vary', 'Accept-Encoding');
        // Set content type based on file extension
        if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
            response.headers.set('Content-Type', 'image/jpeg');
        } else if (url.endsWith('.png')) {
            response.headers.set('Content-Type', 'image/png');
        } else if (url.endsWith('.webp')) {
            response.headers.set('Content-Type', 'image/webp');
        }
    }
    // For tutorial images that are loaded from Unsplash
    if (url.includes('/tutorial') || url.includes('/api/photos')) {
        // Cache for 1 day (86400 seconds) with revalidation
        response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    }
    return response;
}
const config = {
    matcher: [
        // Match all static asset routes
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        // Match image optimization routes
        '/_next/image',
        // Match API routes for photos
        '/api/photos/:path*'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__860be4f0._.js.map