# 2025-11-11
- Updated `src/controllers/resize.controller.js` to handle missing or invalid refresh tokens before resizing images, preventing the `jwt must be provided` error.

# 2025-11-12
- Reordered `src/routes/resize.routes.js` so the `/all/:userId` route resolves before the parameterized `/:userId/:resizeId`, fixing the `Cast to ObjectId failed for value "all"` error.

