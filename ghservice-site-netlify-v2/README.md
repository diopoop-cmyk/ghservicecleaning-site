# G&H Service Cleaning Website (Netlify-ready)

This is a **static site** (HTML/CSS/JS) you can upload to **Netlify** as-is (no build step).

## What you get
- A modern, light, friendly site (inspired by the flow/style of queenofmaids.com: hero → services → instant quote → reviews → FAQ → contact).
- **Instant quote** calculator + **Netlify Forms** (requests land in your Netlify dashboard).
- **Live Google Reviews** (auto-pulls new reviews from your Google Business Profile) via a Netlify Function.
- **Full editing dashboard**: **/admin** (Decap / Netlify CMS) so you can:
  - edit text, services, areas, working hours
  - upload photos
  - update prices logic (simple JS)
- Original cartoon mascots (SVG) wearing a G&H patch (no borrowed images).

---

## 1) Deploy to Netlify
1. Create a new site in Netlify.
2. Drag-and-drop this folder OR connect to a Git repo containing these files.
3. Publish directory is the root (.) and there is no build command.

---

## 2) Make the quote form work
Netlify automatically detects `data-netlify="true"`.

After first deploy:
- Netlify → **Forms** → you will see **quote** submissions.

---

## 3) Turn on the /admin editor (recommended)
1. Netlify → **Site settings** → **Identity** → Enable
2. Identity → **Registration preferences**:
   - Invite only (recommended), or Open
3. Identity → **Services** → Enable **Git Gateway**
4. Deploy again.
5. Open: `/admin/`
6. Invite your email as an admin user.

Now you can edit:
- `content/site.json` (brand, hours, areas)
- service pages in `content/services/`

---

## Booking (Book Now)
This site includes a dedicated **/book** page with an inline **Calendly** widget (the simplest reliable way to show live available times on a static site).

To enable it:
- Open `/admin` → **Site Settings** → **Booking** → paste your Calendly URL
- Publish changes

---

## 4) Show Google reviews automatically (live)
This site uses a Netlify Function at:
`/.netlify/functions/google-reviews`

### Add environment variables
Netlify → **Site settings** → **Environment variables**
- `GOOGLE_PLACES_API_KEY` = your Google API key (Places API enabled)
- `GOOGLE_PLACE_ID` = your business Place ID

Then redeploy.

### Getting your Place ID
Use Google's official Place ID tools or the Google Maps Platform docs to find the Place ID for your business listing.

---

## 5) Change your logo / branding
- Current logo file: `assets/logo.svg`
- Mascot patches show “G&H” text.
If you want your exact gold/black logo on the mascots:
- replace the patch in each mascot SVG (`assets/mascot-*.svg`) with your own SVG mark.

---

## 6) Add photos
Upload images through `/admin` → they land in:
`assets/uploads/`

Then you can reference them in content.

---

## Notes
- Pricing is calculated in `assets/app.js` (function `computeQuote()`).
- This site intentionally does NOT copy any competitor testimonials or images.
