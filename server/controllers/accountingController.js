const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// --- Account Groups ---
const getAccountGroups = async (req, res) => {
  try {
    const snapshot = await db.collection('accountGroups').orderBy('name').get();
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAccountGroup = async (req, res) => {
  try {
    const { name, type, parentGroupId } = req.body;
    const docRef = await db.collection('accountGroups').add({
      name,
      type, // 'Asset', 'Liability', 'Income', 'Expense'
      parentGroupId: parentGroupId || null,
      createdAt: new Date()
    });
    res.json({ id: docRef.id, message: 'Account Group created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Accounts ---
const getAccounts = async (req, res) => {
  try {
    const snapshot = await db.collection('accounts').orderBy('name').get();
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { name, groupId, openingBalance = 0, type } = req.body;
    const docRef = await db.collection('accounts').add({
      name,
      groupId,
      type, // inherited from group: 'Asset', 'Liability', 'Income', 'Expense'
      openingBalance: parseFloat(openingBalance),
      currentBalance: parseFloat(openingBalance),
      createdAt: new Date()
    });
    res.json({ id: docRef.id, message: 'Account created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Transactions ---
const createTransaction = async (req, res) => {
  try {
    const { 
      date, 
      voucherType, // 'purchase', 'sale', 'receipt', 'payment', 'journal'
      partyName,
      totalAmount,
      narration,
      entries, // Array of { accountId, type: 'debit'|'credit', amount }
      items // Optional for purchase/sale
    } = req.body;

    const batch = db.batch();
    const transactionId = uuidv4();
    const transactionRef = db.collection('transactions').doc(transactionId);

    batch.set(transactionRef, {
      date: new Date(date),
      voucherType,
      partyName,
      totalAmount: parseFloat(totalAmount),
      narration,
      entries,
      items: items || [],
      createdAt: new Date()
    });

    // Update Account Balances
    for (const entry of entries) {
      const accountRef = db.collection('accounts').doc(entry.accountId);
      const accountDoc = await accountRef.get();
      if (!accountDoc.exists) continue;

      const accountData = accountDoc.data();
      let newBalance = parseFloat(accountData.currentBalance || 0);

      // Debit/Credit Logic
      if (entry.type === 'debit') {
        if (accountData.type === 'Asset' || accountData.type === 'Expense') {
          newBalance += parseFloat(entry.amount);
        } else {
          newBalance -= parseFloat(entry.amount);
        }
      } else if (entry.type === 'credit') {
        if (accountData.type === 'Liability' || accountData.type === 'Income') {
          newBalance += parseFloat(entry.amount);
        } else {
          newBalance -= parseFloat(entry.amount);
        }
      }

      batch.update(accountRef, { currentBalance: newBalance });

      // Create Ledger Entry
      const ledgerRef = db.collection('ledger').doc();
      batch.set(ledgerRef, {
        accountId: entry.accountId,
        transactionId,
        date: new Date(date),
        voucherType,
        type: entry.type,
        amount: parseFloat(entry.amount),
        balanceAfter: newBalance,
        narration
      });
    }

    await batch.commit();
    res.json({ id: transactionId, message: 'Transaction recorded successfully' });
  } catch (error) {
    console.error('Transaction Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { voucherType, startDate, endDate } = req.query;
    let query = db.collection('transactions');

    if (voucherType) query = query.where('voucherType', '==', voucherType);
    // Note: Filtering by date and ordering requires composite index in Firestore.
    // For now, we fetch all and filter/sort in memory if indexes aren't set up.
    
    const snapshot = await query.get();
    let transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by date in memory if provided
    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter(t => t.date.toDate() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      transactions = transactions.filter(t => t.date.toDate() <= end);
    }

    // Sort by date desc in memory with safety
    transactions.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
      return dateB - dateA;
    });

    res.json(transactions);
  } catch (error) {
    console.error('getTransactions Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getLedger = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const snapshot = await db.collection('ledger')
      .where('accountId', '==', accountId)
      .get();
    
    let entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort in memory with robust safety
    entries.sort((a, b) => {
      try {
        const dateA = (a.date && typeof a.date.toDate === 'function') ? a.date.toDate() : new Date(a.date || 0);
        const dateB = (b.date && typeof b.date.toDate === 'function') ? b.date.toDate() : new Date(b.date || 0);
        return dateA - dateB;
      } catch (e) {
        return 0;
      }
    });
    
    res.json(entries);
  } catch (error) {
    console.error('getLedger Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTrialBalance = async (req, res) => {
  try {
    const snapshot = await db.collection('accounts').get();
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const trialBalance = accounts.map(acc => ({
      accountName: acc.name,
      type: acc.type,
      debit: acc.currentBalance > 0 && (acc.type === 'Asset' || acc.type === 'Expense') ? acc.currentBalance : (acc.currentBalance < 0 && (acc.type === 'Liability' || acc.type === 'Income') ? Math.abs(acc.currentBalance) : 0),
      credit: acc.currentBalance > 0 && (acc.type === 'Liability' || acc.type === 'Income') ? acc.currentBalance : (acc.currentBalance < 0 && (acc.type === 'Asset' || acc.type === 'Expense') ? Math.abs(acc.currentBalance) : 0),
    }));

    res.json(trialBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkStatus = async (req, res) => {
  res.json({ status: 'ok', message: 'Accounting API is live' });
};

module.exports = {
  getAccountGroups,
  createAccountGroup,
  getAccounts,
  createAccount,
  createTransaction,
  getTransactions,
  getLedger,
  getTrialBalance,
  checkStatus
};
