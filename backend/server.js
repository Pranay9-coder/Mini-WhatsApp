import http from "http";
import dotenv from "dotenv";
import app, { startApp } from "./app.js";
import { initChatSocket } from "./sockets/chatSocket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await startApp();
  const server = http.createServer(app);
  initChatSocket(server);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
