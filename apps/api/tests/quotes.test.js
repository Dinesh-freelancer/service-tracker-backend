const serviceModel = require('../models/serviceModel');
const quoteModel = require('../models/quoteModel');

describe('Services & Quotes Model Logic', () => {
  test('serviceModel exports required methods', () => {
    expect(typeof serviceModel.getAllServices).toBe('function');
    expect(typeof serviceModel.getServiceById).toBe('function');
    expect(typeof serviceModel.createService).toBe('function');
    expect(typeof serviceModel.updateService).toBe('function');
    expect(typeof serviceModel.deleteService).toBe('function');
  });

  test('quoteModel exports required methods', () => {
    expect(typeof quoteModel.getQuotesByJob).toBe('function');
    expect(typeof quoteModel.getQuoteById).toBe('function');
    expect(typeof quoteModel.getLatestQuoteForJob).toBe('function');
    expect(typeof quoteModel.createQuote).toBe('function');
    expect(typeof quoteModel.updateQuoteStatus).toBe('function');
  });
});
