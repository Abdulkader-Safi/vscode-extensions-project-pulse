import type { LighthouseResult } from "../types/project";

export class LighthouseService {
  async runLighthouse(
    url: string,
    apiKey: string,
  ): Promise<LighthouseResult> {
    if (!apiKey) {
      throw new Error(
        "Lighthouse API key not configured. Set projectPulse.lighthouseApiKey in settings.",
      );
    }

    const apiUrl =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(url)}` +
      `&key=${apiKey}` +
      `&category=performance` +
      `&category=accessibility` +
      `&category=best-practices` +
      `&category=seo` +
      `&strategy=desktop`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `PageSpeed API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const categories = data.lighthouseResult?.categories;
    const audits = data.lighthouseResult?.audits;

    return {
      scores: {
        performance: Math.round(
          (categories?.performance?.score || 0) * 100,
        ),
        accessibility: Math.round(
          (categories?.accessibility?.score || 0) * 100,
        ),
        bestPractices: Math.round(
          (categories?.["best-practices"]?.score || 0) * 100,
        ),
        seo: Math.round((categories?.seo?.score || 0) * 100),
      },
      metrics: {
        fcp: audits?.["first-contentful-paint"]?.numericValue ?? null,
        lcp: audits?.["largest-contentful-paint"]?.numericValue ?? null,
        tbt: audits?.["total-blocking-time"]?.numericValue ?? null,
        cls: audits?.["cumulative-layout-shift"]?.numericValue ?? null,
        si: audits?.["speed-index"]?.numericValue ?? null,
      },
      failingAudits: Object.values((audits || {}) as Record<string, any>)
        .filter((a: any) => a.score !== null && a.score < 0.5)
        .map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          score: a.score,
        })),
      fetchTime: data.lighthouseResult?.fetchTime || new Date().toISOString(),
    };
  }
}
