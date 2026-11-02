import { apiHandler } from "@/lib/api/errors";
import { getPortfolio } from "@/lib/services/portfolio";
export const GET = () => apiHandler(getPortfolio);
