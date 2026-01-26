const { buildSearchFilters } = require('../utils/queryHelper');

describe('queryHelper', () => {
    describe('buildSearchFilters', () => {
        it('should ignore "path" parameter in query', () => {
            const query = {
                Status: 'Open',
                path: 'jobs' // Vercel injection
            };
            const result = buildSearchFilters(query);

            // Should verify that 'path' is NOT in the SQL
            expect(result.sql).not.toContain('path = ?');
            expect(result.params).not.toContain('jobs');

            // Should still contain 'Status' with alias
            expect(result.sql).toContain('sr.Status = ?');
            expect(result.params).toContain('Open');
        });

        it('should handle regular parameters correctly', () => {
            const query = {
                Brand: 'Kirloskar'
            };
            const result = buildSearchFilters(query);
            expect(result.sql).toContain('a.Brand = ?');
            expect(result.params).toContain('Kirloskar');
        });
    });
});
