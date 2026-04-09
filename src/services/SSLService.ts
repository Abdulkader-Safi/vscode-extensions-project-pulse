import * as tls from "tls";
import type { SSLResult } from "../types/project";

export class SSLService {
  checkSSL(hostname: string): Promise<SSLResult> {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        443,
        hostname,
        { servername: hostname },
        () => {
          const cert = socket.getPeerCertificate(true);

          resolve({
            issuer: cert.issuer?.O || "Unknown",
            validFrom: cert.valid_from || "",
            validTo: cert.valid_to || "",
            daysRemaining: cert.valid_to
              ? Math.floor(
                  (new Date(cert.valid_to).getTime() - Date.now()) / 86400000,
                )
              : 0,
            subject: cert.subject?.CN || "",
            altNames: cert.subjectaltname
              ? cert.subjectaltname
                  .split(", ")
                  .map((s: string) => s.replace("DNS:", ""))
              : [],
            serialNumber: cert.serialNumber || "",
            fingerprint256: cert.fingerprint256 || "",
            protocol: socket.getProtocol() || "unknown",
            chain: cert.issuerCertificate
              ? {
                  issuer: cert.issuerCertificate.issuer?.O || "Unknown",
                  validTo: cert.issuerCertificate.valid_to || "",
                }
              : null,
          });
          socket.end();
        },
      );

      socket.on("error", (err) => {
        reject(new Error(`SSL check failed for ${hostname}: ${err.message}`));
      });

      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error(`SSL check timed out for ${hostname}`));
      });
    });
  }
}
