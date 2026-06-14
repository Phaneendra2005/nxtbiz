import dns from "node:dns/promises";

try {
  console.log(await dns.resolve4("google.com"));
} catch (e) {
  console.error("A record failed:", e);
}

try {
  console.log(
    await dns.resolveSrv("_mongodb._tcp.cluster0.wfsywba.mongodb.net")
  );
} catch (e) {
  console.error("SRV failed:", e);
}