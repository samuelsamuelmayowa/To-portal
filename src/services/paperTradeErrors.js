const SAFE_MESSAGES = {
  session: "Your session has expired. Refresh the page and sign in again before placing an order.",
  funds: "There is not enough buying power to complete this order.",
  quantity: "Enter a valid whole-share quantity greater than zero.",
  quote: "A current market price is unavailable. Reload the ticker and try again.",
  symbol: "This stock symbol is unavailable for paper trading.",
  account: "Your practice account is temporarily unavailable. Refresh the account and try again.",
  generic: "The virtual order could not be completed. Review the order and try again.",
};

export async function getPaperTradeErrorMessage(error) {
  const status = error?.context?.status;
  let responseBody;
  if (typeof error?.context?.clone === "function") {
    try {
      responseBody = await error.context.clone().json();
    } catch {
      responseBody = undefined;
    }
  }

  const detail = [responseBody?.error, responseBody?.message, error?.message]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (status === 401 || status === 403 || /unauthori[sz]ed|invalid jwt|session (?:expired|missing)/.test(detail)) return SAFE_MESSAGES.session;
  if (/insufficient|not enough (?:cash|funds)|buying power/.test(detail)) return SAFE_MESSAGES.funds;
  if (/invalid (?:order )?quantity|quantity must|whole[- ]share/.test(detail)) return SAFE_MESSAGES.quantity;
  if (/quote|market price|fill price/.test(detail)) return SAFE_MESSAGES.quote;
  if (/symbol|ticker|asset not found/.test(detail)) return SAFE_MESSAGES.symbol;
  if (/paper account|simulator account|account not found/.test(detail)) return SAFE_MESSAGES.account;
  return SAFE_MESSAGES.generic;
}
