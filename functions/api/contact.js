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

    // ---------------------------------------------------------------
    // TODO before this goes live: this function currently validates
    // and accepts the submission, but does NOT send an email yet.
    // You'll need to wire in an actual email-sending step here, for
    // example using Resend (resend.com) or a similar transactional
    // email API with a free tier. That involves:
    //   1. Creating an account with the email provider
    //   2. Getting an API key
    //   3. Adding that key as an encrypted environment variable in
    //      the Cloudflare Pages project settings (never commit it
    //      to this file or to GitHub)
    //   4. Calling their API here with fetch(), passing the form
    //      data through to reception@dsicontrols.ca
    //
    // Worth researching current options directly when you set this
    // up, since available free-tier email services on Cloudflare
    // Pages change over time.
    // ---------------------------------------------------------------

    console.log("New contact form submission:", {
      name, email, phone, business, interest, message
    });

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
