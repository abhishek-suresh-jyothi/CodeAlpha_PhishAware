// script.js — PhishAware application logic
import { auth, db, googleProvider, githubProvider } from "./firebase.js";
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  signOut, sendPasswordResetEmail, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { MODULES, QUESTIONS } from "./content.js";

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PASS_MARK = 12; // out of 15 correct answers needed to pass the quiz
const state = { modules: new Set(), quizPassed: false, cert: null };
let currentUser = null, registering = false, modIdx = 0, quiz = null;

/* ---------- original PhishAware logo (shield + phishing hook), pure SVG ---------- */
let logoCount = 0;
function logoMark(size = 40) {
  const id = "pa-g" + ++logoCount;
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 72" role="img" aria-label="PhishAware logo" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="6" y1="3" x2="58" y2="69">
      <stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#10b981"/></linearGradient></defs>
    <path d="M32 3 58 13v21c0 18-11 29-26 35C17 63 6 52 6 34V13z" fill="rgba(34,211,238,.12)" stroke="url(#${id})" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M32 24V42a8 8 0 0 1-16 0" fill="none" stroke="url(#${id})" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 42l-4.5-6" fill="none" stroke="url(#${id})" stroke-width="4" stroke-linecap="round"/>
    <circle cx="32" cy="18" r="4.5" fill="none" stroke="url(#${id})" stroke-width="3.5"/>
    <path d="M45 27v15" stroke="#22d3ee" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="45" cy="27" r="2.8" fill="#22d3ee"/><circle cx="45" cy="42" r="2.8" fill="#10b981"/>
  </svg>`;
}
$$("[data-logo]").forEach((el) => (el.innerHTML = logoMark(+el.dataset.logo)));

/* ---------- UI helpers ---------- */
function toast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = "toast " + type; t.textContent = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => t.classList.add("out"), 4200);
  setTimeout(() => t.remove(), 4800);
}
const setLoading = (on) => $("#loader").classList.toggle("hidden", !on);
function busy(btn, on, label) {
  if (!btn) return;
  if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; if (label) btn.textContent = label; }
  else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
}
function formMsg(id, text = "", ok = false) {
  const el = $("#" + id); el.textContent = text; el.classList.toggle("ok", ok);
}
const nameOf = (u) => u.displayName || (u.email ? u.email.split("@")[0] : "") || "Learner";

function friendlyError(e) {
  const m = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters with upper, lower case and a number.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
    "auth/cancelled-popup-request": "Another sign-in window is already open.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
    "auth/unauthorized-domain": "This domain is not authorised in Firebase. Add it in Firebase Console → Authentication → Settings → Authorized domains (add both localhost and 127.0.0.1).",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method. Sign in with that method first.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/requires-recent-login": "Please sign in again and retry.",
    "permission-denied": "Permission denied by Firestore rules. Publish the provided firestore.rules in Firebase Console."
  };
  return m[e?.code] || "Something went wrong (" + (e?.code || e?.message || "unknown") + "). Please try again.";
}
function authError(e, msgId) {
  console.error(e);
  const text = friendlyError(e);
  if (msgId) formMsg(msgId, text);
  toast(text, "error");
}

/* ---------- view routing ---------- */
const VIEWS = ["login", "register", "forgot", "dashboard", "modules", "quiz", "certificate"];
const APP_VIEWS = ["dashboard", "modules", "quiz", "certificate"];
const allDone = () => state.modules.size >= MODULES.length;

function showView(name) {
  if (APP_VIEWS.includes(name) && !currentUser) name = "login";
  if (name === "quiz" && !allDone()) { toast("Complete all training modules to unlock the final quiz.", "error"); name = "modules"; }
  VIEWS.forEach((v) => $("#view-" + v).classList.toggle("active", v === name));
  $("#navbar").classList.toggle("hidden", !APP_VIEWS.includes(name));
  $$("[data-nav]").forEach((b) => b.classList.toggle("active", b.dataset.nav === name));
  $("#navLinks").classList.remove("open"); $("#navToggle").setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0 });
  if (name === "dashboard") renderDashboard();
  if (name === "modules") renderModules();
  if (name === "quiz") renderQuiz();
  if (name === "certificate") renderCertificate();
  updateLocks();
}
function updateLocks() {
  $("#navQuiz").classList.toggle("locked", !allDone());
}

/* ---------- Firestore data ---------- */
async function ensureProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "", email: user.email || null,
      provider: user.providerData[0]?.providerId || "password", createdAt: serverTimestamp(), lastLogin: serverTimestamp()
    });
  } else {
    await setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });
  }
}
async function loadData() {
  const uid = currentUser.uid;
  const [p, c] = await Promise.all([getDoc(doc(db, "progress", uid)), getDoc(doc(db, "certificates", uid))]);
  const d = p.exists() ? p.data() : {};
  state.modules = new Set((d.modules || []).filter((n) => Number.isInteger(n) && n >= 1 && n <= MODULES.length));
  state.quizPassed = d.quizPassed === true;
  state.cert = c.exists() ? c.data() : null;
}
function saveProgress() {
  return setDoc(doc(db, "progress", currentUser.uid), {
    modules: [...state.modules].sort((a, b) => a - b), quizPassed: state.quizPassed, updatedAt: serverTimestamp()
  });
}

/* ---------- auth state ---------- */
onAuthStateChanged(auth, async (user) => {
  if (registering) return; // don't auto-login right after registration
  currentUser = user;
  if (user) {
    setLoading(true);
    try { await ensureProfile(user); await loadData(); }
    catch (e) { console.error(e); toast(friendlyError(e), "error"); }
    $("#userChip").textContent = nameOf(user);
    setLoading(false);
    showView("dashboard");
  } else {
    state.modules = new Set(); state.quizPassed = false; state.cert = null; quiz = null; modIdx = 0;
    setLoading(false);
    showView("login");
  }
});

/* ---------- login ---------- */
$$("[data-toggle]").forEach((b) => (b.onclick = () => {
  const i = $("#" + b.dataset.toggle); i.type = i.type === "password" ? "text" : "password";
}));
$$("[data-goto]").forEach((b) => (b.onclick = () => showView(b.dataset.goto)));
$("#toRegister").onclick = () => showView("register");
$("#toForgot").onclick = () => { $("#forgotEmail").value = $("#loginEmail").value; showView("forgot"); };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

$("#loginForm").addEventListener("submit", async (ev) => {
  ev.preventDefault(); formMsg("loginMsg");
  const btn = $("#loginBtn");
  const email = $("#loginEmail").value.trim(), pw = $("#loginPassword").value;
  if (!EMAIL_RE.test(email)) return formMsg("loginMsg", "Please enter a valid email address.");
  if (!pw) return formMsg("loginMsg", "Please enter your password.");
  busy(btn, true, "Signing in…");
  try { await signInWithEmailAndPassword(auth, email, pw); } catch (e) { authError(e, "loginMsg"); }
  busy(btn, false);
});

async function socialLogin(provider, btn) {
  formMsg("loginMsg"); busy(btn, true, "Opening…");
  try { await signInWithPopup(auth, provider); }
  catch (e) {
    if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") toast(friendlyError(e), "info");
    else authError(e, "loginMsg");
  }
  busy(btn, false);
}
$("#googleBtn").onclick = () => socialLogin(googleProvider, $("#googleBtn"));
$("#githubBtn").onclick = () => socialLogin(githubProvider, $("#githubBtn"));

/* ---------- register ---------- */
function fieldErr(id, text) {
  $("#err-" + id).textContent = text || ""; $("#" + id).classList.toggle("invalid", !!text); return !text;
}
function validateRegister() {
  const name = $("#regName").value.trim(), email = $("#regEmail").value.trim();
  const pw = $("#regPassword").value, cf = $("#regConfirm").value;
  let ok = true;
  ok = fieldErr("regName", name.length < 2 ? "Please enter your full name." : "") && ok;
  ok = fieldErr("regEmail", !email ? "Email is required." : !EMAIL_RE.test(email) ? "Enter a valid email address." : "") && ok;
  let pe = "";
  if (pw.length < 8) pe = "Use at least 8 characters.";
  else if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) pe = "Include both upper and lower case letters.";
  else if (!/\d/.test(pw)) pe = "Include at least one number.";
  ok = fieldErr("regPassword", pe) && ok;
  ok = fieldErr("regConfirm", !cf ? "Please confirm your password." : cf !== pw ? "Passwords do not match." : "") && ok;
  return ok;
}
["regName", "regEmail", "regPassword", "regConfirm"].forEach((id) => $("#" + id).addEventListener("input", () => { if ($("#err-" + id).textContent) validateRegister(); }));

$("#registerForm").addEventListener("submit", async (ev) => {
  ev.preventDefault(); formMsg("registerMsg");
  if (!validateRegister()) return;
  const name = $("#regName").value.trim(), email = $("#regEmail").value.trim(), pw = $("#regPassword").value;
  const btn = $("#registerBtn"); busy(btn, true, "Creating account…");
  registering = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, provider: "password", createdAt: serverTimestamp(), lastLogin: null
    });
    await signOut(auth); // do NOT stay signed in after registering
    $("#registerForm").reset();
    $("#loginEmail").value = email;
    showView("login");
    formMsg("loginMsg", "Registration successful! Please sign in with your new account.", true);
    toast("Registration successful! Please sign in.", "success");
  } catch (e) { authError(e, "registerMsg"); }
  busy(btn, false);
  setTimeout(() => (registering = false), 800);
});

/* ---------- forgot password ---------- */
$("#forgotForm").addEventListener("submit", async (ev) => {
  ev.preventDefault(); formMsg("forgotMsg");
  const email = $("#forgotEmail").value.trim();
  if (!EMAIL_RE.test(email)) return formMsg("forgotMsg", "Please enter a valid email address.");
  const btn = $("#forgotBtn"); busy(btn, true, "Sending…");
  try {
    await sendPasswordResetEmail(auth, email);
    formMsg("forgotMsg", "If an account exists for " + email + ", a password reset link has been sent. Check your inbox and spam folder.", true);
    toast("Reset email sent (if the account exists).", "success");
  } catch (e) { authError(e, "forgotMsg"); }
  busy(btn, false);
});

/* ---------- sign out + nav ---------- */
$("#signOutBtn").onclick = async () => {
  try { await signOut(auth); toast("You have been signed out.", "success"); } catch (e) { authError(e); }
};
$$("[data-nav]").forEach((b) => (b.onclick = () => showView(b.dataset.nav)));
$("#navToggle").onclick = () => {
  const open = $("#navLinks").classList.toggle("open"); $("#navToggle").setAttribute("aria-expanded", open);
};

/* ---------- dashboard ---------- */
function renderDashboard() {
  const done = state.modules.size, total = MODULES.length, pct = Math.round((done / total) * 100);
  $("#dashName").textContent = nameOf(currentUser);
  $("#dashEmail").textContent = currentUser.email || "";
  $("#dashPct").textContent = pct + "%"; $("#dashRing").style.setProperty("--p", pct);
  $("#dashBar").style.width = pct + "%";
  $("#dashDone").textContent = done + " / " + total;
  $("#dashQuiz").textContent = state.quizPassed ? "Passed ✓" : allDone() ? "Unlocked" : "Locked 🔒";
  $("#dashCert").textContent = state.cert ? "Earned ✓" : state.quizPassed ? "Ready to generate" : "Not earned";
  $("#dashChips").innerHTML = done === 0 && !state.quizPassed
    ? `<div class="empty">You haven't started yet. Open your first module to begin!</div>`
    : "";
  $("#dashChips").innerHTML += MODULES.map((m, i) => `<button class="chip ${state.modules.has(m.id) ? "done" : ""}" data-i="${i}">
      <span>${m.icon}</span><span>${m.id}. ${esc(m.title)}</span><span class="st">${state.modules.has(m.id) ? "Completed" : "Pending"}</span></button>`).join("");
  $("#dashContinue").textContent = done === 0 ? "Start training" : "Continue training";
  $("#proceedQuizBtn").classList.toggle("hidden", !allDone());
}
$("#dashChips").onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) { modIdx = +b.dataset.i; showView("modules"); } };
$("#dashContinue").onclick = () => {
  const next = MODULES.findIndex((m) => !state.modules.has(m.id)); modIdx = next === -1 ? 0 : next; showView("modules");
};
$("#proceedQuizBtn").onclick = () => showView("quiz");
$("#bannerQuizBtn").onclick = () => showView("quiz");

/* ---------- training modules ---------- */
function renderModules() { renderModuleList(); renderModule(); $("#modulesBanner").classList.toggle("hidden", !allDone()); }
function renderModuleList() {
  $("#moduleList").innerHTML = MODULES.map((m, i) => `<button class="mod-item ${i === modIdx ? "active" : ""} ${state.modules.has(m.id) ? "done" : ""}" data-i="${i}">
    <span class="mod-num">${state.modules.has(m.id) ? "✓" : m.id}</span><span>${esc(m.title)}</span></button>`).join("");
}
function renderModule() {
  const m = MODULES[modIdx], done = state.modules.has(m.id);
  let h = `<h2>${m.icon} Module ${m.id}: ${esc(m.title)}</h2><p class="meta">Progress: ${state.modules.size} of ${MODULES.length} modules completed</p>`;
  h += m.intro.map((p) => `<p>${esc(p)}</p>`).join("");
  h += `<div class="box points"><h4>📌 Important points</h4><ul>${m.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`;
  if (m.example) h += `<div class="box example"><h4>🔍 ${esc(m.example.title)}</h4><p style="margin:0">${esc(m.example.body)}</p></div>`;
  if (m.examples) {
    h += m.examples.map((x) => `<div class="mail"><div class="mail-tag">EDUCATIONAL EXAMPLE — NOT A REAL MESSAGE</div>
      <div class="mail-body"><strong>${esc(x.label)}</strong><div class="from">${esc(x.from)}</div>${x.subject ? `<div class="subj">${esc(x.subject)}</div>` : ""}
      <div class="msg">${esc(x.body)}</div></div>
      <div class="mail-ex"><strong>⚠️ Why it's suspicious:</strong><div class="flags">${x.flags.map((f) => `<span class="flag">${esc(f)}</span>`).join("")}</div>
      <p style="margin:6px 0 0"><strong>✅ Safe action:</strong> ${esc(x.action)}</p></div></div>`).join("");
  }
  h += `<div class="box tip"><h4>🛡️ Safety tip</h4><p style="margin:0">${esc(m.tip)}</p></div>`;
  h += `<div class="reader-nav">
      <button class="btn btn-outline" data-act="prev" ${modIdx === 0 ? "disabled" : ""}>← Previous</button>
      <button class="btn ${done ? "done-btn" : "btn-primary"}" data-act="complete" ${done ? "disabled" : ""}>${done ? "✓ Completed" : "Mark as Completed"}</button>
      <button class="btn btn-outline" data-act="next" ${modIdx === MODULES.length - 1 ? "disabled" : ""}>Next →</button></div>`;
  $("#moduleReader").innerHTML = h;
}
$("#moduleList").onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) { modIdx = +b.dataset.i; renderModules(); window.scrollTo({ top: 0, behavior: "smooth" }); } };
$("#moduleReader").onclick = async (e) => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  if (b.dataset.act === "prev" && modIdx > 0) modIdx--;
  else if (b.dataset.act === "next" && modIdx < MODULES.length - 1) modIdx++;
  else if (b.dataset.act === "complete") {
    const id = MODULES[modIdx].id; if (state.modules.has(id)) return;
    busy(b, true, "Saving…"); state.modules.add(id);
    try {
      await saveProgress();
      toast(allDone() ? "🎉 All modules completed! The final quiz is unlocked." : "Module marked as completed!", "success");
    } catch (err) { state.modules.delete(id); toast(friendlyError(err), "error"); }
    updateLocks();
  }
  renderModules(); window.scrollTo({ top: 0, behavior: "smooth" });
};

/* ---------- final quiz (exactly 15 questions) ---------- */
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function newQuiz() { return { order: shuffle([...QUESTIONS.keys()]), answers: {}, i: 0, stage: "intro", submitting: false }; }
const LET = ["A", "B", "C", "D"];

function renderQuiz() {
  if (!allDone()) return;
  if (!quiz) quiz = newQuiz();
  const body = $("#quizBody"), n = QUESTIONS.length;
  if (quiz.stage === "intro") {
    body.innerHTML = `<div class="center"><div style="font-size:3rem">📝</div><h2>Final Quiz</h2>
      <p class="muted">${n} multiple-choice questions · one question at a time · review your answers before you submit.</p>
      <p class="muted" style="margin-top:8px">You need ${PASS_MARK} correct answers to pass.</p>
      <button class="btn btn-primary" data-q="start" style="margin-top:22px">Start Quiz</button></div>`;
  } else if (quiz.stage === "take") {
    const q = QUESTIONS[quiz.order[quiz.i]], sel = quiz.answers[quiz.order[quiz.i]];
    const answered = Object.keys(quiz.answers).length, last = quiz.i === n - 1;
    body.innerHTML = `<div class="q-head"><span>Question ${quiz.i + 1} of ${n}</span><span>${answered} answered</span></div>
      <div class="bar"><span style="width:${((quiz.i + 1) / n) * 100}%"></span></div>
      <h2>${esc(q.q)}</h2>
      <div class="options" role="radiogroup">${q.o.map((o, k) => `<button class="opt ${sel === k ? "selected" : ""}" role="radio" aria-checked="${sel === k}" data-opt="${k}"><span class="key">${LET[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div class="q-nav"><button class="btn btn-outline" data-q="prev" ${quiz.i === 0 ? "disabled" : ""}>← Previous</button>
      <button class="btn btn-primary" data-q="${last ? "review" : "next"}">${last ? "Review answers" : "Next →"}</button></div>`;
  } else if (quiz.stage === "review") {
    const un = n - Object.keys(quiz.answers).length;
    body.innerHTML = `<h2>Review your answers</h2><p class="muted" style="margin-bottom:14px">${un ? `You have ${un} unanswered question${un > 1 ? "s" : ""}. Tap a question to answer it.` : "All questions answered. You can still change any answer before submitting."}</p>
      ${quiz.order.map((qi, idx) => { const a = quiz.answers[qi]; return `<div class="review-row ${a === undefined ? "unanswered" : ""}"><div><strong>Q${idx + 1}.</strong> ${esc(QUESTIONS[qi].q)}<div class="a">${a === undefined ? "⚠️ Not answered" : "Your answer: " + LET[a] + ". " + esc(QUESTIONS[qi].o[a])}</div></div><button class="btn btn-outline small" data-goto-q="${idx}">Edit</button></div>`; }).join("")}
      <div class="q-nav"><button class="btn btn-outline" data-q="back">← Back to quiz</button>
      <button class="btn btn-primary" data-q="submit" ${un || quiz.submitting ? "disabled" : ""}>Submit quiz</button></div>`;
  } else if (quiz.stage === "result") {
    const score = quiz.order.filter((qi) => quiz.answers[qi] === QUESTIONS[qi].c).length, passed = score >= PASS_MARK;
    body.innerHTML = `<div class="center"><div style="font-size:3rem">${passed ? "🎉" : "💪"}</div>
      <h2>${passed ? "Congratulations — you passed!" : "Nearly there — try again!"}</h2>
      <div class="big-score">${score} / ${n}</div>
      <p class="muted">${passed ? "You've completed the PhishAware final quiz. Your certificate is ready to generate." : `You need ${PASS_MARK} correct answers to pass. Review the explanations below and retake the quiz.`}</p>
      <div style="margin:18px 0" class="actions" style="justify-content:center">
        ${passed ? `<button class="btn btn-primary" data-q="cert">Get my certificate</button>` : `<button class="btn btn-primary" data-q="retake">Retake quiz</button>`}
        <button class="btn btn-outline" data-q="modules">Review modules</button></div></div>
      <h3 style="margin:10px 0 12px">Answer explanations</h3>
      ${quiz.order.map((qi, idx) => { const q = QUESTIONS[qi], a = quiz.answers[qi], ok = a === q.c; return `<div class="expl ${ok ? "ok" : "bad"}"><div class="t">${ok ? "✅" : "❌"} Q${idx + 1}. ${esc(q.q)}</div>
        <small>Your answer: ${a === undefined ? "—" : esc(q.o[a])}</small><small>Correct answer: <strong style="color:#7ff5d1">${esc(q.o[q.c])}</strong></small>
        <p style="margin:6px 0 0;font-size:.92rem">${esc(q.e)}</p></div>`; }).join("")}`;
  }
}
$("#quizBody").onclick = async (e) => {
  if (!quiz) return;
  const opt = e.target.closest("[data-opt]");
  if (opt) { quiz.answers[quiz.order[quiz.i]] = +opt.dataset.opt; return renderQuiz(); }
  const g = e.target.closest("[data-goto-q]");
  if (g) { quiz.i = +g.dataset.gotoQ; quiz.stage = "take"; return renderQuiz(); }
  const b = e.target.closest("[data-q]"); if (!b) return;
  const a = b.dataset.q;
  if (a === "start") { quiz.stage = "take"; quiz.i = 0; }
  else if (a === "next") quiz.i++;
  else if (a === "prev") quiz.i--;
  else if (a === "review") quiz.stage = "review";
  else if (a === "back") { quiz.stage = "take"; }
  else if (a === "retake") quiz = newQuiz();
  else if (a === "modules") return showView("modules");
  else if (a === "cert") return showView("certificate");
  else if (a === "submit") {
    if (quiz.submitting || Object.keys(quiz.answers).length < QUESTIONS.length) return;
    quiz.submitting = true; busy(b, true, "Submitting…");
    const score = quiz.order.filter((qi) => quiz.answers[qi] === QUESTIONS[qi].c).length;
    if (score >= PASS_MARK && !state.quizPassed) {
      state.quizPassed = true;
      try { await saveProgress(); } catch (err) { state.quizPassed = false; toast(friendlyError(err), "error"); }
    }
    quiz.stage = "result"; window.scrollTo({ top: 0, behavior: "smooth" });
  }
  renderQuiz();
};

/* ---------- certificate ---------- */
function certHTML(c) {
  const d = c.issuedAt && c.issuedAt.toDate ? c.issuedAt.toDate() : new Date(c.issuedAt || Date.now());
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `<div class="c-frame"></div><div class="c-frame2"></div>
    <span class="c-corner tl"></span><span class="c-corner tr"></span><span class="c-corner bl"></span><span class="c-corner br"></span>
    <div class="c-watermark">${logoMark(470)}</div>
    <div class="c-inner">
      <div class="c-brand">${logoMark(56)}<span>Phish<b>Aware</b></span></div>
      <div class="c-title">CERTIFICATE OF COMPLETION</div>
      <div class="c-sub">This certificate is proudly presented to</div>
      <div class="c-name">${esc(c.name)}</div><div class="c-line"></div>
      <div class="c-sub">for successfully completing the</div>
      <div class="c-prog"><span>PhishAware</span>Phishing Awareness Training Program</div>
      <div class="c-foot">
        <div class="c-col"><div class="c-val">${esc(date)}</div><div class="c-lab">Date of completion</div></div>
        <div class="c-seal">${logoMark(62)}</div>
        <div class="c-col"><div class="c-sign">PhishAware Training Team</div><div class="c-lab">Lead trainer</div></div>
      </div>
      <div class="c-verify"><b>Certificate ID:</b> ${esc(c.certId)} &nbsp;•&nbsp; <b>Verification:</b> quote this ID to the PhishAware training team to confirm authenticity.</div>
    </div>`;
}
function fitCert() {
  const stage = $("#certStage"), cert = $("#certificate"); if (!stage || !cert) return;
  const s = Math.min(1, stage.clientWidth / 1123);
  cert.style.transform = `scale(${s})`; stage.style.height = 794 * s + "px";
}
window.addEventListener("resize", fitCert);

function renderCertificate() {
  const box = $("#certBody");
  if (!state.quizPassed) {
    box.innerHTML = `<div class="glass lock-card"><div class="big">🔒</div><h2>Certificate locked</h2>
      <p class="muted" style="margin:8px 0 18px">Complete all training modules and pass the final quiz to earn your certificate.</p>
      <button class="btn btn-primary" id="certGo">${allDone() ? "Go to Final Quiz" : "Go to Training"}</button></div>`;
    $("#certGo").onclick = () => showView(allDone() ? "quiz" : "modules"); return;
  }
  if (!state.cert) {
    box.innerHTML = `<div class="glass claim"><div class="center"><span data-logo="56"></span><h2 style="margin-top:8px">Generate your certificate</h2>
      <p class="muted" style="margin:6px 0 16px">Enter your full name exactly as you want it to appear. It cannot be changed afterwards.</p></div>
      <div class="field"><label for="certName">Full name on certificate</label><input id="certName" type="text" maxlength="60" /></div>
      <p id="certMsg" class="form-msg" role="alert"></p>
      <button class="btn btn-primary full" id="certGen">Generate certificate</button></div>`;
    $$("[data-logo]", box).forEach((el) => (el.innerHTML = logoMark(+el.dataset.logo)));
    $("#certName").value = currentUser.displayName || "";
    $("#certGen").onclick = generateCertificate; return;
  }
  box.innerHTML = `<div class="cert-tools"><button class="btn btn-primary" id="certPdf">⬇ Download PDF certificate</button>
    <button class="btn btn-outline" id="certBack">Back to dashboard</button></div>
    <div id="certStage"><div id="certificate" class="cert">${certHTML(state.cert)}</div></div>`;
  $("#certPdf").onclick = downloadPdf; $("#certBack").onclick = () => showView("dashboard");
  requestAnimationFrame(fitCert);
}
async function generateCertificate() {
  const name = $("#certName").value.trim().replace(/\s+/g, " ");
  if (name.length < 3) return formMsg("certMsg", "Please enter your full name (at least 3 characters).");
  const btn = $("#certGen"); busy(btn, true, "Generating…");
  const hex = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  const certId = `PA-${hex.slice(0, 4)}-${hex.slice(4)}-${new Date().getFullYear()}`;
  try {
    await setDoc(doc(db, "certificates", currentUser.uid), { certId, name, uid: currentUser.uid, issuedAt: serverTimestamp() });
    const snap = await getDoc(doc(db, "certificates", currentUser.uid));
    state.cert = snap.data(); toast("Certificate generated!", "success"); renderCertificate();
  } catch (e) { console.error(e); formMsg("certMsg", friendlyError(e)); busy(btn, false); }
}
async function downloadPdf() {
  const btn = $("#certPdf"); busy(btn, true, "Preparing PDF…");
  try {
    await document.fonts.ready;
    const clone = $("#certificate").cloneNode(true);
    clone.removeAttribute("id"); clone.style.cssText = "position:fixed;left:-10000px;top:0;transform:none;";
    document.body.appendChild(clone);
    const canvas = await html2canvas(clone, { scale: 2, backgroundColor: "#050b1a", useCORS: true, logging: false });
    clone.remove();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`PhishAware-Certificate-${state.cert.certId}.pdf`);
    toast("Certificate downloaded!", "success");
  } catch (e) { console.error(e); toast("Could not create the PDF. Please try again.", "error"); }
  busy(btn, false);
}