const quoteModel = require('../models/quoteModel');

const getQuotesByJob = async (req, res) => {
  try {
    const quotes = await quoteModel.getQuotesByJob(req.params.jobNumber);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuoteById = async (req, res) => {
  try {
    const quote = await quoteModel.getQuoteById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLatestQuoteForJob = async (req, res) => {
  try {
    const quote = await quoteModel.getLatestQuoteForJob(req.params.jobNumber);
    if (!quote) return res.status(404).json({ error: 'No quote found for this job' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createQuote = async (req, res) => {
  try {
    const {
      JobNumber,
      Status,
      Subtotal,
      Discount,
      DismantlingCharge,
      TaxRate,
      TaxAmount,
      GrandTotal,
      ValidityDays,
      TermsAndConditions,
      items,
    } = req.body;

    if (!JobNumber) return res.status(400).json({ error: 'JobNumber is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one line item is required' });
    }

    const quoteId = await quoteModel.createQuote({
      JobNumber,
      Status,
      Subtotal,
      Discount,
      DismantlingCharge,
      TaxRate,
      TaxAmount,
      GrandTotal,
      ValidityDays,
      TermsAndConditions,
      CreatedBy: req.user?.id || req.user?.UserId || null,
      items,
    });

    const newQuote = await quoteModel.getQuoteById(quoteId);
    res.status(201).json(newQuote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    await quoteModel.updateQuoteStatus(req.params.id, status);
    res.json({ message: `Quote status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getQuotesByJob,
  getQuoteById,
  getLatestQuoteForJob,
  createQuote,
  updateQuoteStatus,
};
