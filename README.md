# Bella-Coast-Cleaning
Static HTML/CSS/JS Danabel



Bella Coast Cleaning — Website Status (2026-09-24)

Stack: static HTML/CSS/JS, one page. Hosting plan: AWS Amplify (GitHub-connected), domain + DNS on Route 53. Source: D:\Claude\Bella Coast Cleaning LLC\website\ (index.html, css/, js/main.js, images/, robots.txt, sitemap.xml, DEPLOY.md, aws-form-backend/) Preview: https://claude.ai/artifact/Js2Y3s9dpteJCkiuNLUhy6

Decisions
No fixed prices; free estimates only. New-customer first-time discount mentioned.
Colors: navy 
#0B3565, ocean 
#1F8FC9, green 
#3C9A3F, mist 
#EEF6F9. Fonts: Marcellus / Mulish / Allura.
Estimate form: set FORM_ENDPOINT in js/main.js (Formspree or API Gateway → Lambda + SES). If it's empty, the form falls back to mailto.
Reviews: placeholder card only. Add real reviews only (template in an HTML comment).
Placeholder domain: bellacoastcleaning.com (canonical, og, JSON-LD, robots, sitemap).
Open items
Confirm hours (site shows Mon–Sat 8–6, taken from the mockup)
Register the domain, deploy to Amplify, connect the form endpoint
Google Business Profile + Search Console + sitemap submit
Social links, and optional domain email
