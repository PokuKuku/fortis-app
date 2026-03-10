export type InsightChartTab = 'progress' | 'volume' | 'frequency';

export interface InsightChartPoint {
  date: string;
  value: number;
}

export interface InsightBarPoint {
  label: string;
  value: number;
}

export interface InsightChartSeries {
  progress: InsightChartPoint[];
  volume: InsightChartPoint[];
  frequency: InsightChartPoint[];
  units: Partial<Record<InsightChartTab, string>>;
  highlight?: {
    range?: { start: string; end: string };
    points?: string[];
  };
  breakdown?: InsightBarPoint[];
  breakdownUnit?: string;
}
