import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Incoming Webhook Payload:", JSON.stringify(payload, null, 2))
    
    const { record } = payload
    if (!record) {
      console.error("No record found in payload")
      return new Response(JSON.stringify({ error: "No record found" }), { status: 400 })
    }

    const { email, language, favorite_element } = record
    console.log(`Attempting to send email to: ${email} (Lang: ${language})`)

    const subject = language === 'de' 
      ? "Willkommen bei Elementum Proxies!" 
      : "Welcome to Elementum Proxies!"

    const html = language === 'de'
      ? `<h1>Willkommen an der Frontline!</h1><p>Vielen Dank für dein Interesse.</p>`
      : `<h1>Welcome to the Frontline!</h1><p>Thank you for your interest.</p>`

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in Secrets!")
      throw new Error("Missing RESEND_API_KEY")
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Elementum Proxies <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: html,
      }),
    })

    const resData = await res.json()
    console.log("Resend API Response:", JSON.stringify(resData, null, 2))

    if (!res.ok) {
      console.error("Resend API returned an error:", resData)
      throw new Error(resData.message || "Resend API error")
    }

    return new Response(JSON.stringify(resData), { status: 200 })
  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
