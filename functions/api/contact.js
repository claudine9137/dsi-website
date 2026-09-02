// functions/api/contact.js
// Cloudflare Pages Function handling POST requests from contact.html's form.
// File path matters here: Pages Functions route based on folder structure,
// so this file living at functions/api/contact.js is what makes POST /api/contact work.

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const { name, email, phone, business, interest, message } = data;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sends the submission to DSI's inbox via Resend (resend.com).
    // RESEND_API_KEY is set as an encrypted environment variable in the
    // Cloudflare Pages project settings, never hardcoded here.
    const apiKey = context.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured in Cloudflare Pages settings.");
      return new Response(
        JSON.stringify({ error: "Email service is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const escapeHtml = (str = "") =>
      String(str).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[c]));

    const emailHtml = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone) || "Not provided"}</p>
      <p><strong>Business:</strong> ${escapeHtml(business) || "Not provided"}</p>
      <p><strong>Interested in:</strong> ${escapeHtml(interest) || "Not specified"}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DSI Website <no-reply@dsicontrols.ca>",
        to: "reception@dsicontrols.ca",
        reply_to: email,
        subject: `New website inquiry from ${name}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Resend API error:", resendResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to send message. Please try again or call us directly." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error processing submission." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
