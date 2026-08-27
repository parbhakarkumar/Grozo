import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";

describe("Socket.IO Events", () => {
  let io, serverSocket, clientSocket;
  const port = 4567;

  beforeAll(async () => {
    const httpServer = createServer();
    io = new Server(httpServer);
    
    await new Promise((resolve) => {
      httpServer.listen(port, () => {
        clientSocket = Client(`http://localhost:${port}`);
        io.on("connection", (socket) => {
          serverSocket = socket;

          socket.on("join_admin", () => {
            socket.join("admin_room");
          });

          socket.on("join_user", (userId) => {
            socket.join(`user_${userId}`);
          });
        });
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should allow client to join admin room", async () => {
    clientSocket.emit("join_admin");
    await new Promise((r) => setTimeout(r, 50));
    expect(serverSocket.rooms.has("admin_room")).toBe(true);
  });

  it("should allow client to join user room", async () => {
    clientSocket.emit("join_user", "12345");
    await new Promise((r) => setTimeout(r, 50));
    expect(serverSocket.rooms.has("user_12345")).toBe(true);
  });

  it("should receive new_order event", async () => {
    const promise = new Promise((resolve) => {
      clientSocket.on("new_order", (data) => {
        expect(data.message).toBe("New order received");
        expect(data.order.amount).toBe(500);
        resolve();
      });
    });

    io.to("admin_room").emit("new_order", {
      order: { amount: 500 },
      message: "New order received",
    });

    await promise;
  });

  it("should receive order_status_updated event", async () => {
    const promise = new Promise((resolve) => {
      clientSocket.on("order_status_updated", (data) => {
        expect(data.status).toBe("Shipped");
        expect(data.orderId).toBe("ord_123");
        resolve();
      });
    });

    io.to("admin_room").emit("order_status_updated", {
      orderId: "ord_123",
      status: "Shipped",
    });

    await promise;
  });
});
