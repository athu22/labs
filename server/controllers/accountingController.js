const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const formatGroup = (g) => ({
  id: g.id,
  name: g.name,
  type: g.type,
  parentGroupId: g.parent_group_id ?? g.parentGroupId ?? null,
  createdAt: g.created_at ?? g.createdAt,
});

const formatAccount = (a) => ({
  id: a.id,
  name: a.name,
  groupId: a.group_id ?? a.groupId ?? null,
  type: a.type,
  openingBalance: parseFloat(a.opening_balance ?? a.openingBalance ?? 0),
  currentBalance: parseFloat(a.current_balance ?? a.currentBalance ?? 0),
  createdAt: a.created_at ?? a.createdAt,
});

const formatTransaction = (t) => ({
  id: t.id,
  date: t.date,
  voucherType: t.voucher_type ?? t.voucherType,
  partyName: t.party_name ?? t.partyName,
  totalAmount: parseFloat(t.total_amount ?? t.totalAmount ?? 0),
  narration: t.narration,
  entries: t.entries || [],
  items: t.items || [],
  createdAt: t.created_at ?? t.createdAt,
});

const formatLedger = (l) => ({
  id: l.id,
  accountId: l.account_id ?? l.accountId,
  transactionId: l.transaction_id ?? l.transactionId,
  date: l.date,
  voucherType: l.voucher_type ?? l.voucherType,
  type: l.type,
  amount: parseFloat(l.amount ?? 0),
  balanceAfter: parseFloat(l.balance_after ?? l.balanceAfter ?? 0),
  narration: l.narration,
});

// --- Account Groups ---
const getAccountGroups = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('account_groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json((data || []).map(formatGroup));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAccountGroup = async (req, res) => {
  try {
    const { name, type, parentGroupId } = req.body;
    const { data, error } = await supabase
      .from('account_groups')
      .insert([{
        name,
        type, // 'Asset', 'Liability', 'Income', 'Expense'
        parent_group_id: parentGroupId || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ id: data.id, message: 'Account Group created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Accounts ---
const getAccounts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json((data || []).map(formatAccount));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { name, groupId, openingBalance = 0, type } = req.body;
    const parsedOpening = parseFloat(openingBalance) || 0;

    const { data, error } = await supabase
      .from('accounts')
      .insert([{
        name,
        group_id: groupId || null,
        type, // inherited from group: 'Asset', 'Liability', 'Income', 'Expense'
        opening_balance: parsedOpening,
        current_balance: parsedOpening,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ id: data.id, message: 'Account created' });
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
      entries = [], // Array of { accountId, type: 'debit'|'credit', amount }
      items // Optional for purchase/sale
    } = req.body;

    const transactionId = uuidv4();
    const parsedDate = new Date(date).toISOString();

    const { error: txError } = await supabase
      .from('transactions')
      .insert([{
        id: transactionId,
        date: parsedDate,
        voucher_type: voucherType,
        party_name: partyName,
        total_amount: parseFloat(totalAmount) || 0,
        narration,
        entries,
        items: items || [],
        created_at: new Date().toISOString()
      }]);

    if (txError) throw txError;

    // Update Account Balances & Create Ledger Entries
    const ledgerRows = [];
    for (const entry of entries) {
      const { data: accountData, error: accErr } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', entry.accountId)
        .single();

      if (accErr || !accountData) continue;

      let newBalance = parseFloat(accountData.current_balance || 0);
      const entryAmount = parseFloat(entry.amount) || 0;

      // Debit/Credit Logic
      if (entry.type === 'debit') {
        if (accountData.type === 'Asset' || accountData.type === 'Expense') {
          newBalance += entryAmount;
        } else {
          newBalance -= entryAmount;
        }
      } else if (entry.type === 'credit') {
        if (accountData.type === 'Liability' || accountData.type === 'Income') {
          newBalance += entryAmount;
        } else {
          newBalance -= entryAmount;
        }
      }

      const { error: updateErr } = await supabase
        .from('accounts')
        .update({ current_balance: newBalance })
        .eq('id', entry.accountId);

      if (updateErr) throw updateErr;

      ledgerRows.push({
        account_id: entry.accountId,
        transaction_id: transactionId,
        date: parsedDate,
        voucher_type: voucherType,
        type: entry.type,
        amount: entryAmount,
        balance_after: newBalance,
        narration
      });
    }

    if (ledgerRows.length > 0) {
      const { error: ledgerErr } = await supabase.from('ledger').insert(ledgerRows);
      if (ledgerErr) throw ledgerErr;
    }

    res.json({ id: transactionId, message: 'Transaction recorded successfully' });
  } catch (error) {
    console.error('Transaction Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { voucherType, startDate, endDate, limit } = req.query;
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (voucherType) query = query.eq('voucher_type', voucherType);
    if (startDate) query = query.gte('date', new Date(startDate).toISOString());
    if (endDate) query = query.lte('date', new Date(endDate).toISOString());
    if (limit) query = query.limit(parseInt(limit, 10));

    const { data, error } = await query;
    if (error) throw error;

    res.json((data || []).map(formatTransaction));
  } catch (error) {
    console.error('getTransactions Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getLedger = async (req, res) => {
  try {
    const { accountId } = req.params;

    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json((data || []).map(formatLedger));
  } catch (error) {
    console.error('getLedger Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTrialBalance = async (req, res) => {
  try {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) throw error;

    const accounts = (data || []).map(formatAccount);

    const trialBalance = accounts.map(acc => ({
      accountName: acc.name,
      type: acc.type,
      debit: acc.currentBalance > 0 && (acc.type === 'Asset' || acc.type === 'Expense')
        ? acc.currentBalance
        : (acc.currentBalance < 0 && (acc.type === 'Liability' || acc.type === 'Income') ? Math.abs(acc.currentBalance) : 0),
      credit: acc.currentBalance > 0 && (acc.type === 'Liability' || acc.type === 'Income')
        ? acc.currentBalance
        : (acc.currentBalance < 0 && (acc.type === 'Asset' || acc.type === 'Expense') ? Math.abs(acc.currentBalance) : 0),
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
