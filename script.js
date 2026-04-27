function goPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

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
    const input = document.createElement("input");
    input.placeholder = `플레이어 ${i}`;
    box.appendChild(input);
  }
}

makeInputs("baramAInputs", 10);
makeInputs("baramBInputs", 10);
makeInputs("watchInputs", 12);
makeInputs("chessInputs", 8);

function makeFixedRowTeams(inputId, teamSize) {
  const inputs = [...document.querySelectorAll(`#${inputId} input`)];

  const names = inputs.map(input => input.value.trim()).filter(Boolean);

  if (names.length !== teamSize * 2) {
    alert(`${teamSize * 2}명을 모두 입력해야 합니다.`);
    return null;
  }

  const rows = [];

  for (let i = 0; i < inputs.length; i += 2) {
    const left = inputs[i].value.trim();
    const right = inputs[i + 1].value.trim();

    if (!left || !right) {
      alert("모든 줄의 좌우 플레이어를 입력해야 합니다.");
      return null;
    }

    if (Math.random() < 0.5) {
      rows.push([left, right]);
    } else {
      rows.push([right, left]);
    }
  }

  return rows;
}

function shuffleBasic(inputId, resultId, teamAName, teamBName, teamSize) {
  const rows = makeFixedRowTeams(inputId, teamSize);
  if (!rows) return;

  document.getElementById(resultId).innerHTML = `
    <div class="team-result-table">
      <div class="team-result-head">${teamAName}</div>
      <div class="team-result-head">${teamBName}</div>

      ${rows.map(row => `
        <div class="result-name">${row[0]}</div>
        <div class="result-name">${row[1]}</div>
      `).join("")}
    </div>
  `;
}

function resetTool(inputId, resultId) {
  document.querySelectorAll(`#${inputId} input`).forEach(input => {
    input.value = "";
  });

  document.getElementById(resultId).innerHTML = "";
}

function copyResult(resultId) {
  const text = document.getElementById(resultId).innerText.trim();

  if (!text) {
    alert("복사할 결과가 없습니다.");
    return;
  }

  navigator.clipboard.writeText(text);
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
  const checked = [...document.querySelectorAll(".map-check:checked")]
    .map(input => input.value);

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

function renderRankScores() {
  const box = document.getElementById("rankScores");
  box.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const row = document.createElement("div");
    row.className = "rank-row";

    row.innerHTML = `
      <strong>${i}등</strong>
      <input type="number" id="rankScore${i}" value="${defaultRankScore[i]}" oninput="calculateChessScore()">
      <span>점</span>
    `;

    box.appendChild(row);
  }
}

renderRankScores();

let chessRows = [];

function shuffleChess() {
  const rows = makeFixedRowTeams("chessInputs", 4);
  if (!rows) return;

  chessRows = rows;
  renderChessResult();
}

function renderChessResult() {
  const box = document.getElementById("chessResult");

  box.innerHTML = `
    <div class="chess-result-table">
      <div class="team-result-head">팀 A</div>
      <div class="team-result-head">팀 B</div>

      ${chessRows.map(row => `
        <div class="player-rank">
          <input value="${row[0]}" readonly>
          <select data-team="A" onchange="calculateChessScore()">
            <option value="">-</option>
            ${[1,2,3,4,5,6,7,8].map(rank => `<option value="${rank}">${rank}등</option>`).join("")}
          </select>
        </div>

        <div class="player-rank">
          <input value="${row[1]}" readonly>
          <select data-team="B" onchange="calculateChessScore()">
            <option value="">-</option>
            ${[1,2,3,4,5,6,7,8].map(rank => `<option value="${rank}">${rank}등</option>`).join("")}
          </select>
        </div>
      `).join("")}
    </div>
  `;

  calculateChessScore();
}

function calculateChessScore() {
  let teamA = 0;
  let teamB = 0;

  document.querySelectorAll("#chessResult select").forEach(select => {
    const rank = select.value;
    const team = select.dataset.team;

    if (!rank) return;

    const scoreInput = document.getElementById(`rankScore${rank}`);
    const score = Number(scoreInput.value) || 0;

    if (team === "A") teamA += score;
    if (team === "B") teamB += score;
  });

  document.getElementById("teamAScore").textContent = `${teamA}점`;
  document.getElementById("teamBScore").textContent = `${teamB}점`;
}

function resetChess() {
  document.querySelectorAll("#chessInputs input").forEach(input => {
    input.value = "";
  });

  chessRows = [];

  document.getElementById("chessResult").innerHTML = "";
  document.getElementById("teamAScore").textContent = "0점";
  document.getElementById("teamBScore").textContent = "0점";
}
