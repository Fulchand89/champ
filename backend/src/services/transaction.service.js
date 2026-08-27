const { Op } = require('sequelize');
const { Transaction, User } = require('../database');

class TransactionService {
  async getTransactions(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (query.type && query.type !== 'all') {
      whereClause.type = query.type;
    }

    if (query.status && query.status !== 'all') {
      whereClause.status = query.status;
    }

    if (query.startDate && query.endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(query.startDate), new Date(query.endDate)],
      };
    }

    if (query.search && query.search.trim()) {
      const s = `%${query.search.trim()}%`;
      whereClause[Op.or] = [
        { txnId: { [Op.like]: s } },
        { paymentMethod: { [Op.like]: s } },
        { description: { [Op.like]: s } },
      ];
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'mobile', 'profilePicUrl'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
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

  async getTransactionById(id) {
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'mobile'],
        },
      ],
    });

    return transaction;
  }

  async createTransaction(data) {
    const txnId = data.txnId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const transaction = await Transaction.create({
      txnId,
      userId: data.userId || null,
      type: data.type || 'deposit',
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'INR',
      paymentMethod: data.paymentMethod || 'UPI',
      paymentGateway: data.paymentGateway || 'Razorpay',
      gatewayTxnId: data.gatewayTxnId || null,
      status: data.status || 'successful',
      description: data.description || '',
    });

    return transaction;
  }

  async exportCsv(query = {}) {
    const res = await this.getTransactions({ ...query, limit: 1000 });
    const data = res.data || [];
    let csv = 'TXN ID,User Name,Email,Type,Amount (INR),Payment Method,Gateway,Status,Date & Time\n';

    data.forEach((t) => {
      const userName = t.user ? `"${t.user.name || ''}"` : '"Guest / Platform"';
      const email = t.user ? `"${t.user.email || ''}"` : '""';
      const date = new Date(t.createdAt).toLocaleString();
      csv += `"${t.txnId}",${userName},${email},"${t.type}","${t.amount}","${t.paymentMethod}","${t.paymentGateway || ''}","${t.status}","${date}"\n`;
    });

    return csv;
  }
}

module.exports = new TransactionService();
