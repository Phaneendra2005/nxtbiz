import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Using:", dns.getServers());

dns.resolve4("google.com", (err, addresses) => {
  console.log(err || addresses);
});