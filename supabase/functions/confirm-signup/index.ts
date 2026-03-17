import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SENDER_EMAIL = "deine-gmail-adresse@gmail.com" // USER: Deine verifizierte Brevo-Mail

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record } = payload
    
    if (!record) return new Response(JSON.stringify({ error: "No record" }), { status: 400 })

    const { email, language, favorite_element } = record
    
    // Design System Tokens
    const colors = {
      fire: '#ff453a',
      earth: '#32d74b',
      air: '#64d2ff',
      water: '#0a84ff',
      bg: '#0a0b10',
      card: '#14161e',
      text: '#f2f2f7',
      muted: '#8e8e93'
    }

    const accentColor = colors[favorite_element?.toLowerCase()] || '#5e5ce6'
    
    // Element Mapping
    const elementTranslations = {
      de: { fire: 'Feuer', earth: 'Erde', air: 'Luft', water: 'Wasser' },
      en: { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' }
    }
    const elementDisplay = elementTranslations[language]?.[favorite_element?.toLowerCase()] || favorite_element

    const subject = language === 'de' 
      ? "Willkommen in der Vorhut | Quatralor" 
      : "Welcome to the Vanguard | Quatralor"

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700&family=Inter&display=swap');
        body { background-color: ${colors.bg}; margin: 0; padding: 20px; font-family: 'Inter', sans-serif; color: ${colors.text}; }
        .wrapper { max-width: 600px; margin: 0 auto; background: ${colors.card}; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; }
        .header { padding: 40px 20px; text-align: center; border-bottom: 2px solid ${accentColor}; }
        .content { padding: 40px; color: ${colors.text}; }
        .footer { padding: 20px; text-align: center; color: ${colors.muted}; font-size: 12px; }
        h1, h2, h3, p, span { color: ${colors.text}; }
        h1 { font-family: 'Outfit', sans-serif; font-size: 28px; margin: 0; text-transform: uppercase; }
        .accent { color: ${accentColor}; }
        p { line-height: 1.6; font-size: 16px; margin: 20px 0; }
        .badge { display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid ${accentColor}; border-radius: 8px; font-weight: bold; color: ${accentColor}; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>QUATRA<span class="accent">LOR</span></h1>
        </div>
        <div class="content">
          ${language === 'de' ? `
            <h1>Willkommen in der <span class="accent">Vorhut</span>.</h1>
            <p>Die Konvergenz hat begonnen. Wir haben dich als einen der ersten 100 <strong>Frontline-Tester</strong> vorgemerkt.</p>
            <p>Deine Verbindung zum Element <span class="badge">${elementDisplay.toUpperCase()}</span> wurde registriert. Dies wird deinen Pfad in den kommenden Duellen prägen.</p>
            <p>Sobald die Closed Beta Tore sich öffnen, erhältst du deinen Zugangsschlüssel direkt hier an diese Adresse.</p>
          ` : `
            <h1>Welcome to the <span class="accent">Vanguard</span>.</h1>
            <p>The convergence has begun. You have been drafted as one of our first 100 <strong>Frontline Testers</strong>.</p>
            <p>Your affinity for <span class="badge">${elementDisplay.toUpperCase()}</span> has been recorded. This will shape your journey in the duels ahead.</p>
            <p>As soon as the Closed Beta gates swing open, you will receive your access key directly at this address.</p>
          `}
          <p style="margin-top: 40px; font-size: 14px; opacity: 0.7; color: ${colors.muted};">
            ${language === 'de' ? 'Hinter dem Bildschirm. Am selben Tisch.' : 'Beyond the Screen. Across the Table.'}
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Quatralor | Built for the next generation of duelists.
        </div>
      </div>
    </body>
    </html>
    `

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Quatralor", email: SENDER_EMAIL },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    })

    const resData = await res.json()
    if (res.status >= 400) throw new Error(resData.message || "Brevo Error")

    return new Response(JSON.stringify(resData), { status: 200 })
  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
