// Vitest global setup — sets test env variables before any test runs
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/edusync_test";
process.env.JWT_SECRET = "test-secret-key-must-be-at-least-32-characters-long";
process.env.JWT_EXPIRES_IN = "1h";
process.env.UPLOAD_DIR = "uploads";
process.env.MAX_FILE_SIZE = "5242880";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
process.env.RATE_LIMIT_MAX = "100";
process.env.AUTH_RATE_LIMIT_MAX = "10";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.LOG_LEVEL = "error"; // suppress logs during tests
process.env.PORT = "5001";
