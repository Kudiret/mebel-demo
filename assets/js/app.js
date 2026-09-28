(function () {
  "use strict";
  const C = window.CLINIC;
  if (!C) return console.error("config/company.js не загружен");

  const $$ = (sel) => document.querySelectorAll(sel);
  const slots = (name) => $$(`[data-slot="${name}"]`);
  const fill = (name, fn) => slots(name).forEach(fn);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => (n === 0 ? "Бесплатно" : new Intl.NumberFormat("ru-RU").format(n) + " ₸");
  const phoneHref = "tel:+" + C.contacts.phone.replace(/\D/g, "");
  const waHref = (text) => `https://wa.me/${C.contacts.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");

  const ICONS = {
    kitchen: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 12h18M12 4v16"/><path d="M9.6 8.2v1.8M9.6 14.2v1.8M14.4 8.2v1.8M14.4 14.2v1.8"/>',
    wardrobe: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M12 3v18"/><path d="M10.5 11v2M13.5 11v2"/><path d="M7.5 21v1M16.5 21v1"/>',
    hanger: '<path d="M12 4.6a2 2 0 0 1 2 2c0 1.2-1 1.7-2 2.1v1.3"/><path d="m12 10 8 5.4c1 .7.5 2.2-.7 2.2H4.7c-1.2 0-1.7-1.5-.7-2.2L12 10Z"/>',
    bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 15h18"/><path d="M6.5 9V7.4a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1V9"/><path d="M3 18v2.2M21 18v2.2"/>',
    bath: '<path d="M4 11h16v3.2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V11Z"/><path d="M6.6 11V6.6A2.6 2.6 0 0 1 9.2 4c1.2 0 2.1.8 2.5 1.8"/><path d="M7.2 18.4 6 21M16.8 18.4 18 21"/>',
    shop: '<path d="M4.5 9h15l-1 10.2a1 1 0 0 1-1 .8H6.5a1 1 0 0 1-1-.8L4.5 9Z"/><path d="M9 9V6.6a3 3 0 0 1 6 0V9"/>',
    doc: '<path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/><circle cx="12" cy="13" r="2.6"/><path d="m10.6 15.2-.8 3.8 2.2-1.2 2.2 1.2-.8-3.8"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.kitchen}</svg>`;
  const stars = (n) => "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n));

  /* ---------- Theme & meta ---------- */
  const root = document.documentElement.style;
  const colorVars = { brand: "--brand", brandSoft: "--brand-soft", accent: "--accent", accentInk: "--accent-ink", surface: "--surface", ink: "--ink" };
  Object.entries(C.brand.colors || {}).forEach(([k, v]) => colorVars[k] && root.setProperty(colorVars[k], v));
  document.title = C.seo.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = C.seo.description;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", C.brand.colors.brand);

  /* ---------- Shared bits ---------- */
  fill("logo", (el) => {
    el.innerHTML = C.brand.logoImage
      ? `<img src="${esc(C.brand.logoImage)}" alt="${esc(C.brand.name)}">`
      : `<span class="logo__mark" aria-hidden="true">${esc(C.brand.logoMark)}</span>${esc(C.brand.name)}`;
  });
  fill("phone-link", (el) => { el.href = phoneHref; el.textContent = C.contacts.phone; });
  fill("wa-link", (el) => { el.href = waHref(`Здравствуйте! Хочу заказать замер в ${C.brand.name}.`); });
  fill("rating", (el) => {
    const r = C.rating;
    el.innerHTML = `<span class="rating__stars" aria-hidden="true">★★★★★</span><b>${esc(r.value)}</b> — ${esc(r.count)} отзывов в ${esc(r.source)}`;
  });
  const serviceNames = C.services.map((s) => s.title);
  fill("service-options", (el) => {
    el.innerHTML = ["Замер и консультация", ...serviceNames].map((n) => `<option>${esc(n)}</option>`).join("");
  });

  /* ---------- Hero ---------- */
  fill("hero-title", (el) => (el.textContent = C.hero.title));
  fill("hero-subtitle", (el) => (el.textContent = C.hero.subtitle));
  fill("hero-photo", (el) => {
    el.innerHTML = `<img src="${esc(C.hero.image)}" alt="Кухня на заказ — ${esc(C.brand.name)}" fetchpriority="high">`;
    el.querySelector("img").onerror = function () { this.remove(); };
  });
  fill("facts", (el) => {
    el.innerHTML = C.hero.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");
  });

  /* ---------- Slot widget ---------- */
  (function slotWidget() {
    const form = document.getElementById("slotcard");
    if (!form) return;
    const daysEl = form.querySelector('[data-slot="days"]');
    const timesEl = form.querySelector('[data-slot="times"]');
    const submit = form.querySelector('[data-slot="slot-submit"]');
    const wd = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    const state = { day: 0, time: null };
    const days = Array.from({ length: C.booking.days || 6 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      return { date: d, label: i === 0 ? "Сегодня" : i === 1 ? "Завтра" : wd[d.getDay()], num: d.getDate() };
    });
    // Демонстрационная занятость: детерминированно «занимаем» часть слотов
    const busy = (dayIdx, t, i) => {
      const now = new Date();
      if (dayIdx === 0) { const [h, m] = t.split(":").map(Number); if (h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 60) return true; }
      return (days[dayIdx].num * 7 + i * 3) % 5 === 0;
    };
    const monthName = (d) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

    function radio(container, buttons) {
      container.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
        const list = [...container.querySelectorAll(".chip:not(:disabled)")];
        const i = list.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        const next = list[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length];
        next.focus(); next.click();
      });
    }

    function renderDays() {
      daysEl.innerHTML = days.map((d, i) =>
        `<button type="button" class="chip" role="radio" aria-checked="${i === state.day}" tabindex="${i === state.day ? 0 : -1}" data-i="${i}">${d.label}<small>${d.num}</small></button>`
      ).join("");
    }
    function renderTimes() {
      const times = C.booking.times.map((t, i) => ({ t, off: busy(state.day, t, i) }));
      if (state.time && times.find((x) => x.t === state.time)?.off) state.time = null;
      const firstFree = times.findIndex((x) => !x.off);
      timesEl.innerHTML = times.map((x, i) =>
        `<button type="button" class="chip" role="radio" aria-checked="${x.t === state.time}" tabindex="${(state.time ? x.t === state.time : i === firstFree) ? 0 : -1}" ${x.off ? "disabled aria-disabled=\"true\"" : ""} data-t="${x.t}">${x.t}</button>`
      ).join("");
      submit.disabled = !state.time;
      submit.textContent = state.time ? `Замер: ${days[state.day].label.toLowerCase()}, ${state.time}` : firstFree < 0 ? "На этот день замеров нет" : "Выберите время";
    }
    daysEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      state.day = +b.dataset.i; renderDays(); renderTimes();
      daysEl.querySelector(`[data-i="${state.day}"]`).focus({ preventScroll: true });
    });
    timesEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b || b.disabled) return;
      state.time = b.dataset.t; renderTimes();
      timesEl.querySelector(`[data-t="${state.time}"]`).focus({ preventScroll: true });
    });
    radio(daysEl); radio(timesEl);
    // Если сегодня мест нет — сразу показываем завтра
    renderDays();
    if (C.booking.times.every((t, i) => busy(0, t, i))) state.day = 1;
    renderDays(); renderTimes();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!state.time) return;
      const d = days[state.day];
      const text = `Здравствуйте! Хочу заказать замер в ${C.brand.name}.\nЧто нужно: ${form.service.value}\nКогда удобен замер: ${monthName(d.date)}, ${state.time}`;
      window.open(waHref(text), "_blank", "noopener");
    });
  })();

  /* ---------- Services ---------- */
  fill("services", (el) => {
    el.innerHTML = C.services.map((s) => `
      <li class="service">
        <span class="service__icon">${icon(s.icon)}</span>
        <h3>${esc(s.title)}</h3>
        <span class="service__price">от ${money(s.priceFrom)}</span>
        <p>${esc(s.text)}</p>
      </li>`).join("");
  });

  /* ---------- Advantages / steps ---------- */
  fill("advantages", (el) => {
    el.innerHTML = C.advantages.map((a) => `<li><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></li>`).join("");
  });
  fill("steps", (el) => {
    el.innerHTML = C.steps.map((s) => `<li><b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`).join("");
  });

  /* ---------- Doctors ---------- */
  const initials = (n) => n.split(" ").map((p) => p[0]).slice(0, 2).join("");
  fill("doctors", (el) => {
    el.innerHTML = C.doctors.map((d) => `
      <li class="doctor">
        <div class="doctor__photo">${d.photo ? `<img src="${esc(d.photo)}" alt="${esc(d.name)}, ${esc(d.role)}" loading="lazy">` : `<span class="doctor__fallback">${esc(initials(d.name))}</span>`}</div>
        <h3>${esc(d.name)}</h3>
        <p>${esc(d.role)}</p>
        <small>${esc(d.experience)}</small>
      </li>`).join("");
    el.querySelectorAll("img").forEach((img) => (img.onerror = function () {
      const name = this.alt.split(",")[0];
      this.parentElement.innerHTML = `<span class="doctor__fallback">${esc(initials(name))}</span>`;
    }));
  });

  /* ---------- Prices ---------- */
  (function prices() {
    const tabs = slots("price-tabs")[0], panels = slots("price-panels")[0];
    if (!tabs || !panels) return;
    tabs.innerHTML = C.prices.map((p, i) =>
      `<button class="tab" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(p.category)}</button>`).join("");
    panels.innerHTML = C.prices.map((p, i) => `
      <div role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" ${i ? "hidden" : ""}>
        ${p.items.map((it) => `<div class="price-row"><span class="price-row__name">${esc(it.name)}${it.note ? `<small>${esc(it.note)}</small>` : ""}</span><span class="price-row__value">${money(it.price)}</span></div>`).join("")}
      </div>`).join("") +
      `<div class="prices__foot"><p>Цены действительны на ${new Date().getFullYear()} год</p><a class="btn btn--accent btn--sm" href="#booking">Узнать точную стоимость</a></div>`;
    const all = [...tabs.children];
    const select = (i) => {
      all.forEach((t, j) => { t.setAttribute("aria-selected", i === j); t.tabIndex = i === j ? 0 : -1; });
      panels.querySelectorAll('[role="tabpanel"]').forEach((p, j) => (p.hidden = i !== j));
    };
    tabs.addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (t) select(all.indexOf(t)); });
    tabs.addEventListener("keydown", (e) => {
      const i = all.indexOf(document.activeElement);
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (i < 0 || !d) return;
      e.preventDefault();
      const n = (i + d + all.length) % all.length; select(n); all[n].focus();
    });
  })();

  /* ---------- Reviews ---------- */
  fill("reviews", (el) => {
    el.innerHTML = C.reviews.map((r) => `
      <li class="review">
        <span class="review__stars" aria-label="Оценка ${r.rating} из 5">${stars(r.rating)}</span>
        <p>${esc(r.text)}</p>
        <footer><b>${esc(r.name)}</b><span>${esc(r.source)}</span></footer>
      </li>`).join("");
  });

  /* ---------- Licenses ---------- */
  fill("licenses", (el) => {
    el.innerHTML = C.licenses.map((l) => `<li class="license">${icon("doc")}<div><b>${esc(l.title)}</b><span>${esc(l.meta)}</span></div></li>`).join("");
  });

  /* ---------- FAQ ---------- */
  fill("faq", (el) => {
    el.innerHTML = C.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  });

  /* ---------- Contacts & map ---------- */
  const hours = C.contacts.hours.map((h) => `${esc(h.days)}: ${esc(h.time)}`).join("<br>");
  fill("contacts", (el) => {
    el.innerHTML = `
      <div><dt>Адрес</dt><dd>${esc(C.contacts.city)}, ${esc(C.contacts.address)}<small>${esc(C.contacts.landmark || "")}</small></dd></div>
      <div><dt>Телефон и WhatsApp</dt><dd><a href="${phoneHref}">${esc(C.contacts.phone)}</a></dd></div>
      <div><dt>Часы работы</dt><dd>${hours}</dd></div>
      ${C.contacts.instagram ? `<div><dt>Instagram</dt><dd><a href="https://instagram.com/${esc(C.contacts.instagram)}" target="_blank" rel="noopener">@${esc(C.contacts.instagram)}</a></dd></div>` : ""}`;
  });
  fill("map-link", (el) => (el.href = C.contacts.mapLink));
  fill("map", (el) => {
    if (C.contacts.mapEmbed) el.innerHTML = `<iframe src="${esc(C.contacts.mapEmbed)}" title="Карта: ${esc(C.brand.name)}" loading="lazy"></iframe>`;
  });

  /* ---------- Footer ---------- */
  fill("footer-about", (el) => (el.textContent = C.seo.description));
  fill("footer-contacts", (el) => {
    el.innerHTML = `<a href="${phoneHref}">${esc(C.contacts.phone)}</a>
      <a href="${waHref()}" target="_blank" rel="noopener">WhatsApp</a>
      ${C.contacts.email ? `<a href="mailto:${esc(C.contacts.email)}">${esc(C.contacts.email)}</a>` : ""}
      <p>${esc(C.contacts.city)}, ${esc(C.contacts.address)}</p>`;
  });
  fill("copyright", (el) => (el.textContent = `© ${new Date().getFullYear()} ${C.brand.name}`));

  /* ---------- Booking form ---------- */
  (function bookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;
    const status = form.querySelector(".form__status");
    const setError = (input, msg) => {
      const field = input.closest(".field");
      field.classList.toggle("is-invalid", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      let err = field.querySelector(".field__error");
      if (msg && !err) { err = document.createElement("span"); err.className = "field__error"; err.id = input.name + "-error"; field.appendChild(err); input.setAttribute("aria-describedby", err.id); }
      if (err) err.textContent = msg || "";
    };
    form.phone.addEventListener("input", () => {
      let d = form.phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (d && !d.startsWith("7")) d = "7" + d;
      d = d.slice(0, 11);
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      form.phone.value = d ? `+7${p[0] ? ` (${p[0]}` : ""}${p[1] ? `) ${p[1]}` : ""}${p[2] ? `-${p[2]}` : ""}${p[3] ? `-${p[3]}` : ""}` : "";
      if (form.phone.getAttribute("aria-invalid") === "true") setError(form.phone, null);
    });
    form.name.addEventListener("input", () => setError(form.name, null));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      if (form.name.value.trim().length < 2) { setError(form.name, "Укажите имя"); ok = false; }
      if (form.phone.value.replace(/\D/g, "").length !== 11) { setError(form.phone, "Введите номер полностью: +7 и 10 цифр"); ok = false; }
      if (!form.agree.checked) { status.textContent = "Отметьте согласие на обработку данных"; ok = false; }
      if (!ok) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }

      const data = { name: form.name.value.trim(), phone: form.phone.value, service: form.service.value, comment: form.comment.value.trim() };
      const text = `Здравствуйте! Заявка с сайта ${C.brand.name}.\nИмя: ${data.name}\nТелефон: ${data.phone}\nЧто нужно: ${data.service}` + (data.comment ? `\nКомментарий: ${data.comment}` : "");

      if (C.booking.webhookUrl) {
        try {
          const res = await fetch(C.booking.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(res.status);
          form.reset(); form.agree.checked = true;
          status.className = "form__status is-ok";
          status.textContent = "Заявка отправлена. Мы свяжемся с вами в течение 15 минут.";
          return;
        } catch {
          status.className = "form__status";
          status.textContent = "Не удалось отправить заявку. Позвоните нам или напишите в WhatsApp.";
          return;
        }
      }
      window.open(waHref(text), "_blank", "noopener");
      status.className = "form__status is-ok";
      status.textContent = "Открыли WhatsApp с вашей заявкой — нажмите «Отправить» в чате.";
    });
  })();

  /* ---------- Header behaviour ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.querySelector(".burger");
  const menu = document.getElementById("mobile-menu");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); menu.hidden = !open; };
  burger.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && !menu.hidden && (setMenu(false), burger.focus()));
})();
