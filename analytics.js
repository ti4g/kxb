// ============================================================
//  Firebase Analytics — mede visitas e cliques do portfólio
//  Sem config preenchida, o arquivo simplesmente não faz nada.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics, logEvent, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// EDITE AQUI: cole a config do seu app web (Firebase Console > Configurações do projeto > Seus apps)
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""   // precisa começar com G- (é o que liga o Analytics)
};

if (firebaseConfig.measurementId && await isSupported().catch(() => false)) {
  const analytics = getAnalytics(initializeApp(firebaseConfig));

  // de onde veio a visita (link da bio do Insta, WhatsApp, direto...)
  logEvent(analytics, "page_view", {
    page_referrer: document.referrer || "direto",
    page_location: location.href
  });

  // clique nos contatos (WhatsApp, Insta, GitHub, LinkedIn)
  document.querySelectorAll(".link").forEach((el) => {
    const nome = el.querySelector(".link__name")?.textContent.trim() || "?";
    el.addEventListener("click", () => logEvent(analytics, "clique_contato", { canal: nome }));
  });

  // copiar e-mail
  document.getElementById("copyMail")?.addEventListener("click", () =>
    logEvent(analytics, "copiar_email")
  );

  // clique nos projetos do índice
  document.querySelectorAll("#rows .row").forEach((el) => {
    const nome = el.querySelector(".row__name")?.textContent.trim() || "?";
    el.addEventListener("click", () => logEvent(analytics, "clique_projeto", { projeto: nome }));
  });

  // clique no destaque (Intimatto)
  document.querySelector(".linkline")?.addEventListener("click", () =>
    logEvent(analytics, "clique_projeto", { projeto: "Intimatto (destaque)" })
  );

  // quem chegou até o fim da página
  const fim = document.querySelector(".contact");
  if (fim && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting) { logEvent(analytics, "chegou_no_contato"); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(fim);
  }
}
