import axios from "axios";

const BASE = "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL: BASE });

export const fetchTransactions = (params = {}) =>
  api.get("/transactions/", { params }).then((r) => r.data);

export const createTransaction = (data) =>
  api.post("/transactions/", data).then((r) => r.data);

export const fetchAlerts = (params = {}) =>
  api.get("/alerts/", { params }).then((r) => r.data);

export const fetchAlertCounts = () =>
  api.get("/alerts/count").then((r) => r.data);

export const fetchSummary = () =>
  api.get("/stats/summary").then((r) => r.data);

export const fetchRiskDistribution = () =>
  api.get("/stats/risk-distribution").then((r) => r.data);

export const fetchMerchantBreakdown = () =>
  api.get("/stats/merchant-breakdown").then((r) => r.data);

export const fetchTimeline = () =>
  api.get("/stats/timeline").then((r) => r.data);

export const seedTransactions = (params = {}) =>
  api.post("/generator/seed", null, { params }).then((r) => r.data);
