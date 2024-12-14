require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initSocketIO } = require("./services/socketService");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB();

// Tạo server HTTP
const server = http.createServer(app);

// Tích hợp Socket.IO
initSocketIO(server);

// Lắng nghe server
server.listen(PORT, () =>
{
    console.log(`Server running in ${ process.env.NODE_ENV } mode on port ${ PORT }`);
});

// Xử lý lỗi không mong muốn
process.on("unhandledRejection", (err) =>
{
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.error(err);
    server.close(() => process.exit(1));
});
