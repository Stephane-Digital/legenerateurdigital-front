
export type EmailAnalyticsDashboardResponse = {
  module: string;
  stats: {
    contacts_captured: number;
    campaigns_started: number;
    sales_generated: number;
  };
  events_tracked: number;
};

export type AnalyticsMiniBarItem = {
  label: string;
  value: number;
  max: number;
};
