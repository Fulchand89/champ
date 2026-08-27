/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - uuid
 *         - name
 *         - email
 *         - role
 *         - isActive
 *         - isVerified
 *         - createdAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         uuid:
 *           type: string
 *           example: USR-550E8400
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         mobile:
 *           type: string
 *           example: "9876543210"
 *         role:
 *           type: string
 *           enum: [user, admin, super_admin]
 *           example: user
 *         city:
 *           type: string
 *           example: "New Delhi"
 *         adharNumber:
 *           type: string
 *           example: "123456789012"
 *         adharImages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["http://localhost:6060/uploads/adhar_images/adhar-front.jpg", "http://localhost:6060/uploads/adhar_images/adhar-back.jpg"]
 *         aadharImages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["http://localhost:6060/uploads/adhar_images/adhar-front.jpg", "http://localhost:6060/uploads/adhar_images/adhar-back.jpg"]
 *         profilePicUrl:
 *           type: string
 *           example: "http://localhost:6060/uploads/profile_pics/pic-123456.jpg"
 *         isActive:
 *           type: boolean
 *           example: true
 *         isVerified:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: pending
 *         isTermAccpeted:
 *           type: boolean
 *           example: false
 *         authProvider:
 *           type: string
 *           enum: [local, google]
 *           example: local
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     AuthResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Success
 * 
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - mobile
 *               - city
 *               - adharNumber
 *               - adhar_images
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               adharNumber:
 *                 type: string
 *                 description: Mandatory 12-digit Aadhaar number
 *                 example: "123456789012"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *               city:
 *                 type: string
 *                 example: "New Delhi"
 *               isTermAccpeted:
 *                 type: boolean
 *                 description: Terms and conditions accepted status (true/false)
 *                 example: true
 *    
 *               profile_pic:
 *                 type: string
 *                 format: binary
 *                 description: User profile picture to upload (optional)
 *               adhar_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Mandatory Aadhaar card image(s) (front and back sides)
 *     responses:
 *       201:
 *         description: User registered successfully (no token returned; user must login)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: Registration successful
 *               data:
 *                 id: 1
 *                 uuid: USR-550E8400
 *                 name: John Doe
 *                 email: john@example.com
 *                 mobile: "9876543210"
 *                 role: user
 *                 city: "New Delhi"
 *                 profilePicUrl: "/uploads/profile_pics/profile_pic-1718537818.jpg"
 *                 isActive: true
 *                 isVerified: pending
 *                 isTermAccpeted: false
 *                 authProvider: local
 *                 createdAt: "2026-06-16T06:16:58.200Z"
 *                 updatedAt: "2026-06-16T06:16:58.200Z"
 *       400:
 *         description: Validation error or Email/Mobile already exists
 * 
 * /auth/login:
 *   post:
 *     summary: Login for standard users
 *     description: Authenticates regular application users using email and password. Only users with the `user` role are permitted.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or inactive account
 *       403:
 *         description: Access denied. Only standard users can login to this portal.
 * /auth/login/admin:
 *   post:
 *     summary: Login for administrative users
 *     description: Authenticates admin users using email and password. Only users with the `admin` role are permitted.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or inactive account
 *       403:
 *         description: Access denied. Only administrators can login to this portal.
 * 
 * /auth/login/super-admin:
 *   post:
 *     summary: Login for Super Administrators
 *     description: Authenticates super administrators using email and password. Only users with the `super_admin` role are permitted.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Super Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or inactive account
 *       403:
 *         description: Access denied. Only super administrators can login to this portal.
 * 
 * /auth/google:
 *   post:
 *     summary: Firebase Google Authentication & Registration
 *     description: >
 *       Handles user authentication and account provisioning using Google Sign-In via the Firebase Admin SDK.
 *       
 *       ### Authentication & Registration Flow:
 *       1. **Existing User**:
 *          - If the user account already exists with complete profile details, the API authenticates immediately and returns a valid JWT session (`200 OK`, `requiresMobile: false`).
 *       
 *       2. **First-Time User (New Registration)**:
 *          - Because Google does not provide mobile numbers, city, or identity documents, the following fields are **strictly mandatory** for registration:
 *            - `mobile` (10–15 digits)
 *            - `city` (string)
 *            - `adharNumber` (12-digit Aadhaar number)
 *            - `adhar_images` (Aadhaar card front & back image files or URLs)
 *          - If the client only sends the `idToken`, the API responds with:
 *            `requiresMobile: true`, `requiresAdditionalInfo: true`, and the pre-filled Google account details (`name`, `email`, `profilePicUrl`, `firebaseUid`).
 *          - The client app must prompt the user to fill the remaining details and re-send the request with `idToken`, `mobile`, `city`, `adharNumber`, and `adhar_images` (via `multipart/form-data` or `application/json`).
 *       
 *       3. **Account Verification**:
 *          - Newly registered accounts are created with default `isVerified: "pending"` (requires admin approval).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase Google ID Token
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: Role for user registration (default is user)
 *                 example: user
 *               mobile:
 *                 type: string
 *                 description: Mobile number (Mandatory for first-time registration)
 *                 example: "9876543210"
 *               city:
 *                 type: string
 *                 description: City (Mandatory for first-time registration)
 *                 example: "New Delhi"
 *               adharNumber:
 *                 type: string
 *                 description: 12-digit Aadhaar number (Mandatory for first-time registration)
 *                 example: "123456789012"
 *               adhar_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Aadhaar card image(s) front and back (Mandatory for first-time registration)
 *               isTermAccpeted:
 *                 type: boolean
 *                 description: Terms and conditions accepted status (true/false)
 *                 example: true
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase Google ID Token
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               city:
 *                 type: string
 *                 example: "New Delhi"
 *               adharNumber:
 *                 type: string
 *                 example: "123456789012"
 *               adharImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["/uploads/adhar_images/front.jpg", "/uploads/adhar_images/back.jpg"]
 *               isTermAccpeted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Authenticated successfully or Additional Info / Mobile input required
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Success full login/registration response
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     requiresMobile:
 *                       type: boolean
 *                       example: false
 *                     requiresAdditionalInfo:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Login successful
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *                 - type: object
 *                   description: Additional info / Mobile number input required response
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     requiresMobile:
 *                       type: boolean
 *                       example: true
 *                     requiresAdditionalInfo:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Mobile number, city, Aadhaar number, and Aadhaar card images are mandatory for registration.
 *                     missingFields:
 *                       type: object
 *                       properties:
 *                         mobile:
 *                           type: boolean
 *                           example: true
 *                         city:
 *                           type: boolean
 *                           example: true
 *                         adharNumber:
 *                           type: boolean
 *                           example: true
 *                         adharImages:
 *                           type: boolean
 *                           example: true
 *                     data:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: john.google@example.com
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         profilePicUrl:
 *                           type: string
 *                           example: https://lh3.googleusercontent.com/a/ACg8ocL...
 *                         firebaseUid:
 *                           type: string
 *                           example: "abcd1234efgh5678"
 *       400:
 *         description: Validation Error or Mobile number already registered to another account
 *       401:
 *         description: Invalid or expired Firebase ID token or inactive account
 * 
 * /auth/forgot-password:
 *   post:
 *     summary: Request OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email successfully
 *       400:
 *         description: User not found
 * 
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent to email successfully
 *       400:
 *         description: User not found
 * 
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     resetToken:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 * 
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using the reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               resetToken:
 *                 type: string
 *                 example: "some-long-reset-token"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 * 
 * /auth/me/profile-pic:
 *   delete:
 *     summary: Delete the current user's profile picture
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
 *       400:
 *         description: Profile picture not found
 *       401:
 *         description: Unauthorized
 * 
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 * 
 *   put:
 *     summary: Update current user profile (Name, City, Mobile, Profile Picture)
 *     description: Allows the authenticated user to update their name, city, mobile number, and profile picture. Email and Aadhaar details cannot be updated here.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               profile_pic:
 *                 type: string
 *                 format: binary
 *                 description: New profile picture to upload
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 * 
 * /auth/me/change-password:
 *   put:
 *     summary: Change current user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Current password incorrect or missing fields
 *       401:
 *         description: Unauthorized
 * 
 * /auth/me/change-email/request:
 *   post:
 *     summary: Request email change OTP
 *     description: Sends a verification OTP to the specified new email address.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: OTP for email change has been sent to your new email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email already in use or validation error
 *       401:
 *         description: Unauthorized
 * 
 * /auth/me/change-email/resend:
 *   post:
 *     summary: Resend OTP for pending email change
 *     description: Resends the OTP to the previously requested pending email address.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: No pending email change request found
 *       401:
 *         description: Unauthorized
 * 
 * /auth/me/change-email/verify:
 *   post:
 *     summary: Verify email change OTP
 *     description: Verifies the OTP sent to the new email address and updates the user's email.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: 6-digit verification OTP
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP, or email already registered
 *       401:
 *         description: Unauthorized
 * 
 * /auth/fcm-token:
 *   post:
 *     summary: Save or update FCM device token for push notifications
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - deviceType
 *             properties:
 *               token:
 *                 type: string
 *                 example: "fcm_device_token_xyz123"
 *               deviceType:
 *                 type: string
 *                 enum: [android, ios, web]
 *                 example: "android"
 *               deviceId:
 *                 type: string
 *                 example: "device-uuid-123"
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "FCM token saved successfully"
 *       400:
 *         description: Bad Request / Validation error
 *       401:
 *         description: Unauthorized
 * 
 * /auth/notifications:
 *   get:
 *     summary: Get my notifications list with unread count
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 * 
 * /auth/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read for logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 * 
 * /auth/notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 * 
 * /auth/notifications/delete-all:
 *   delete:
 *     summary: Delete all notifications for logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted successfully
 *       401:
 *         description: Unauthorized
 * 
 * /auth/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification by ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 */
