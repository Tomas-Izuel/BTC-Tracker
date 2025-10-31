console.log("Testing basic server...");

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello from Bun!");
  },
});

console.log(`Server running on ${server.url}`);
