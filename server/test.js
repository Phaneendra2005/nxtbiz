import dns from "node:dns/promises";

try {
  const records = await dns.resolveSrv(
    "_mongodb._tcp.cluster0.wfsywba.mongodb.net"
  );
  console.log(records);
} catch (err) {
  console.error(err);
}