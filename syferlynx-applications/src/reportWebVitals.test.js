import reportWebVitals from './reportWebVitals';

// Mock the web-vitals module
const mockGetCLS = jest.fn();
const mockGetFID = jest.fn();
const mockGetFCP = jest.fn();
const mockGetLCP = jest.fn();
const mockGetTTFB = jest.fn();

jest.mock('web-vitals', () => ({
  getCLS: mockGetCLS,
  getFID: mockGetFID,
  getFCP: mockGetFCP,
  getLCP: mockGetLCP,
  getTTFB: mockGetTTFB,
}));

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unit Tests', () => {
    test('is a function', () => {
      expect(typeof reportWebVitals).toBe('function');
    });

    test('does nothing when no callback is provided', async () => {
      await reportWebVitals();
      
      // Should not call any web vitals functions
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    test('does nothing when null is provided', async () => {
      await reportWebVitals(null);
      
      // Should not call any web vitals functions
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    test('does nothing when undefined is provided', async () => {
      await reportWebVitals(undefined);
      
      // Should not call any web vitals functions
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    test('does nothing when non-function is provided', async () => {
      await reportWebVitals('not a function');
      await reportWebVitals(123);
      await reportWebVitals({});
      await reportWebVitals([]);
      await reportWebVitals(true);
      
      // Should not call any web vitals functions
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });
  });

  describe('Function Callback Tests', () => {
    test('calls all web vitals functions when valid callback is provided', async () => {
      const mockCallback = jest.fn();
      
      await reportWebVitals(mockCallback);
      
      // Should call all web vitals functions with the callback
      expect(mockGetCLS).toHaveBeenCalledWith(mockCallback);
      expect(mockGetFID).toHaveBeenCalledWith(mockCallback);
      expect(mockGetFCP).toHaveBeenCalledWith(mockCallback);
      expect(mockGetLCP).toHaveBeenCalledWith(mockCallback);
      expect(mockGetTTFB).toHaveBeenCalledWith(mockCallback);
    });

    test('calls each web vitals function exactly once', async () => {
      const mockCallback = jest.fn();
      
      await reportWebVitals(mockCallback);
      
      expect(mockGetCLS).toHaveBeenCalledTimes(1);
      expect(mockGetFID).toHaveBeenCalledTimes(1);
      expect(mockGetFCP).toHaveBeenCalledTimes(1);
      expect(mockGetLCP).toHaveBeenCalledTimes(1);
      expect(mockGetTTFB).toHaveBeenCalledTimes(1);
    });

    test('works with arrow function callback', async () => {
      const mockCallback = jest.fn();
      const arrowCallback = (metric) => mockCallback(metric);
      
      await reportWebVitals(arrowCallback);
      
      expect(mockGetCLS).toHaveBeenCalledWith(arrowCallback);
      expect(mockGetFID).toHaveBeenCalledWith(arrowCallback);
      expect(mockGetFCP).toHaveBeenCalledWith(arrowCallback);
      expect(mockGetLCP).toHaveBeenCalledWith(arrowCallback);
      expect(mockGetTTFB).toHaveBeenCalledWith(arrowCallback);
    });

    test('works with named function callback', async () => {
      function namedCallback(metric) {
        // Mock implementation
      }
      
      await reportWebVitals(namedCallback);
      
      expect(mockGetCLS).toHaveBeenCalledWith(namedCallback);
      expect(mockGetFID).toHaveBeenCalledWith(namedCallback);
      expect(mockGetFCP).toHaveBeenCalledWith(namedCallback);
      expect(mockGetLCP).toHaveBeenCalledWith(namedCallback);
      expect(mockGetTTFB).toHaveBeenCalledWith(namedCallback);
    });

    test('works with console.log as callback', async () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      
      await reportWebVitals(console.log);
      
      expect(mockGetCLS).toHaveBeenCalledWith(console.log);
      expect(mockGetFID).toHaveBeenCalledWith(console.log);
      expect(mockGetFCP).toHaveBeenCalledWith(console.log);
      expect(mockGetLCP).toHaveBeenCalledWith(console.log);
      expect(mockGetTTFB).toHaveBeenCalledWith(console.log);
      
      console.log = originalConsoleLog;
    });
  });

  describe('Integration Tests', () => {
    test('complete web vitals reporting flow', async () => {
      const metrics = [];
      const callback = (metric) => metrics.push(metric);
      
      // Mock the web vitals functions to call the callback
      mockGetCLS.mockImplementation((cb) => cb({ name: 'CLS', value: 0.1 }));
      mockGetFID.mockImplementation((cb) => cb({ name: 'FID', value: 50 }));
      mockGetFCP.mockImplementation((cb) => cb({ name: 'FCP', value: 1500 }));
      mockGetLCP.mockImplementation((cb) => cb({ name: 'LCP', value: 2000 }));
      mockGetTTFB.mockImplementation((cb) => cb({ name: 'TTFB', value: 200 }));
      
      await reportWebVitals(callback);
      
      // Should have collected all metrics
      expect(metrics).toHaveLength(5);
      expect(metrics.map(m => m.name)).toEqual(['CLS', 'FID', 'FCP', 'LCP', 'TTFB']);
    });

    test('handles multiple calls correctly', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      await reportWebVitals(callback1);
      await reportWebVitals(callback2);
      
      // Each call should trigger all web vitals functions
      expect(mockGetCLS).toHaveBeenCalledTimes(2);
      expect(mockGetFID).toHaveBeenCalledTimes(2);
      expect(mockGetFCP).toHaveBeenCalledTimes(2);
      expect(mockGetLCP).toHaveBeenCalledTimes(2);
      expect(mockGetTTFB).toHaveBeenCalledTimes(2);
      
      expect(mockGetCLS).toHaveBeenCalledWith(callback1);
      expect(mockGetCLS).toHaveBeenCalledWith(callback2);
    });
  });

  describe('Error Handling', () => {
    test('handles web-vitals import failure gracefully', async () => {
      // Mock import failure
      jest.doMock('web-vitals', () => {
        throw new Error('Module not found');
      });
      
      const callback = jest.fn();
      
      // Should not throw error
      expect(async () => {
        await reportWebVitals(callback);
      }).not.toThrow();
    });

    test('handles individual web vitals function errors', async () => {
      const callback = jest.fn();
      
      // Mock one function to throw an error
      mockGetCLS.mockImplementation(() => {
        throw new Error('CLS error');
      });
      
      // Should not prevent other functions from being called
      await reportWebVitals(callback);
      
      expect(mockGetFID).toHaveBeenCalledWith(callback);
      expect(mockGetFCP).toHaveBeenCalledWith(callback);
      expect(mockGetLCP).toHaveBeenCalledWith(callback);
      expect(mockGetTTFB).toHaveBeenCalledWith(callback);
    });

    test('handles callback function errors', async () => {
      const errorCallback = () => {
        throw new Error('Callback error');
      };
      
      // Mock web vitals to call the callback
      mockGetCLS.mockImplementation((cb) => cb({ name: 'CLS', value: 0.1 }));
      
      // Should not throw error even if callback throws
      expect(async () => {
        await reportWebVitals(errorCallback);
      }).not.toThrow();
    });
  });

  describe('Type Checking', () => {
    test('correctly identifies function types', async () => {
      const regularFunction = function() {};
      const arrowFunction = () => {};
      const asyncFunction = async () => {};
      const generatorFunction = function*() {};
      
      await reportWebVitals(regularFunction);
      await reportWebVitals(arrowFunction);
      await reportWebVitals(asyncFunction);
      await reportWebVitals(generatorFunction);
      
      // All should be treated as valid functions
      expect(mockGetCLS).toHaveBeenCalledTimes(4);
    });

    test('correctly rejects non-function types', async () => {
      const nonFunctions = [
        'string',
        123,
        true,
        false,
        {},
        [],
        new Date(),
        /regex/,
        Symbol('test')
      ];
      
      for (const nonFunction of nonFunctions) {
        await reportWebVitals(nonFunction);
      }
      
      // Should not call web vitals functions for any non-function
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    test('executes efficiently with valid callback', async () => {
      const callback = jest.fn();
      const startTime = performance.now();
      
      await reportWebVitals(callback);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should execute quickly (less than 10ms in test environment)
      expect(executionTime).toBeLessThan(10);
    });

    test('executes efficiently with invalid callback', async () => {
      const startTime = performance.now();
      
      await reportWebVitals('invalid');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should execute very quickly when doing nothing
      expect(executionTime).toBeLessThan(5);
    });
  });

  describe('Real-world Usage Scenarios', () => {
    test('works with analytics tracking', async () => {
      const analyticsData = [];
      const analyticsCallback = (metric) => {
        analyticsData.push({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now()
        });
      };
      
      // Mock web vitals to simulate real metrics
      mockGetCLS.mockImplementation((cb) => cb({ name: 'CLS', value: 0.05 }));
      mockGetFID.mockImplementation((cb) => cb({ name: 'FID', value: 30 }));
      mockGetFCP.mockImplementation((cb) => cb({ name: 'FCP', value: 1200 }));
      mockGetLCP.mockImplementation((cb) => cb({ name: 'LCP', value: 1800 }));
      mockGetTTFB.mockImplementation((cb) => cb({ name: 'TTFB', value: 150 }));
      
      await reportWebVitals(analyticsCallback);
      
      expect(analyticsData).toHaveLength(5);
      expect(analyticsData.every(item => item.timestamp)).toBe(true);
    });

    test('works with console logging', async () => {
      const originalConsoleLog = console.log;
      const loggedMessages = [];
      console.log = jest.fn((message) => loggedMessages.push(message));
      
      // Mock web vitals to call console.log
      mockGetCLS.mockImplementation((cb) => cb({ name: 'CLS', value: 0.1 }));
      
      await reportWebVitals(console.log);
      
      expect(console.log).toHaveBeenCalledWith({ name: 'CLS', value: 0.1 });
      
      console.log = originalConsoleLog;
    });

    test('works with custom metric processing', async () => {
      const processedMetrics = new Map();
      const customProcessor = (metric) => {
        processedMetrics.set(metric.name, {
          value: metric.value,
          rating: metric.value < 100 ? 'good' : 'needs-improvement',
          processed: true
        });
      };
      
      // Mock web vitals
      mockGetFID.mockImplementation((cb) => cb({ name: 'FID', value: 75 }));
      mockGetLCP.mockImplementation((cb) => cb({ name: 'LCP', value: 2500 }));
      
      await reportWebVitals(customProcessor);
      
      expect(processedMetrics.get('FID')).toEqual({
        value: 75,
        rating: 'good',
        processed: true
      });
      expect(processedMetrics.get('LCP')).toEqual({
        value: 2500,
        rating: 'needs-improvement',
        processed: true
      });
    });
  });
}); 