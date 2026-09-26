export interface MetricPoint {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: MetricPoint[] = [];

  private constructor() {}

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  public recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: new Date()
    });
  }

  public getMetrics(filterName?: string): MetricPoint[] {
    return filterName
      ? this.metrics.filter((m) => m.name === filterName)
      : [...this.metrics];
  }
}
