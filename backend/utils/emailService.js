/**
 * Generic utility to send emails using the Brevo transactional email API.
 * 
 * @param {object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @param {string} params.htmlContent - Email body HTML string
 * @returns {Promise<object>} The JSON response from Brevo API
 */
export async function sendEmail({ to, subject, htmlContent }) {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL) {
    throw new Error("BREVO_API_KEY or EMAIL environment variable is missing.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY.trim(),
    },
    body: JSON.stringify({
      sender: {
        name: "MarketMind",
        email: process.env.EMAIL,
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}
