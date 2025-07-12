
// @ts-ignore
import express from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import dotenv from 'dotenv';
// @ts-ignore
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crossflow';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use(cors());
app.use(express.json());

// Sample transaction data for development
const sampleTransactions = [
  {
    id: '1',
    currency: 'USD',
    amount: 1000000,
    status: 'completed',
    type: 'buy',
    nairaUsdtRate: 1280.50,
    amountProcessed: 1000,
    usdcSpent: 950000,
    amountReceived: 1280500,
    profit: 330500,
    transactionDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    originalAmount: 1280500,
    paidAmount: 1280500,
    remainingBalance: 0,
    isFullyPaid: true,
    clientName: 'John Doe',
    reference: 'TXN-001'
  },
  {
    id: '2',
    currency: 'GBP',
    amount: 800000,
    status: 'pending',
    type: 'buy',
    nairaUsdtRate: 1350.75,
    amountProcessed: 600,
    usdcSpent: 750000,
    amountReceived: 810450,
    profit: 60450,
    transactionDate: new Date('2024-01-16'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    originalAmount: 810450,
    paidAmount: 400000,
    remainingBalance: 410450,
    isFullyPaid: false,
    clientName: 'Jane Smith',
    reference: 'TXN-002'
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all transactions with filtering
app.get('/api/transactions', (req, res) => {
  try {
    let filteredTransactions = [...sampleTransactions];

    // Apply filters if provided
    const { currency, status, type, search, limit = 20, page = 1 } = req.query;

    if (currency) {
      filteredTransactions = filteredTransactions.filter(tx => tx.currency === currency);
    }
    if (status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
    }
    if (type) {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
    }
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredTransactions = filteredTransactions.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm) ||
        tx.clientName?.toLowerCase().includes(searchTerm) ||
        tx.reference?.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredTransactions.length,
          totalPages: Math.ceil(filteredTransactions.length / limitNum)
        },
        filters: { currency, status, type, search }
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      errors: [error.message]
    });
  }
});

// Get single transaction
app.get('/api/transactions/:id', (req, res) => {
  try {
    const transaction = sampleTransactions.find(tx => tx.id === req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      errors: [error.message]
    });
  }
});

// Create new transaction
app.post('/api/transactions', (req, res) => {
  try {
    const newTransaction = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sampleTransactions.unshift(newTransaction);

    res.status(201).json({
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      errors: [error.message]
    });
  }
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
  try {
    const transactionIndex = sampleTransactions.findIndex(tx => tx.id === req.params.id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updatedTransaction = {
      ...sampleTransactions[transactionIndex],
      ...req.body,
      updatedAt: new Date()
    };

    sampleTransactions[transactionIndex] = updatedTransaction;

    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      errors: [error.message]
    });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  try {
    const transactionIndex = sampleTransactions.findIndex(tx => tx.id === req.params.id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    sampleTransactions.splice(transactionIndex, 1);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      errors: [error.message]
    });
  }
});

// Get transaction analytics
app.get('/api/transactions/analytics', (req, res) => {
  try {
    const totalTransactions = sampleTransactions.length;
    const totalVolume = sampleTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalProfit = sampleTransactions.reduce((sum, tx) => sum + tx.profit, 0);
    const averageProfit = totalProfit / totalTransactions || 0;
    const profitMargin = totalVolume > 0 ? (totalProfit / totalVolume) * 100 : 0;

    // Currency breakdown
    const currencyBreakdown = sampleTransactions.reduce((breakdown, tx) => {
      if (!breakdown[tx.currency]) {
        breakdown[tx.currency] = { count: 0, volume: 0, profit: 0 };
      }
      breakdown[tx.currency].count++;
      breakdown[tx.currency].volume += tx.amount;
      breakdown[tx.currency].profit += tx.profit;
      return breakdown;
    }, {});

    // Status breakdown
    const statusBreakdown = sampleTransactions.reduce((breakdown, tx) => {
      breakdown[tx.status] = (breakdown[tx.status] || 0) + 1;
      return breakdown;
    }, {});

    // Payment analytics
    const totalOutstanding = sampleTransactions.reduce((sum, tx) => sum + tx.remainingBalance, 0);
    const totalOverdue = sampleTransactions
      .filter(tx => tx.remainingBalance > 0 && !tx.isFullyPaid)
      .reduce((sum, tx) => sum + tx.remainingBalance, 0);
    const collectionRate = totalVolume > 0 ? ((totalVolume - totalOutstanding) / totalVolume) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalVolume,
        totalProfit,
        averageProfit,
        profitMargin,
        currencyBreakdown,
        statusBreakdown,
        dailyTrends: [],
        paymentAnalytics: {
          totalOutstanding,
          totalOverdue,
          averageDaysOverdue: 0,
          collectionRate,
          paymentScheduleBreakdown: {},
          overdueBreakdown: []
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      errors: [error.message]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
