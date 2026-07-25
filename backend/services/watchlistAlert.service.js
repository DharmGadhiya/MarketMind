import Watchlist from "../models/watchlist.js";
import Stock from "../models/stock.js";
import Notification from "../models/notification.js";
import { sendEmail } from "../utils/emailService.js";

/**
 * Check all user watchlists against the latest stock prices.
 * If a stock's percentage change meets or exceeds the user's alert threshold
 * and the user has not been alerted for this symbol in the last 24 hours,
 * an alert email is sent and the lastAlertedAt timestamp is updated.
 * 
 * @returns {Promise<void>}
 */
export async function checkWatchlistAlerts() {
  try {
    // 1. Fetch all watchlist entries, populating the user details
    const watchlistEntries = await Watchlist.find()
      .populate("userId", "email userName")
      .lean();

    if (watchlistEntries.length === 0) return;

    // 2. Fetch all latest stock data in a single query
    const uniqueSymbols = [...new Set(watchlistEntries.map(e => e.symbol))];
    const latestStocks = await Stock.find({ symbol: { $in: uniqueSymbols } }).lean();

    // Map stocks by symbol for O(1) lookup
    const stockMap = new Map(latestStocks.map(s => [s.symbol, s]));

    // 3. Process each watchlist entry
    for (const entry of watchlistEntries) {
      const stock = stockMap.get(entry.symbol);
      if (!stock) continue;

      const currentChangePercent = stock.changePercent || 0;
      const absChangePercent = Math.abs(currentChangePercent);

      // Check if threshold is met (alertThreshold > 0 means alert is enabled)
      if (entry.alertThreshold > 0 && absChangePercent >= entry.alertThreshold) {
        // Debounce logic: check if already alerted in the last 24 hours (86,400,000 ms)
        const debouncePeriod = 24 * 60 * 60 * 1000;
        const now = new Date();
        const lastAlerted = entry.lastAlertedAt ? new Date(entry.lastAlertedAt) : null;

        if (!lastAlerted || (now.getTime() - lastAlerted.getTime() >= debouncePeriod)) {
          const userEmail = entry.userId?.email;
          const userName = entry.userId?.userName || "Investor";

          if (userEmail) {
            console.log(`[Watchlist Alert] Triggering alert for ${entry.symbol} to ${userEmail}`);
            
            const cleanSymbol = entry.symbol.replace(".NS", "");
            const formattedCmp = stock.cmp.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            });
            const formattedChange = currentChangePercent.toFixed(2);
            const isPositive = currentChangePercent >= 0;

            const htmlContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; padding: 40px 20px; color: #0a0e14;">
                <div style="max-width: 460px; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
                  
                  <div style="margin-bottom: 32px; text-align: center;">
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0a8c5b;">MarketMind</span>
                  </div>

                  <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0a0e14; text-align: center;">Price Alert Triggered 🔔</h2>
                  
                  <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0; text-align: center;">
                    Hello ${userName}, your watch threshold of <strong>${entry.alertThreshold}%</strong> for this stock has been crossed:
                  </p>

                  <div style="background-color: #f4f6f8; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; font-weight: 700; display: block; margin-bottom: 8px;">
                      ${stock.name || cleanSymbol} (${cleanSymbol})
                    </span>
                    <div style="font-size: 32px; font-weight: 800; color: #0a0e14; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-bottom: 8px;">
                      ₹${formattedCmp}
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: ${isPositive ? "#0a8c5b" : "#b91c1c"}; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                      ${isPositive ? "+" : ""}${formattedChange}%
                    </div>
                  </div>

                  <p style="font-size: 12px; color: #6b7280; margin: 0 0 32px 0; text-align: center; line-height: 1.5;">
                    This alert was triggered because the absolute percentage change of the stock (${absChangePercent.toFixed(2)}%) is greater than or equal to your set threshold of ${entry.alertThreshold}%.
                  </p>

                  <p style="font-size: 11px; color: #9ca3af; margin: 0; text-align: center; line-height: 1.5;">
                    To manage your price alerts, log in to your MarketMind News Terminal.
                  </p>

                  <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.06); margin: 24px 0;" />

                  <div style="text-align: center;">
                    <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                      &copy; 2026 MarketMind. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            `;

            try {
              await sendEmail({
                to: userEmail,
                subject: `MarketMind Alert: ${cleanSymbol} crossed ₹${formattedCmp} (${isPositive ? "+" : ""}${formattedChange}%)`,
                htmlContent,
              });

              // Create notification in database for local app display
              const alertMsg = `${cleanSymbol} crossed alert threshold of ${entry.alertThreshold}% at ₹${formattedCmp} (${isPositive ? "+" : ""}${formattedChange}%)`;
              await Notification.create({
                userId: entry.userId._id,
                symbol: cleanSymbol,
                message: alertMsg,
                price: stock.cmp,
                changePercent: currentChangePercent,
              });

              // Update lastAlertedAt to prevent spamming
              await Watchlist.updateOne(
                { _id: entry._id },
                { $set: { lastAlertedAt: now } }
              );
            } catch (emailErr) {
              console.error(`[Watchlist Alert Error] Failed to process alert for ${userEmail}:`, emailErr);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[Watchlist Alert Service Error]:", error);
  }
}
