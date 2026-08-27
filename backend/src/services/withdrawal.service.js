const { Op } = require('sequelize');
const { Withdrawal, User, Transaction } = require('../database');

class WithdrawalService {
  async getWithdrawals(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (query.status && query.status !== 'all') {
      whereClause.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const s = `%${query.search.trim()}%`;
      whereClause[Op.or] = [
        { withdrawalId: { [Op.like]: s } },
        { payoutDetails: { [Op.like]: s } },
      ];
    }

    const { count, rows } = await Withdrawal.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'mobile', 'profilePicUrl', 'city'],
          required: false,
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
      order: [
        // Pending first
        [
          Withdrawal.sequelize.literal(`CASE WHEN status = 'pending' THEN 0 ELSE 1 END`),
          'ASC',
        ],
        ['createdAt', 'DESC'],
      ],
      limit,
      offset,
    });

    return {
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    };
  }

  async getWithdrawalById(id) {
    const withdrawal = await Withdrawal.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'mobile', 'profilePicUrl', 'city', 'adharNumber'],
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return withdrawal;
  }

  async requestWithdrawal(userId, data) {
    const withdrawalId = `WTH${Date.now().toString().slice(-6)}`;
    const withdrawal = await Withdrawal.create({
      withdrawalId,
      userId,
      amount: parseFloat(data.amount) || 0,
      payoutMethod: data.payoutMethod || 'upi',
      payoutDetails: data.payoutDetails || '',
      status: 'pending',
    });

    return withdrawal;
  }

  async verifyWithdrawal(id, { status, adminRemarks, adminId }) {
    const withdrawal = await Withdrawal.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!withdrawal) {
      return null;
    }

    if (withdrawal.status !== 'pending') {
      throw new Error(`Withdrawal is already ${withdrawal.status}`);
    }

    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be approved or rejected.');
    }

    // Create a transaction record when approved
    let transactionId = withdrawal.transactionId;
    if (status === 'approved') {
      const txn = await Transaction.create({
        txnId: `TXN_WTH_${withdrawal.withdrawalId}`,
        userId: withdrawal.userId,
        type: 'withdrawal',
        amount: withdrawal.amount,
        currency: 'INR',
        paymentMethod: withdrawal.payoutMethod === 'upi' ? 'UPI Payout' : 'Bank Transfer',
        paymentGateway: 'Direct Payout',
        status: 'successful',
        description: `Approved withdrawal payout #${withdrawal.withdrawalId} (${withdrawal.payoutDetails})`,
      });
      transactionId = txn.id;
    }

    withdrawal.status = status;
    withdrawal.adminRemarks = adminRemarks || (status === 'approved' ? 'Approved by Admin' : 'Rejected by Admin');
    withdrawal.verifiedBy = adminId || null;
    withdrawal.verifiedAt = new Date();
    if (transactionId) {
      withdrawal.transactionId = transactionId;
    }
    await withdrawal.save();

    return withdrawal;
  }
}

module.exports = new WithdrawalService();
