/* Bella Coast Cleaning LLC — site script */

/* ============================================================
   FORM SETUP — paste ONE endpoint here to receive requests by email.
   Option A (easiest): Formspree → https://formspree.io/f/xxxxxxx
   Option B (AWS):     your API Gateway URL → https://abc123.execute-api.us-east-1.amazonaws.com/estimate
   Leave empty ("") and the form will open the visitor's email app instead.
   ============================================================ */
const FORM_ENDPOINT = "";
const BUSINESS_EMAIL = "bellacoastcleaning@yahoo.com";

(function () {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("main-nav");
  if (btn && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Estimate form
  const form = document.getElementById("estimate-form");
  if (!form) return;
  const errBox = document.getElementById("form-error");
  const done = document.getElementById("form-done");
  const doneTitle = document.getElementById("done-title");
  const doneMsg = document.getElementById("done-msg");
  const submitBtn = document.getElementById("submit-btn");
  const dateInput = document.getElementById("f-date");

  if (dateInput) {
    const t = new Date();
    dateInput.min = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  const el = (k) => form.elements.namedItem(k);

  const labels = {
    name: "Full name", phone: "Phone", email: "Email", address: "Address",
    cleaning_type: "Type of cleaning", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
    preferred_date: "Preferred date", notes: "Notes",
  };

  function validate() {
    let firstBad = null;
    form.querySelectorAll("[required]").forEach((el) => {
      const field = el.closest(".field");
      const ok = el.value.trim() !== "" && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      field.classList.toggle("invalid", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      if (!ok && !firstBad) firstBad = el;
    });
    const phone = el("phone").value.replace(/\D/g, "");
    if (phone && phone.length < 10) {
      el("phone").closest(".field").classList.add("invalid");
      if (!firstBad) firstBad = el("phone");
    }
    return firstBad;
  }

  function showDone(title, msg) {
    doneTitle.textContent = title;
    doneMsg.textContent = msg;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.hidden = true;
    if (el("_gotcha") && el("_gotcha").value) return; // spam bot

    const bad = validate();
    if (bad) {
      errBox.textContent = "Please fill in your name, a 10-digit phone number, a valid email, your address and the type of cleaning.";
      errBox.hidden = false;
      bad.focus();
      return;
    }

    const data = {};
    Object.keys(labels).forEach((k) => { data[k] = (el(k) && el(k).value.trim()) || ""; });

    if (FORM_ENDPOINT) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, _subject: "New estimate request: " + data.name }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        showDone("Thank you, " + data.name.split(" ")[0] + "!", "We received your request and will contact you soon with your free estimate.");
      } catch (err) {
        errBox.textContent = "Your request couldn't be sent. Please call 585-806-6064 or email " + BUSINESS_EMAIL + ".";
        errBox.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send My Estimate Request";
      }
      return;
    }

    // No endpoint configured: open the visitor's email app with the request filled in
    const body = Object.keys(labels)
      .filter((k) => data[k])
      .map((k) => labels[k] + ": " + data[k])
      .join("\n");
    const href = "mailto:" + BUSINESS_EMAIL +
      "?subject=" + encodeURIComponent("Free estimate request - " + data.name) +
      "&body=" + encodeURIComponent(body);
    window.location.href = href;
    showDone("Almost done!", "Your email app should open with your request filled in. Press Send to finish. If it didn't open, call 585-806-6064 or email " + BUSINESS_EMAIL + ".");
  });

  form.addEventListener("input", (e) => {
    const f = e.target.closest(".field");
    if (f) f.classList.remove("invalid");
  });

  document.getElementById("form-again").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
    el("name").focus();
  });
})();
