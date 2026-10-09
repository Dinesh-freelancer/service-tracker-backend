const db = require('../db');

const generateQuoteNumber = (jobNumber) => {
  return `QT-${jobNumber}`;
};

const getQuotesByJob = async (jobNumber) => {
  const [rows] = await db.query(
    'SELECT * FROM quotes WHERE JobNumber = ? ORDER BY Revision DESC',
    [jobNumber]
  );
  return rows;
};

const getQuoteById = async (quoteId) => {
  const [quotes] = await db.query('SELECT * FROM quotes WHERE QuoteId = ?', [quoteId]);
  if (quotes.length === 0) return null;

  const quote = quotes[0];
  const [items] = await db.query('SELECT * FROM quote_items WHERE QuoteId = ?', [quoteId]);
  quote.items = items;
  return quote;
};

const getLatestQuoteForJob = async (jobNumber) => {
  const [rows] = await db.query(
    'SELECT * FROM quotes WHERE JobNumber = ? ORDER BY Revision DESC LIMIT 1',
    [jobNumber]
  );
  if (rows.length === 0) return null;
  return getQuoteById(rows[0].QuoteId);
};

const createQuote = async (quoteData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      JobNumber,
      Status = 'Draft',
      Subtotal,
      Discount = 0,
      DismantlingCharge = 0,
      TaxRate = 18,
      TaxAmount,
      GrandTotal,
      ValidityDays = 15,
      TermsAndConditions,
      CreatedBy,
      items = [],
    } = quoteData;

    // Determine Revision number
    const [existing] = await connection.query(
      'SELECT MAX(Revision) as maxRev FROM quotes WHERE JobNumber = ?',
      [JobNumber]
    );
    const revision = (existing[0].maxRev || 0) + 1;
    const quoteNumber = generateQuoteNumber(JobNumber);

    // Insert Quote
    const [quoteResult] = await connection.query(
      `INSERT INTO quotes
      (QuoteNumber, JobNumber, Revision, Status, Subtotal, Discount, DismantlingCharge, TaxRate, TaxAmount, GrandTotal, ValidityDays, TermsAndConditions, CreatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteNumber,
        JobNumber,
        revision,
        Status,
        Subtotal,
        Discount,
        DismantlingCharge,
        TaxRate,
        TaxAmount,
        GrandTotal,
        ValidityDays,
        TermsAndConditions,
        CreatedBy,
      ]
    );

    const quoteId = quoteResult.insertId;

    // Insert Items
    for (const item of items) {
      await connection.query(
        `INSERT INTO quote_items (QuoteId, ItemType, ReferenceId, Description, HSNSAC, Qty, UnitPrice)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteId,
          item.ItemType || 'Custom',
          item.ReferenceId || null,
          item.Description,
          item.HSNSAC || null,
          item.Qty || 1,
          item.UnitPrice || 0,
        ]
      );
    }

    // Update servicerequest EstimatedAmount & Status if active/sent
    if (['Sent', 'Approved', 'Draft'].includes(Status)) {
      await connection.query(
        'UPDATE servicerequest SET EstimatedAmount = ?, Status = "Awaiting Approval" WHERE JobNumber = ?',
        [GrandTotal, JobNumber]
      );
    }

    await connection.commit();
    return quoteId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateQuoteStatus = async (quoteId, status) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('UPDATE quotes SET Status = ? WHERE QuoteId = ?', [status, quoteId]);

    const [quotes] = await connection.query('SELECT * FROM quotes WHERE QuoteId = ?', [quoteId]);
    if (quotes.length > 0) {
      const quote = quotes[0];
      if (status === 'Approved') {
        await connection.query(
          'UPDATE servicerequest SET Status = "Approved", EstimatedAmount = ? WHERE JobNumber = ?',
          [quote.GrandTotal, quote.JobNumber]
        );
      } else if (status === 'Rejected') {
        await connection.query(
          'UPDATE servicerequest SET Status = "On Hold", HoldReason = "Estimate Rejected", ResolutionType = "Estimate Rejected" WHERE JobNumber = ?',
          [quote.JobNumber]
        );
      } else if (status === 'Sent') {
        await connection.query(
          'UPDATE servicerequest SET Status = "Awaiting Approval", EstimatedAmount = ? WHERE JobNumber = ?',
          [quote.GrandTotal, quote.JobNumber]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getQuotesByJob,
  getQuoteById,
  getLatestQuoteForJob,
  createQuote,
  updateQuoteStatus,
};
