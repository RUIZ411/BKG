import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfxJeko53d10OcJZps3my5Fm7XF_2fDtc",
  authDomain: "bkg-chess.firebaseapp.com",
  databaseURL: "https://bkg-chess-default-rtdb.firebaseio.com",
  projectId: "bkg-chess",
  storageBucket: "bkg-chess.firebasestorage.app",
  messagingSenderId: "379861379276",
  appId: "1:379861379276:web:bf48aa09710d0c77223a69",
  measurementId: "G-EN9D9XZBBP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function goPage(id) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function toggleTheme() {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.textContent = isLight ? "🌙 다크모드" : "☀️ 라이트모드";
  });
}

function makeInputs(id, count) {
  const box = document.getElementById(id);
  box.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const slot = document.createElement("div");
    slot.className = "player-slot";

    slot.innerHTML = `
      <input class="player-name" placeholder="플레이어 ${i}">
      <select class="player-role">
        <option value="탱커">탱커</option>
        <option value="딜러">딜러</option>
        <option value="힐러">힐러</option>
      </select>
    `;

    box.appendChild(slot);
  }
}

makeInputs("baramAInputs", 10);
makeInputs("baramBInputs", 10);
makeInputs("watchInputs", 12);
makeInputs("chessInputs", 8);

function makeFixedRowTeams(inputId, teamSize) {
  const slots = [...document.querySelectorAll(`#${inputId} .player-slot`)];

  const filled = slots.filter(slot => slot.querySelector(".player-name").value.trim());

  if (filled.length !== teamSize * 2) {
    alert(`${teamSize * 2}명을 모두 입력해야 합니다.`);
    return null;
  }

  const rows = [];

  for (let i = 0; i < slots.length; i += 2) {
    const leftName = slots[i].querySelector(".player-name").value.trim();
    const leftRole = slots[i].querySelector(".player-role").value;
    const rightName = slots[i + 1].querySelector(".player-name").value.trim();
    const rightRole = slots[i + 1].querySelector(".player-role").value;

    if (!leftName || !rightName) {
      alert("모든 줄의 좌우 플레이어를 입력해야 합니다.");
      return null;
    }

    const left = { name: leftName, role: leftRole };
    const right = { name: rightName, role: rightRole };

    rows.push(Math.random() < 0.5 ? [left, right] : [right, left]);
  }

  return rows;
}

function displayPlayer(player) {
  if (typeof player === "string") return player;
  return `${player.name} (${player.role})`;
}

function shuffleBasic(inputId, resultId, teamAName, teamBName, teamSize) {
  const rows = makeFixedRowTeams(inputId, teamSize);
  if (!rows) return;

  document.getElementById(resultId).innerHTML = `
    <div class="team-result-table">
      <div class="team-result-head">${teamAName}</div>
      <div class="team-result-head">${teamBName}</div>
      ${rows.map(row => `
        <div class="result-name">${displayPlayer(row[0])}</div>
        <div class="result-name">${displayPlayer(row[1])}</div>
      `).join("")}
    </div>
  `;
}

function resetTool(inputId, resultId) {
  document.querySelectorAll(`#${inputId} .player-name`).forEach(input => input.value = "");
  document.querySelectorAll(`#${inputId} .player-role`).forEach(select => select.value = "탱커");
  document.getElementById(resultId).innerHTML = "";
}

function copyResult(resultId) {
  const resultBox = document.getElementById(resultId);

  if (!resultBox || !resultBox.innerText.trim()) {
    alert("복사할 결과가 없습니다.");
    return;
  }

  const heads = [...resultBox.querySelectorAll(".team-result-head")].map(el => el.innerText.trim());
  const names = [...resultBox.querySelectorAll(".result-name")].map(el => el.innerText.trim());

  if (heads.length >= 2 && names.length >= 2) {
    let copyText = `${heads[0]}\t${heads[1]}\n`;

    for (let i = 0; i < names.length; i += 2) {
      copyText += `${names[i] || ""}\t${names[i + 1] || ""}\n`;
    }

    navigator.clipboard.writeText(copyText.trim());
    alert("복사되었습니다.");
    return;
  }

  const chessInputs = [...resultBox.querySelectorAll(".player-rank input")].map(input => input.value.trim());

  if (heads.length >= 2 && chessInputs.length >= 2) {
    let copyText = `${heads[0]}\t${heads[1]}\n`;

    for (let i = 0; i < chessInputs.length; i += 2) {
      copyText += `${chessInputs[i] || ""}\t${chessInputs[i + 1] || ""}\n`;
    }

    navigator.clipboard.writeText(copyText.trim());
    alert("복사되었습니다.");
    return;
  }

  navigator.clipboard.writeText(resultBox.innerText.trim());
  alert("복사되었습니다.");
}

const maps = {
  "쟁탈": ["네팔", "리장타워", "부산", "오아시스", "일리오스", "남극반도"],
  "호위": ["66번 국도", "지브롤터", "도라도", "쓰레기촌", "리알토", "샴발리", "하바나"],
  "혼합": ["눔바니", "아이헨발데", "왕의 길", "할리우드", "미드타운", "블리자드월드", "파라이수"],
  "밀기": ["뉴 퀸 스트리트", "이스페란사", "콜로세오", "루나시피"],
  "플래시포인트": ["뉴 정크시티", "수라바사", "아틀리스"]
};

const mzMaps = [
  "남극반도",
  "리알토", "샴발리", "하바나",
  "미드타운", "블리자드월드", "파라이수",
  "뉴 퀸 스트리트", "이스페란사", "콜로세오", "루나시피",
  "뉴 정크시티", "수라바사", "아틀리스"
];

function renderMaps() {
  const box = document.getElementById("mapBox");
  box.innerHTML = "";

  Object.entries(maps).forEach(([category, list]) => {
    const wrap = document.createElement("div");
    wrap.className = "map-category";

    wrap.innerHTML = `
      <h4>
        <label>
          <input type="checkbox" checked class="category-check">
          ${category}
        </label>
      </h4>
      <div class="map-items">
        ${list.map(map => `
          <label>
            <input type="checkbox" checked value="${map}" class="map-check">
            <span class="${mzMaps.includes(map) ? "mz-map" : ""}">${map}</span>
          </label>
        `).join("")}
      </div>
    `;

    const categoryCheck = wrap.querySelector(".category-check");
    categoryCheck.addEventListener("change", () => {
      wrap.querySelectorAll(".map-check").forEach(check => {
        check.checked = categoryCheck.checked;
      });
    });

    box.appendChild(wrap);
  });
}

renderMaps();

function drawMap() {
  const checked = [...document.querySelectorAll(".map-check:checked")].map(input => input.value);

  if (checked.length === 0) {
    alert("추첨할 맵을 최소 1개 이상 선택해주세요.");
    return;
  }

  const picked = checked[Math.floor(Math.random() * checked.length)];
  const pickedMap = document.getElementById("pickedMap");

  pickedMap.textContent = picked;
  pickedMap.className = mzMaps.includes(picked) ? "mz-map" : "";
}

const defaultRankScore = {
  1: 10,
  2: 8,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1
};

let chessRows = [];
let chessRanks = {};
let chessRankScores = { ...defaultRankScore };

function renderRankScores() {
  const box = document.getElementById("rankScores");
  box.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const row = document.createElement("div");
    row.className = "rank-row";

    row.innerHTML = `
      <strong>${i}등</strong>
      <input type="number" id="rankScore${i}" value="${chessRankScores[i] ?? defaultRankScore[i]}" oninput="saveRankScores()">
      <span>점</span>
    `;

    box.appendChild(row);
  }
}

function saveRankScores() {
  const scores = {};

  for (let i = 1; i <= 8; i++) {
    const input = document.getElementById(`rankScore${i}`);
    scores[i] = Number(input.value) || 0;
  }

  set(ref(db, "gongchess/rankScores"), scores);
}

function shuffleChess() {
  const rows = makeFixedRowTeams("chessInputs", 4);
  if (!rows) return;

  set(ref(db, "gongchess/rows"), rows);
  set(ref(db, "gongchess/ranks"), {});
}

function renderChessResult() {
  const box = document.getElementById("chessResult");

  if (!chessRows || chessRows.length === 0) {
    box.innerHTML = "";
    calculateChessScore();
    return;
  }

  box.innerHTML = `
    <div class="chess-result-table">
      <div class="team-result-head">팀 A</div>
      <div class="team-result-head">팀 B</div>

      ${chessRows.map((row, rowIndex) => `
        <div class="player-rank">
          <input value="${displayPlayer(row[0])}" readonly>
          <select data-team="A" data-row="${rowIndex}" onchange="saveChessRank(this)">
            <option value="">-</option>
            ${[1,2,3,4,5,6,7,8].map(rank => `
              <option value="${rank}" ${String(chessRanks?.[rowIndex]?.A || "") === String(rank) ? "selected" : ""}>${rank}등</option>
            `).join("")}
          </select>
        </div>

        <div class="player-rank">
          <input value="${displayPlayer(row[1])}" readonly>
          <select data-team="B" data-row="${rowIndex}" onchange="saveChessRank(this)">
            <option value="">-</option>
            ${[1,2,3,4,5,6,7,8].map(rank => `
              <option value="${rank}" ${String(chessRanks?.[rowIndex]?.B || "") === String(rank) ? "selected" : ""}>${rank}등</option>
            `).join("")}
          </select>
        </div>
      `).join("")}
    </div>
  `;

  calculateChessScore();
}

function saveChessRank(select) {
  set(ref(db, `gongchess/ranks/${select.dataset.row}/${select.dataset.team}`), select.value);
}

function calculateChessScore() {
  let teamA = 0;
  let teamB = 0;

  document.querySelectorAll("#chessResult select").forEach(select => {
    const rank = select.value;
    const team = select.dataset.team;

    if (!rank) return;

    const score = Number(chessRankScores[rank]) || 0;

    if (team === "A") teamA += score;
    if (team === "B") teamB += score;
  });

  document.getElementById("teamAScore").textContent = `${teamA}점`;
  document.getElementById("teamBScore").textContent = `${teamB}점`;
}

function resetChess() {
  document.querySelectorAll("#chessInputs .player-name").forEach(input => input.value = "");
  document.querySelectorAll("#chessInputs .player-role").forEach(select => select.value = "탱커");

  set(ref(db, "gongchess/rows"), []);
  set(ref(db, "gongchess/ranks"), {});
}

renderRankScores();

onValue(ref(db, "gongchess/rows"), snapshot => {
  chessRows = snapshot.val() || [];
  renderChessResult();
});

onValue(ref(db, "gongchess/ranks"), snapshot => {
  chessRanks = snapshot.val() || {};
  renderChessResult();
});

onValue(ref(db, "gongchess/rankScores"), snapshot => {
  chessRankScores = snapshot.val() || { ...defaultRankScore };
  renderRankScores();
  calculateChessScore();
});

window.goPage = goPage;
window.toggleTheme = toggleTheme;
window.shuffleBasic = shuffleBasic;
window.resetTool = resetTool;
window.copyResult = copyResult;
window.drawMap = drawMap;
window.shuffleChess = shuffleChess;
window.resetChess = resetChess;
window.calculateChessScore = calculateChessScore;
window.saveChessRank = saveChessRank;
window.saveRankScores = saveRankScores;
