import { getAuth } from "firebase/auth";

const API_BASE_URL = "https://us-central1-moises-work-app.cloudfunctions.net/api/v1";

export interface AnalyticsSummary {
  total: number;
  articles: number;
  tutorials: number;
  human: number;
  bot: number;
}

export interface TopContent {
  slug: string;
  title: string;
  count: number;
  type: string;
}

export interface TimelineData {
  date: string;
  count: number;
}

export interface ReferrerData {
  source: string;
  count: number;
}

export interface AnalyticsResponse {
  period: string;
  summary: AnalyticsSummary;
  topContent: TopContent[];
  timeline: TimelineData[];
  referrers: ReferrerData[];
}

class AnalyticsService {
  async getAnalytics(portfolioId: string, period?: string): Promise<AnalyticsResponse> {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error("User not authenticated");
      }

      const url = new URL(`${API_BASE_URL}/analytics/${portfolioId}`);
      if (period) {
        url.searchParams.append('period', period);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("AnalyticsService error:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
