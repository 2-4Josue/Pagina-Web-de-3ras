// Se usa en varias animaciones del archivo (título, viento), por eso
// se declara aquí arriba de todo.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===================== TÍTULO ESCRITO LETRA POR LETRA =====================
function typeHeroTitle() {
  const lines = [
    { el: document.querySelector('.hero__title-line[data-line="0"]'), text: "La piel guarda" },
    { el: document.querySelector('.hero__title-line[data-line="1"]'), text: "lo que el silencio calla" },
  ];

  if (!lines[0].el || !lines[1].el) return;

  // Si el usuario prefiere menos movimiento, mostramos el texto completo de una vez
  if (prefersReducedMotion) {
    lines.forEach((line) => { line.el.textContent = line.text; });
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;

  function typeChar() {
    if (lineIndex >= lines.length) return;

    const current = lines[lineIndex];
    current.el.classList.add("is-typing");

    if (charIndex <= current.text.length) {
      current.el.textContent = current.text.slice(0, charIndex);
      charIndex++;
      window.setTimeout(typeChar, 45 + Math.random() * 40);
    } else {
      current.el.classList.remove("is-typing");
      lineIndex++;
      charIndex = 0;
      window.setTimeout(typeChar, 280); // pequeña pausa entre líneas
    }
  }

  window.setTimeout(typeChar, 350); // pequeña pausa antes de empezar
}

typeHeroTitle();

// ===================== CONTADOR ANIMADO =====================
function animateCounters() {
  const counters = document.querySelectorAll(".stat__number");
  if (!counters.length) return;

  function runCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

animateCounters();

// ===================== AÑO EN FOOTER =====================
document.getElementById("year").textContent = new Date().getFullYear();

// ===================== LÍNEAS DE VIENTO =====================
// Genera líneas blancas finas que cruzan el hero simulando ráfagas de
// viento. Respeta prefers-reduced-motion (si el usuario lo pide, no
// se generan).

const windLayer = document.getElementById("windLayer");

function spawnWindLine() {
  if (prefersReducedMotion) return;

  const line = document.createElement("div");
  line.className = "wind-line";

  const topPos = Math.random() * 90 + 3;      // entre 3% y 93% de alto
  const width = 90 + Math.random() * 220;      // entre 90px y 310px de largo
  const duration = 1.6 + Math.random() * 1.8;  // entre 1.6s y 3.4s cruzando
  const opacity = 0.35 + Math.random() * 0.4;  // intensidad variable

  line.style.top = `${topPos}%`;
  line.style.width = `${width}px`;
  line.style.setProperty("--line-opacity", opacity.toFixed(2));
  line.style.animationDuration = `${duration}s`;

  windLayer.appendChild(line);

  window.setTimeout(() => line.remove(), duration * 1000 + 200);
}

function scheduleNextWindLine() {
  // aparece una ráfaga cada 0.3-1.2 segundos, a veces varias juntas
  const delay = 300 + Math.random() * 900;
  window.setTimeout(() => {
    spawnWindLine();
    if (Math.random() > 0.5) {
      window.setTimeout(spawnWindLine, 80 + Math.random() * 200);
    }
    scheduleNextWindLine();
  }, delay);
}

if (!prefersReducedMotion) {
  scheduleNextWindLine();
}

// ===================== CARRUSEL DE GALERÍA =====================
const track = document.getElementById("carouselTrack");
const prevBtn = document.querySelector(".carousel__btn--prev");
const nextBtn = document.querySelector(".carousel__btn--next");

function scrollCarousel(direction) {
  const item = track.querySelector(".carousel__item");
  const itemWidth = item ? item.getBoundingClientRect().width + 20 : 280;
  track.scrollBy({ left: direction * itemWidth * 2, behavior: "smooth" });
}

prevBtn.addEventListener("click", () => scrollCarousel(-1));
nextBtn.addEventListener("click", () => scrollCarousel(1));

// ===================== FORMULARIO DE CONTACTO =====================
// IMPORTANTE: un sitio 100% estático (HTML/CSS/JS) no puede enviar correos
// por sí mismo sin exponer credenciales. Para que los datos le lleguen a la
// dueña por correo, este formulario está listo para conectarse a un
// servicio como Formspree o EmailJS (gratis). Instrucciones en el README.

const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

// Reemplaza esta URL por la que te dé tu cuenta de Formspree
// (ver README.md, paso "Conectar el formulario").
const FORM_ENDPOINT = "https://formspree.io/f/TU_ID_AQUI";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "Enviando...";

  const data = new FormData(form);

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      status.textContent = "¡Gracias! Te contactaremos pronto.";
      form.reset();
    } else {
      status.textContent = "No se pudo enviar. Intenta de nuevo o llámanos.";
    }
  } catch (err) {
    status.textContent = "Sin conexión con el servidor de envío. Revisa el README.";
  }
});