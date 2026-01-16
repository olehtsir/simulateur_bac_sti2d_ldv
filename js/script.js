// =====================================================
// 1) COEFFICIENTS STI2D
// =====================================================
const terminales = [
    { id: "fr_ecrit", nom: "Français : écrit", coeff: 5 },
    { id: "fr_oral", nom: "Français : oral", coeff: 5 },
    { id: "philo", nom: "Philosophie", coeff: 4 },
    { id: "grand_oral", nom: "Grand oral", coeff: 14 },
    { id: "2i2d_ecrit", nom: "2I2D épreuve écrite", coeff: 9 },
    { id: "2i2d_prat", nom: "2I2D épreuve pratique", coeff: 7 },
    { id: "pcm", nom: "Physique-Chimie Maths (PCM)", coeff: 16 },
];

const ccPremiere = [
    { id: "hg_prem", nom: "Histoire-Géographie", coeff: 3 },
    { id: "emc_prem", nom: "EMC", coeff: 1 },
    { id: "lva_prem", nom: "LVA – ETLV", coeff: 3 },
    { id: "lvb_prem", nom: "LVB", coeff: 3 },
    { id: "maths_prem", nom: "Maths", coeff: 3 },
    { id: "it_prem", nom: "IT", coeff: 8 },
];

const ccTerminale = [
    { id: "hg_term", nom: "Histoire-Géographie", coeff: 3 },
    { id: "emc_term", nom: "EMC", coeff: 1 },
    { id: "lva_term", nom: "LVA – ETLV", coeff: 3 },
    { id: "lvb_term", nom: "LVB", coeff: 3 },
    { id: "maths_term", nom: "Maths", coeff: 3 },
    { id: "eps_term", nom: "EPS", coeff: 6 },
];

const allSubjects = [...terminales, ...ccPremiere, ...ccTerminale];

// =====================================================
// 2) RENDER TABLE ROW (with data-label for mobile cards)
// =====================================================
function createRow(item) {
    return `
    <tr>
      <td data-label="Matière">${item.nom}</td>
      <td data-label="Coeff"><b>${item.coeff}</b></td>
      <td data-label="Note (/20)">
        <input
          type="number"
          min="0"
          max="20"
          step="0.5"
          data-id="${item.id}"
          data-coeff="${item.coeff}"
          placeholder="ex: 12"
        />
      </td>
      <td data-label="Points" id="pts-${item.id}">0</td>
    </tr>
  `;
}

document.getElementById("terminales-body").innerHTML = terminales
    .map(createRow)
    .join("");
document.getElementById("premiere-body").innerHTML = ccPremiere
    .map(createRow)
    .join("");
document.getElementById("cc-terminale-body").innerHTML = ccTerminale
    .map(createRow)
    .join("");

// =====================================================
// 3) LOCAL STORAGE
// =====================================================
const STORAGE_NOTES = "sti2d_notes_v2";
const STORAGE_THEME = "sti2d_theme_v2";
const STORAGE_HISTORY = "sti2d_history_v1";

function saveNotes() {
    const inputs = document.querySelectorAll('input[type="number"]');
    const data = {};
    inputs.forEach((input) => (data[input.dataset.id] = input.value));
    localStorage.setItem(STORAGE_NOTES, JSON.stringify(data));
}

function loadNotes() {
    const raw = localStorage.getItem(STORAGE_NOTES);
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach((input) => {
            if (data[input.dataset.id] !== undefined)
                input.value = data[input.dataset.id];
        });
    } catch (e) {}
}

function saveTheme(isDark) {
    localStorage.setItem(STORAGE_THEME, isDark ? "dark" : "light");
}

function loadTheme() {
    const t = localStorage.getItem(STORAGE_THEME);
    const btn = document.getElementById("btn-theme");

    if (t === "dark") {
        document.body.classList.add("dark");
        btn.textContent = "☀️ Light";
    } else {
        document.body.classList.remove("dark");
        btn.textContent = "🌙 Dark";
    }
}

// =====================================================
// 4) UTILS
// =====================================================
function clampNote(value) {
    if (isNaN(value)) return 0;
    if (value < 0) return 0;
    if (value > 20) return 20;
    return value;
}

function calcPoints(note, coeff) {
    return note * coeff;
}

function getMention(moyenne) {
    if (moyenne < 8) return "Refusé";
    if (moyenne < 10) return "Rattrapage";
    if (moyenne < 12) return "Admis (sans mention)";
    if (moyenne < 14) return "Mention Assez Bien";
    if (moyenne < 16) return "Mention Bien";
    return "Mention Très Bien";
}

// Next milestone: how many points needed for next average
function nextObjective(totalPoints) {
    const seuils = [8, 10, 12, 14, 16];
    const moy = totalPoints / 100;

    for (let s of seuils) {
        if (moy < s) {
            const missing = Math.ceil(s * 100 - totalPoints);
            return { targetMoy: s, missingPoints: missing };
        }
    }
    return null;
}

// =====================================================
// 5) FUN CONFETTI (no libs)
// =====================================================
let lastMention = "";
function launchConfetti() {
    const count = 40;
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");
        piece.style.position = "absolute";
        piece.style.width = "10px";
        piece.style.height = "10px";
        piece.style.borderRadius = "3px";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.top = "-20px";
        piece.style.background = `hsl(${Math.random() * 360}, 90%, 60%)`;
        piece.style.opacity = "0.9";

        const duration = 1400 + Math.random() * 1600;
        const moveX = Math.random() * 200 - 100;

        piece.animate(
            [
                { transform: "translate(0, 0) rotate(0deg)" },
                {
                    transform: `translate(${moveX}px, 110vh) rotate(${360 + Math.random() * 360}deg)`,
                },
            ],
            { duration, easing: "ease-out" },
        );

        container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 2400);
}

// =====================================================
// 6) MAIN CALC
// =====================================================
function calculateAll() {
    const inputs = document.querySelectorAll('input[type="number"]');

    let totalTerminales = 0;
    let totalCC = 0;

    const pointsById = {}; // for objectif tool

    inputs.forEach((input) => {
        const id = input.dataset.id;
        const coeff = Number(input.dataset.coeff);

        let note = Number(input.value);

        // input validation
        if (input.value !== "" && (isNaN(note) || note < 0 || note > 20)) {
            input.classList.add("input-bad");
        } else {
            input.classList.remove("input-bad");
        }

        note = clampNote(note);

        const pts = calcPoints(note, coeff);
        pointsById[id] = pts;

        document.getElementById("pts-" + id).textContent = pts.toFixed(1);

        const isTerminal = terminales.some((x) => x.id === id);
        if (isTerminal) totalTerminales += pts;
        else totalCC += pts;
    });

    const totalGeneral = totalTerminales + totalCC;
    const moyenne = totalGeneral / 100;
    const mention = getMention(moyenne);

    // Update UI
    document.getElementById("total-terminales").textContent =
        totalTerminales.toFixed(1);
    document.getElementById("total-cc").textContent = totalCC.toFixed(1);
    document.getElementById("total-general").textContent =
        totalGeneral.toFixed(1);
    document.getElementById("moyenne").textContent = moyenne.toFixed(2);
    document.getElementById("mention").textContent = mention;

    // Mobile bar
    document.getElementById("mobile-moy").textContent = moyenne.toFixed(2);
    document.getElementById("mobile-men").textContent = mention;

    // Progress
    const percent = Math.max(0, Math.min(100, (totalGeneral / 2000) * 100));
    document.getElementById("progress-fill").style.width =
        percent.toFixed(0) + "%";
    document.getElementById("progress-text").textContent =
        percent.toFixed(0) + "%";

    // Coach messages
    const coach = document.getElementById("coach-text");
    const obj = nextObjective(totalGeneral);

    // Missing “big” subjects warning
    const bigIds = ["pcm", "grand_oral", "2i2d_ecrit", "2i2d_prat"];
    const missingBig = bigIds.filter((id) => {
        const input = document.querySelector(`input[data-id="${id}"]`);
        return input && input.value.trim() === "";
    });

    if (moyenne === 0) {
        coach.textContent = "Entre tes notes 😄 Je calcule tout en direct.";
    } else if (moyenne < 8) {
        coach.textContent =
            `😬 Pour l'instant c'est compliqué… (${moyenne.toFixed(2)}/20). ` +
            `Priorité: PCM + Grand oral + 2I2D.`;
    } else if (moyenne < 10) {
        coach.textContent = `🛟 Zone rattrapage. Tu peux passer au-dessus de 10 avec un boost sur les grosses coeff.`;
    } else if (moyenne < 12) {
        coach.textContent = `✅ Tu es admis ! Si tu veux une mention, vise PCM (16) et Grand oral (14).`;
    } else if (moyenne < 14) {
        coach.textContent = `🔥 Mention Assez Bien proche. Continue, tu peux viser "Bien".`;
    } else if (moyenne < 16) {
        coach.textContent = `🚀 Mention Bien ! Très solide. Pour "Très Bien", optimise les grosses épreuves.`;
    } else {
        coach.textContent = `👑 Très Bien ! T’es une machine 😎🔥`;
    }

    if (obj && obj.missingPoints > 0) {
        coach.textContent += `  🎯 Il te manque ~${obj.missingPoints} points pour viser ${obj.targetMoy}/20.`;
    } else if (!obj && moyenne >= 16) {
        coach.textContent += `  🎉 Objectif max atteint.`;
    }

    if (missingBig.length > 0) {
        coach.textContent += `  ⚠️ Tu n’as pas rempli: ${missingBig.join(", ")} (matières importantes).`;
    }

    // Confetti only when getting "Très Bien" the first time
    if (
        mention === "Mention Très Bien" &&
        lastMention !== "Mention Très Bien"
    ) {
        launchConfetti();
    }
    lastMention = mention;

    // Save
    saveNotes();

    // Return useful data
    return { totalGeneral, moyenne, mention, pointsById };
}

// =====================================================
// 7) OBJECTIF TOOL
// =====================================================
function fillSubjectSelect() {
    const select = document.getElementById("subject-select");
    select.innerHTML = "";

    allSubjects.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${s.nom} (coeff ${s.coeff})`;
        select.appendChild(opt);
    });
}

function calculateObjectif() {
    const { totalGeneral, pointsById } = calculateAll();

    const target = Number(document.getElementById("target-select").value);
    const subjectId = document.getElementById("subject-select").value;
    const subject = allSubjects.find((x) => x.id === subjectId);

    const targetPoints = target * 100; // because moyenne = points/100
    const currentSubjectPts = pointsById[subjectId] || 0;

    // points without selected subject
    const without = totalGeneral - currentSubjectPts;

    // required points on subject
    const requiredPointsOnSubject = targetPoints - without;

    // required note
    const requiredNote = requiredPointsOnSubject / subject.coeff;

    const box = document.getElementById("objectif-result");

    if (targetPoints <= totalGeneral) {
        box.textContent = `✅ Objectif déjà atteint ! Tu es déjà à ${(totalGeneral / 100).toFixed(2)}/20.`;
        return;
    }

    if (requiredNote > 20) {
        box.textContent =
            `❌ Objectif difficile avec juste "${subject.nom}". ` +
            `Il faudrait environ ${requiredNote.toFixed(2)}/20 (impossible). ` +
            `Essayez d'améliorer plusieurs matières.`;
        return;
    }

    if (requiredNote <= 0) {
        box.textContent = `✅ Même avec 0/20 sur ${subject.nom}, tu atteins déjà l’objectif (rare 😄).`;
        return;
    }

    box.textContent =
        `🎯 Pour viser ${target}/20, il te faudrait environ ` +
        `${requiredNote.toFixed(2)}/20 sur "${subject.nom}".`;
}

// =====================================================
// 8) COPY / EXPORT / IMPORT
// =====================================================
async function copyResume() {
    const { totalGeneral, moyenne, mention } = calculateAll();

    const text = `📌 Simulateur BAC STI2D
Total: ${totalGeneral.toFixed(1)} / 2000 points
Moyenne: ${moyenne.toFixed(2)} / 20
Mention: ${mention}
➡️ ${location.href}`;

    try {
        await navigator.clipboard.writeText(text);
        alert("✅ Résumé copié !");
    } catch (e) {
        // fallback
        prompt("Copie le texte:", text);
    }
}

function exportJSON() {
    const raw = localStorage.getItem(STORAGE_NOTES) || "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "notes-sti2d.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}

function importJSONFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            const inputs = document.querySelectorAll('input[type="number"]');

            inputs.forEach((input) => {
                if (data[input.dataset.id] !== undefined)
                    input.value = data[input.dataset.id];
            });

            saveNotes();
            calculateAll();
            alert("✅ Import réussi !");
        } catch (e) {
            alert("❌ Fichier invalide.");
        }
    };
    reader.readAsText(file);
}

// =====================================================
// 9) HISTORY
// =====================================================
function loadHistory() {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveHistory(list) {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(list));
}

function renderHistory() {
    const list = loadHistory();
    const box = document.getElementById("history-list");

    if (list.length === 0) {
        box.innerHTML = `<div class="muted tiny">Aucun résultat sauvegardé pour l’instant.</div>`;
        return;
    }

    box.innerHTML = list
        .slice()
        .reverse()
        .map((item) => {
            return `
        <div class="history-item">
          <div class="history-left">
            <div class="history-title">${item.moyenne.toFixed(2)}/20 • ${item.mention}</div>
            <div class="history-sub">${item.date} • ${item.points.toFixed(1)} / 2000</div>
          </div>
          <div><b>${item.tag}</b></div>
        </div>
      `;
        })
        .join("");
}

function addToHistory() {
    const { totalGeneral, moyenne, mention } = calculateAll();
    if (moyenne === 0) {
        alert("Ajoute d'abord des notes 🙂");
        return;
    }

    const list = loadHistory();
    const now = new Date();
    const date = now.toLocaleString("fr-FR");

    list.push({
        date,
        points: totalGeneral,
        moyenne,
        mention,
        tag: "Sauvegarde",
    });

    // limit to 15
    const limited = list.slice(-15);
    saveHistory(limited);
    renderHistory();

    alert("✅ Ajouté à l’historique !");
}

function clearHistory() {
    localStorage.removeItem(STORAGE_HISTORY);
    renderHistory();
}

// =====================================================
// 10) BUTTONS
// =====================================================
function resetAll() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach((input) => (input.value = ""));
    saveNotes();
    calculateAll();
}

function fillExample() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach((input) => {
        const random = 9 + Math.random() * 7; // 9..16
        const rounded = Math.round(random * 2) / 2; // step 0.5
        input.value = rounded.toString();
    });
    calculateAll();
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    saveTheme(isDark);
    document.getElementById("btn-theme").textContent = isDark
        ? "☀️ Light"
        : "🌙 Dark";
}

// Scroll helpers
function scrollToResult() {
    document
        .getElementById("result-section")
        .scrollIntoView({ behavior: "smooth" });
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// =====================================================
// 11) EVENTS
// =====================================================
document.getElementById("btn-calc").addEventListener("click", calculateAll);
document.getElementById("btn-reset").addEventListener("click", resetAll);
document.getElementById("btn-example").addEventListener("click", fillExample);

document.getElementById("btn-theme").addEventListener("click", toggleTheme);

document
    .getElementById("btn-objectif")
    .addEventListener("click", calculateObjectif);

document.getElementById("btn-copy").addEventListener("click", copyResume);
document.getElementById("btn-export").addEventListener("click", exportJSON);

document.getElementById("btn-import").addEventListener("click", () => {
    document.getElementById("import-file").click();
});
document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) importJSONFile(file);
});

document
    .getElementById("btn-save-history")
    .addEventListener("click", addToHistory);
document
    .getElementById("btn-clear-history")
    .addEventListener("click", clearHistory);

document
    .getElementById("btn-scroll-top")
    .addEventListener("click", scrollToTop);
document
    .getElementById("btn-scroll-result")
    .addEventListener("click", scrollToResult);

// Auto-calc when typing
document.addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]')) {
        calculateAll();
    }
});

// =====================================================
// 12) INIT
// =====================================================
loadTheme();
loadNotes();
fillSubjectSelect();
renderHistory();
calculateAll();
