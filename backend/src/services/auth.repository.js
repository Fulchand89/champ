const User = require('../database/models/user.model');

class AuthRepository {
  /**
   * Find a user by email address
   * @param {string} email 
   * @returns {Promise<User>}
   */
  async findByEmail(email) {
    return User.findByEmail(email);
  }

  /**
   * Find a user by mobile number
   * @param {string} mobile 
   * @returns {Promise<User>}
   */
  async findByMobile(mobile) {
    return User.findOne({ where: { mobile } });
  }

  /**
   * Find a user by Aadhaar / Adhar number
   * @param {string} adharNumber 
   * @returns {Promise<User>}
   */
  async findByAdharNumber(adharNumber) {
    return User.findOne({ where: { adharNumber } });
  }

  /**
   * Find a user by Firebase UID
   * @param {string} firebaseUid 
   * @returns {Promise<User>}
   */
  async findByFirebaseUid(firebaseUid) {
    return User.findOne({ where: { firebaseUid } });
  }

  /**
   * Create a new user record
   * @param {Object} userData 
   * @returns {Promise<User>}
   */
  async create(userData) {
    return User.create(userData);
  }

  /**
   * Update an existing user
   * @param {Object} user Instance of the user
   * @param {Object} updates Data to update
   */
  async update(user, updates) {
    return user.update(updates);
  }

  /**
   * Soft delete a user
   * @param {Object} user Instance of the user
   */
  async delete(user) {
    const timestamp = Date.now();
    let newEmail = user.email;
    
    if (user.email && user.email.includes('@')) {
      const parts = user.email.split('@');
      const domain = parts.pop();
      let localPart = parts.join('@');
      const appendStr = `+deleted${timestamp}`;
      
      // Ensure the new email does not exceed the 100 character limit
      if (localPart.length + appendStr.length + 1 + domain.length > 100) {
        const allowedLen = 100 - appendStr.length - 1 - domain.length;
        localPart = localPart.substring(0, allowedLen);
      }
      
      newEmail = `${localPart}${appendStr}@${domain}`;
    }

    // Update the user to free up the unique email and mobile fields before soft deleting
    await user.update({
      email: newEmail,
      mobile: null,
      isActive: false
    }, { validate: false, hooks: false });


    return user.destroy();
  }

}

module.exports = new AuthRepository();
