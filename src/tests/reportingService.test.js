const ReportingService = require('../modules/reporting/services/reportingService');
const Book = require('../modules/books/models/Book');
const BorrowingHistory = require('../modules/borrowing/models/BorrowingHistory');
const Borrower = require('../modules/borrowers/models/Borrower');
const { startOfMonth, endOfMonth, subMonths } = require('date-fns');

// Mock the models
jest.mock('../modules/books/models/Book');
jest.mock('../modules/borrowing/models/BorrowingHistory');
jest.mock('../modules/borrowers/models/Borrower');

describe('ReportingService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateAnalytics', () => {
    it('should generate analytics for borrowing data', async () => {
      const mockData = [
        {
          Book: { id: 1, title: 'Test Book 1', author: 'Author 1' },
          Borrower: { id: 1, name: 'John Doe' },
          checkout_date: '2024-01-01',
          returned_date: '2024-01-15',
          is_returned: true
        },
        {
          Book: { id: 2, title: 'Test Book 2', author: 'Author 2' },
          Borrower: { id: 2, name: 'Jane Smith' },
          checkout_date: '2024-01-02',
          returned_date: '2024-01-20',
          is_returned: true
        },
        {
          Book: { id: 1, title: 'Test Book 1', author: 'Author 1' },
          Borrower: { id: 1, name: 'John Doe' },
          checkout_date: '2024-01-05',
          returned_date: null,
          is_returned: false
        }
      ];

      const analytics = await ReportingService.generateAnalytics(mockData);

      expect(analytics).toEqual({
        total_records: 3,
        unique_borrowers: 2,
        unique_books: 2,
        average_borrowing_duration: 17, // Average of 14 and 18 days
        most_borrowed_book: 'Test Book 1',
        most_active_borrower: 'John Doe'
      });
    });

    it('should handle empty data', async () => {
      const analytics = await ReportingService.generateAnalytics([]);

      expect(analytics).toEqual({
        total_records: 0,
        unique_borrowers: 0,
        unique_books: 0,
        average_borrowing_duration: 0,
        most_borrowed_book: 'None',
        most_active_borrower: 'None'
      });
    });
  });

  describe('calculateAverageDuration', () => {
    it('should calculate average duration correctly', () => {
      const mockData = [
        {
          checkout_date: '2024-01-01',
          returned_date: '2024-01-15', // 14 days
          is_returned: true
        },
        {
          checkout_date: '2024-01-02',
          returned_date: '2024-01-20', // 18 days
          is_returned: true
        },
        {
          checkout_date: '2024-01-05',
          returned_date: null,
          is_returned: false // Should be ignored
        }
      ];

      const average = ReportingService.calculateAverageDuration(mockData);
      expect(average).toBe(16); // (14 + 18) / 2 = 16
    });

    it('should return 0 for no returned books', () => {
      const mockData = [
        {
          checkout_date: '2024-01-01',
          returned_date: null,
          is_returned: false
        }
      ];

      const average = ReportingService.calculateAverageDuration(mockData);
      expect(average).toBe(0);
    });
  });

  describe('getMostBorrowedBook', () => {
    it('should identify the most borrowed book', () => {
      const mockData = [
        { Book: { title: 'Book A' } },
        { Book: { title: 'Book B' } },
        { Book: { title: 'Book A' } },
        { Book: { title: 'Book C' } },
        { Book: { title: 'Book A' } }
      ];

      const mostBorrowed = ReportingService.getMostBorrowedBook(mockData);
      expect(mostBorrowed).toBe('Book A');
    });

    it('should return "None" for empty data', () => {
      const mostBorrowed = ReportingService.getMostBorrowedBook([]);
      expect(mostBorrowed).toBe('None');
    });
  });

  describe('getMostActiveBorrower', () => {
    it('should identify the most active borrower', () => {
      const mockData = [
        { Borrower: { name: 'John Doe' } },
        { Borrower: { name: 'Jane Smith' } },
        { Borrower: { name: 'John Doe' } },
        { Borrower: { name: 'Bob Johnson' } },
        { Borrower: { name: 'John Doe' } }
      ];

      const mostActive = ReportingService.getMostActiveBorrower(mockData);
      expect(mostActive).toBe('John Doe');
    });

    it('should return "None" for empty data', () => {
      const mostActive = ReportingService.getMostActiveBorrower([]);
      expect(mostActive).toBe('None');
    });
  });

  describe('getBorrowingReport', () => {
    it('should fetch borrowing report with date range', async () => {
      const mockBorrowingData = [
        {
          id: 1,
          checkout_date: '2024-01-15',
          Book: { id: 1, title: 'Test Book', author: 'Test Author', ISBN: '1234567890' },
          Borrower: { id: 1, name: 'John Doe', email: 'john@example.com' }
        }
      ];

      BorrowingHistory.findAll.mockResolvedValue(mockBorrowingData);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await ReportingService.getBorrowingReport(startDate, endDate);

      expect(BorrowingHistory.findAll).toHaveBeenCalledWith({
        where: {
          checkout_date: {
            [require('sequelize').Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: Book,
            attributes: ['id', 'title', 'author', 'ISBN']
          },
          {
            model: Borrower,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['checkout_date', 'DESC']]
      });

      expect(result).toEqual(mockBorrowingData);
    });

    it('should fetch borrowing report with borrower filter', async () => {
      const mockBorrowingData = [
        {
          id: 1,
          borrower_id: 123,
          checkout_date: '2024-01-15',
          Book: { id: 1, title: 'Test Book', author: 'Test Author', ISBN: '1234567890' },
          Borrower: { id: 123, name: 'John Doe', email: 'john@example.com' }
        }
      ];

      BorrowingHistory.findAll.mockResolvedValue(mockBorrowingData);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const borrowerId = 123;

      const result = await ReportingService.getBorrowingReport(startDate, endDate, borrowerId);

      expect(BorrowingHistory.findAll).toHaveBeenCalledWith({
        where: {
          checkout_date: {
            [require('sequelize').Op.between]: [startDate, endDate]
          },
          borrower_id: borrowerId
        },
        include: [
          {
            model: Book,
            attributes: ['id', 'title', 'author', 'ISBN']
          },
          {
            model: Borrower,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['checkout_date', 'DESC']]
      });

      expect(result).toEqual(mockBorrowingData);
    });
  });

  describe('getOverdueReport', () => {
    it('should fetch overdue report', async () => {
      const mockOverdueData = [
        {
          id: 1,
          return_date: '2024-01-10',
          returned_date: null,
          Book: { id: 1, title: 'Overdue Book', author: 'Test Author', ISBN: '1234567890' },
          Borrower: { id: 1, name: 'John Doe', email: 'john@example.com' }
        }
      ];

      BorrowingHistory.findAll.mockResolvedValue(mockOverdueData);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await ReportingService.getOverdueReport(startDate, endDate);

      expect(BorrowingHistory.findAll).toHaveBeenCalledWith({
        where: {
          return_date: {
            [require('sequelize').Op.between]: [startDate, endDate]
          },
          returned_date: {
            [require('sequelize').Op.or]: [
              { [require('sequelize').Op.gt]: { [require('sequelize').Op.col]: 'return_date' } },
              { [require('sequelize').Op.is]: null }
            ]
          }
        },
        include: [
          {
            model: Book,
            attributes: ['id', 'title', 'author', 'ISBN']
          },
          {
            model: Borrower,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['return_date', 'DESC']]
      });

      expect(result).toEqual(mockOverdueData);
    });
  });

  describe('exportLastMonthOverdue', () => {
    it('should export overdue books from last month in xlsx format', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      
      // Mock the generateReport method
      const generateReportSpy = jest.spyOn(ReportingService, 'generateReport')
        .mockResolvedValue(mockBuffer);

      const result = await ReportingService.exportLastMonthOverdue('xlsx');

      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      expect(generateReportSpy).toHaveBeenCalledWith({
        start_date: lastMonthStart,
        end_date: lastMonthEnd,
        report_type: 'last_month_overdue',
        format: 'xlsx'
      });

      expect(result).toEqual(mockBuffer);

      generateReportSpy.mockRestore();
    });

    it('should export overdue books from last month in csv format', async () => {
      const mockBuffer = Buffer.from('mock csv data');
      
      const generateReportSpy = jest.spyOn(ReportingService, 'generateReport')
        .mockResolvedValue(mockBuffer);

      const result = await ReportingService.exportLastMonthOverdue('csv');

      expect(generateReportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          report_type: 'last_month_overdue',
          format: 'csv'
        })
      );

      expect(result).toEqual(mockBuffer);

      generateReportSpy.mockRestore();
    });
  });

  describe('exportLastMonthBorrowing', () => {
    it('should export borrowing data from last month', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      
      const generateReportSpy = jest.spyOn(ReportingService, 'generateReport')
        .mockResolvedValue(mockBuffer);

      const result = await ReportingService.exportLastMonthBorrowing('xlsx');

      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      expect(generateReportSpy).toHaveBeenCalledWith({
        start_date: lastMonthStart,
        end_date: lastMonthEnd,
        report_type: 'last_month_borrowing',
        format: 'xlsx'
      });

      expect(result).toEqual(mockBuffer);

      generateReportSpy.mockRestore();
    });
  });

  describe('getTopBooks', () => {
    it('should return top books by borrowing count', () => {
      const mockData = [
        { Book: { title: 'Book A', author: 'Author 1' } },
        { Book: { title: 'Book B', author: 'Author 2' } },
        { Book: { title: 'Book A', author: 'Author 1' } },
        { Book: { title: 'Book C', author: 'Author 3' } },
        { Book: { title: 'Book A', author: 'Author 1' } },
        { Book: { title: 'Book B', author: 'Author 2' } }
      ];

      const result = ReportingService.getTopBooks(mockData, 2);

      expect(result).toEqual([
        { book: 'Book A by Author 1', count: 3 },
        { book: 'Book B by Author 2', count: 2 }
      ]);
    });

    it('should handle empty data', () => {
      const result = ReportingService.getTopBooks([], 5);
      expect(result).toEqual([]);
    });
  });

  describe('getTopBorrowers', () => {
    it('should return top borrowers by activity', () => {
      const mockData = [
        { Borrower: { name: 'John Doe' } },
        { Borrower: { name: 'Jane Smith' } },
        { Borrower: { name: 'John Doe' } },
        { Borrower: { name: 'Bob Johnson' } },
        { Borrower: { name: 'John Doe' } },
        { Borrower: { name: 'Jane Smith' } }
      ];

      const result = ReportingService.getTopBorrowers(mockData, 2);

      expect(result).toEqual([
        { borrower: 'John Doe', count: 3 },
        { borrower: 'Jane Smith', count: 2 }
      ]);
    });

    it('should handle empty data', () => {
      const result = ReportingService.getTopBorrowers([], 5);
      expect(result).toEqual([]);
    });
  });

  describe('formatReportData', () => {
    it('should format borrowing report data correctly', () => {
      const mockData = [
        {
          Book: { title: 'Test Book', author: 'Test Author', ISBN: '1234567890' },
          Borrower: { name: 'John Doe' },
          checkout_date: '2024-01-01',
          return_date: '2024-01-15',
          is_returned: true
        }
      ];

      const result = ReportingService.formatReportData(mockData, 'borrowing');

      expect(result).toEqual([
        {
          book_title: 'Test Book',
          author: 'Test Author',
          isbn: '1234567890',
          borrower_name: 'John Doe',
          checkout_date: '2024-01-01',
          return_date: '2024-01-15',
          status: 'Returned'
        }
      ]);
    });

    it('should format overdue report data correctly', () => {
      const mockData = [
        {
          Book: { title: 'Overdue Book', author: 'Test Author', ISBN: '1234567890' },
          Borrower: { name: 'John Doe' },
          checkout_date: '2024-01-01',
          return_date: '2024-01-10' // Past due date
        }
      ];

      const result = ReportingService.formatReportData(mockData, 'overdue');

      expect(result[0]).toEqual({
        book_title: 'Overdue Book',
        author: 'Test Author',
        isbn: '1234567890',
        borrower_name: 'John Doe',
        checkout_date: '2024-01-01',
        due_date: '2024-01-10',
        days_overdue: expect.any(Number)
      });
    });

    it('should handle non-array data', () => {
      const result = ReportingService.formatReportData(null, 'borrowing');
      expect(result).toEqual([]);
    });
  });
});
