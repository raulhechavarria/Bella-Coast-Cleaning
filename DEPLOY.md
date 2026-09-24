# Bella Coast Cleaning: Launch Guide

Static site (HTML/CSS/JS). Hosting: **AWS Amplify**. Domain + DNS: **Route 53**.

```
website/
├── index.html            ← the whole site (Home, About, Services, Area, Reviews, FAQ, Estimate, Contact)
├── css/styles.css
├── js/main.js            ← FORM_ENDPOINT setting is at the top
├── images/               ← bella-coast-card.jpg, favicon.svg
├── robots.txt
├── sitemap.xml
├── aws-form-backend/     ← optional Lambda + SES form handler (not served by the site)
└── DEPLOY.md
```

> The domain `bellacoastcleaning.com` is a placeholder. If you register a different name, find and replace it in
> `index.html` (canonical, og tags, JSON-LD), `robots.txt` and `sitemap.xml`.

---

## Before launch: confirm with the owner

- [ ] **Business hours.** The site shows *Mon–Sat, 8:00 AM–6:00 PM* (from the mockup). Change it in `index.html` in two places: the contact card and the JSON-LD `openingHoursSpecification`.
- [ ] **Reviews.** The section shows a "your review could be here" card. Only add **real** customer reviews (there's a copy-paste template in an HTML comment in the Reviews section). Once the Google Business Profile has reviews, you can also link to it.
- [ ] **Social links.** Add Facebook/Instagram/TikTok links to the footer once the pages exist.

---

## 1. Test locally

```bash
cd website
python3 -m http.server 8080     # open http://localhost:8080
```

## 2. Put it on GitHub

```bash
cd website
git init && git add . && git commit -m "Bella Coast Cleaning website"
git branch -M main
git remote add origin https://github.com/<you>/bella-coast-cleaning.git
git push -u origin main
```

## 3. Register the domain (Route 53)

AWS Console → **Route 53 → Registered domains → Register domain** → search `bellacoastcleaning.com`
(backups: `bellacoastcleaningfl.com`, `bellacoastcleaning.net`). Turn on auto-renew and privacy protection.
Route 53 creates the hosted zone for you automatically.

## 4. Host on Amplify

1. AWS Console → **Amplify → Create new app → GitHub** → pick the repo and the `main` branch.
2. Build settings: it's a static site, so **no build command** is needed. Set the output/base directory to `/`.
   If Amplify asks for a spec, use:
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands: []
     artifacts:
       baseDirectory: /
       files:
         - '**/*'
   ```
3. Deploy. You'll get a `https://main.xxxx.amplifyapp.com` preview URL.
4. **Hosting → Custom domains → Add domain** → pick the Route 53 domain. Amplify creates the DNS records and a free SSL
   certificate. Set up **both** `bellacoastcleaning.com` and `www`, and redirect the bare domain to `www`
   (the site's canonical URL uses `www`).

Every `git push` to `main` redeploys the site automatically.

## 5. Make the estimate form deliver emails

In `js/main.js`, set `FORM_ENDPOINT`. Until you do, the form opens the visitor's email app with the request pre-filled (works, but some visitors won't press Send).

### Option A: Formspree (5 minutes)
1. Sign up at formspree.io with `bellacoastcleaning@yahoo.com`, then create a form.
2. Copy the endpoint (`https://formspree.io/f/abcdwxyz`) into `FORM_ENDPOINT`. Commit and push.
3. Send a test request and confirm the email in the Yahoo inbox.

### Option B: All on AWS (Lambda + SES)
1. **SES → Verified identities**: verify the sender (best: the domain `bellacoastcleaning.com`, done through Route 53 in one click)
   and verify `bellacoastcleaning@yahoo.com` as the recipient. While SES is in *sandbox* mode, both sender and recipient must be verified.
2. **Lambda → Create function** (Node.js 20+) → paste `aws-form-backend/index.mjs`.
   Env vars: `TO_EMAIL=bellacoastcleaning@yahoo.com`, `FROM_EMAIL=estimates@bellacoastcleaning.com`,
   `ALLOWED_ORIGIN=https://www.bellacoastcleaning.com`.
   Give the role permission for `ses:SendEmail`.
3. **API Gateway → HTTP API** → route `POST /estimate` → the Lambda. Enable CORS for your domain.
4. Put the invoke URL (`https://xxxx.execute-api.us-east-1.amazonaws.com/estimate`) in `FORM_ENDPOINT`.

## 6. Get found on Google

1. **Google Business Profile** (business.google.com). This is the most important step for a local cleaner.
   - Category: *House cleaning service*. Choose **service-area business** (hide the home address) and add Palm Coast and nearby cities.
   - Add the website, phone, hours and photos. Verify the business (postcard, phone or video).
   - Ask every happy customer for a Google review, and reply to each one.
2. **Google Search Console** (search.google.com/search-console)
   - Add a **Domain** property → copy the TXT record → Route 53 → hosted zone → create a TXT record → Verify.
   - **Sitemaps** → submit `https://www.bellacoastcleaning.com/sitemap.xml`.
   - **URL Inspection** → the home page → *Request indexing*.
3. Keep the name, phone and city **exactly the same** everywhere (website, Google, Facebook, Yelp, Nextdoor, Angi).

## 7. Optional: professional email

`info@bellacoastcleaning.com` through Google Workspace or Zoho Mail. Add their MX/TXT records in Route 53, then
update the email in `index.html`, `js/main.js` and the Google Business Profile.

## Rough monthly cost

| Item | Cost |
|---|---|
| Domain (.com, Route 53) | about $15 / year |
| Route 53 hosted zone | about $0.50 / month |
| Amplify hosting (low traffic) | usually under $1 / month |
| Formspree free tier, or Lambda + SES | $0 at this volume |

Check current AWS pricing before buying.
