import { Resolver } from "dns";
import { promisify } from "util";
import type { DNSResult, DNSPropagationResult } from "../types/project";

export class DNSService {
  async checkDNS(domain: string): Promise<DNSResult> {
    const resolver = new Resolver();
    const result: DNSResult = {
      a: [],
      aaaa: [],
      cname: [],
      mx: [],
      ns: [],
      txt: [],
    };

    const resolve4 = promisify(resolver.resolve4.bind(resolver));
    const resolve6 = promisify(resolver.resolve6.bind(resolver));
    const resolveCname = promisify(resolver.resolveCname.bind(resolver));
    const resolveMx = promisify(resolver.resolveMx.bind(resolver));
    const resolveNs = promisify(resolver.resolveNs.bind(resolver));
    const resolveTxt = promisify(resolver.resolveTxt.bind(resolver));

    try {
      result.a = await resolve4(domain);
    } catch {}
    try {
      result.aaaa = await resolve6(domain);
    } catch {}
    try {
      result.cname = await resolveCname(domain);
    } catch {}
    try {
      result.mx = await resolveMx(domain);
    } catch {}
    try {
      result.ns = await resolveNs(domain);
    } catch {}
    try {
      result.txt = await resolveTxt(domain);
    } catch {}

    return result;
  }

  async checkPropagation(domain: string): Promise<DNSPropagationResult> {
    const dnsServers = [
      { name: "Google", ip: "8.8.8.8" },
      { name: "Cloudflare", ip: "1.1.1.1" },
      { name: "OpenDNS", ip: "208.67.222.222" },
      { name: "Quad9", ip: "9.9.9.9" },
    ];

    const results = await Promise.all(
      dnsServers.map(async (server) => {
        const resolver = new Resolver();
        resolver.setServers([server.ip]);
        const resolve4 = promisify(resolver.resolve4.bind(resolver));
        try {
          const records = await resolve4(domain);
          return { server: server.name, records, status: "ok" as const };
        } catch {
          return { server: server.name, records: [], status: "error" as const };
        }
      }),
    );

    const allIPs = results.map((r) => r.records.sort().join(","));
    const consistent = new Set(allIPs.filter(Boolean)).size <= 1;

    return { results, consistent };
  }
}
