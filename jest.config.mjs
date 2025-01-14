/** @type {import('jest').Config} */
const config = {
  clearMocks: true,                  // Tự động reset mock trước mỗi test
  collectCoverage: true,             // Thu thập thông tin coverage
  coverageDirectory: "coverage",     // Thư mục xuất file coverage
  coverageProvider: "v8",            // Công cụ đo coverage (v8 nhanh và nhẹ)
  testEnvironment: "node",           // Môi trường chạy test (Node.js)
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)", "**/?(*.)+(spec|test).mjs"],
  verbose: true,                     // Hiển thị chi tiết test trong console
  transform: {},                     // Không sử dụng Babel hoặc transform
};

export default config;
