/**
 * @swagger
 * tags:
 *   - name: Super Admin Terms & Conditions
 *     description: Super Admin management endpoints for Terms & Conditions
 * 
 * components:
 *   schemas:
 *     SuperAdminTermsConditionItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         content:
 *           type: string
 *           example: "<h2>1. Acceptance of Terms</h2><p>Welcome to QuizApp...</p>"
 *         versionNumber:
 *           type: integer
 *           example: 1
 *         version:
 *           type: string
 *           example: "v1.0"
 *         isActive:
 *           type: boolean
 *           example: true
 *         status:
 *           type: string
 *           example: "Active"
 *         createdBy:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         author:
 *           type: string
 *           example: "Super Admin"
 *         date:
 *           type: string
 *           example: "Aug 17, 2026, 04:30 PM"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     SuperAdminTermsConditionResponseData:
 *       type: object
 *       properties:
 *         active:
 *           $ref: '#/components/schemas/SuperAdminTermsConditionItem'
 *         history:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SuperAdminTermsConditionItem'
 *             pagination:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 12
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 itemsPerPage:
 *                   type: integer
 *                   example: 10
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 hasPrevPage:
 *                   type: boolean
 *                   example: false
 * 
 *     PublishTermsConditionRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML or Markdown content of the terms and conditions
 *           example: "<h2>1. Acceptance of Terms</h2><p>Updated QuizApp rules and guidelines...</p>"
 */

/**
 * @swagger
 * /super-admin/terms-and-conditions:
 *   get:
 *     summary: Get active Terms & Conditions and paginated revision history
 *     tags: [Super Admin Terms & Conditions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of history items per page
 *     responses:
 *       200:
 *         description: Terms and conditions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SuperAdminTermsConditionResponseData'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin access required
 * 
 *   post:
 *     summary: Publish a new version of Terms & Conditions
 *     tags: [Super Admin Terms & Conditions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublishTermsConditionRequest'
 *     responses:
 *       200:
 *         description: Terms and conditions published successfully as new version
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SuperAdminTermsConditionItem'
 *       400:
 *         description: Content cannot be empty
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin access required
 */
