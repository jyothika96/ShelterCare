const animals = [
  { id: "PUP-001", type: "Puppy", name: "Brown Puppy", age: "3 weeks", kennel: "A1" },
  { id: "PUP-002", type: "Puppy", name: "White Puppy", age: "2 weeks", kennel: "A2" },
  { id: "KIT-001", type: "Kitten", name: "Grey Kitten", age: "3 weeks", kennel: "B1" },
  { id: "KIT-002", type: "Kitten", name: "Calico Kitten", age: "4 weeks", kennel: "B2" }
];

let schedules = [
  { animalId: "PUP-001", time: "08:00", qty: 10, notes: "Example only" },
  { animalId: "KIT-001", time: "08:30", qty: 8, notes: "Example only" },
  { animalId: "PUP-002", time: "09:00", qty: 10, notes: "Example only" }
];

let logs = [
  { time: "07:00 demo", animalId: "PUP-001", target: 10, measured: 10, result: "Sample record" },
  { time: "07:30 demo", animalId: "KIT-001", target: 8, measured: 7.8, result: "Sample record" }
];

let alerts = [
  { id: 1, title: "Example: reservoir level needs checking", detail: "Sample alert only; no sensor is connected.", open: true }
];

const $ = id => document.getElementById(id);
const getAnimal = id => animals.find(a => a.id === id);
const animalName = id => getAnimal(id)?.name || id;

function esc(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

document.querySelectorAll("[data-page]").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll("[data-page]").forEach(x => {
      x.classList.toggle("active", x === b);
    });

    document.querySelectorAll(".page").forEach(p => {
      p.classList.toggle("active", p.id === b.dataset.page);
    });

    $("title").textContent = ({
      dashboard: "Dashboard",
      animals: "Animal Registration",
      schedule: "Feeding Schedule",
      dispensing: "Dispensing Monitor",
      history: "Feeding History",
      alerts: "Alerts"
    })[b.dataset.page];
  };
});

function render() {
  $("animalCount").textContent = animals.length;
  $("scheduleCount").textContent = schedules.length;
  $("logCount").textContent = logs.length;
  $("alertCount").textContent = alerts.filter(a => a.open).length;

  $("animalCards").innerHTML = animals.map(a => `
    <article class="card">
      <div class="animalicon">${a.type === "Kitten" ? "🐱" : a.type === "Puppy" ? "🐶" : "🐾"}</div>
      <p class="id">${a.id}</p>
      <h3>${esc(a.name)}</h3>
      <p class="muted">${esc(a.type)} · ${esc(a.age)}<br>Location: ${esc(a.kennel)}</p>
      <span class="pill green">Registered</span>
    </article>
  `).join("");

  const opts = animals.map(a => `
    <option value="${a.id}">${a.id} — ${esc(a.name)}</option>
  `).join("");

  $("scheduleAnimal").innerHTML = opts;
  $("dispenseAnimal").innerHTML = opts;

  $("dashSchedules").innerHTML = schedules
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(s => `
      <div class="row">
        <div class="grow">
          <b>${s.animalId} · ${esc(animalName(s.animalId))}</b>
          <div class="muted">${s.qty} mL target · ${esc(s.notes || "No notes")}</div>
        </div>
        <b>${s.time}</b>
      </div>
    `).join("") || '<p class="muted">No schedules.</p>';

  $("scheduleRows").innerHTML = schedules.map(s => `
    <tr>
      <td>${s.animalId}</td>
      <td>${esc(animalName(s.animalId))}</td>
      <td>${s.time}</td>
      <td>${s.qty} mL</td>
      <td>${esc(s.notes || "—")}</td>
    </tr>
  `).join("") || '<tr><td colspan="5">No schedules.</td></tr>';

  $("historyRows").innerHTML = logs.slice().reverse().map(l => `
    <tr>
      <td>${esc(l.time)}</td>
      <td>${l.animalId}</td>
      <td>${l.target} mL</td>
      <td>${l.measured} mL</td>
      <td>
        <span class="pill ${l.result === "Target matched in demo" ? "green" : "orange"}">
          ${esc(l.result)}
        </span>
      </td>
    </tr>
  `).join("");

  $("alertRows").innerHTML = alerts.map(a => `
    <div class="row">
      <div class="grow">
        <b>⚠ ${esc(a.title)}</b>
        <div class="muted">${esc(a.detail)}</div>
      </div>
      ${a.open
        ? `<button class="btn secondary" onclick="ack(${a.id})">Acknowledge</button>`
        : '<span class="pill green">Acknowledged</span>'}
    </div>
  `).join("") || '<p class="muted">No alerts.</p>';
}

$("showForm").onclick = () => {
  $("formPanel").hidden = !$("formPanel").hidden;
};

$("cancel").onclick = () => {
  $("formPanel").hidden = true;
  $("animalForm").reset();
};

$("animalForm").onsubmit = e => {
  e.preventDefault();

  let type = $("species").value;
  let p = type === "Puppy" ? "PUP" : type === "Kitten" ? "KIT" : "ANI";
  let n = animals.filter(a => a.id.startsWith(p + "-")).length + 1;
  let id = p + "-" + String(n).padStart(3, "0");

  while (animals.some(a => a.id === id)) {
    n++;
    id = p + "-" + String(n).padStart(3, "0");
  }

  animals.push({
    id,
    type,
    name: $("name").value.trim() || "Unnamed animal",
    age: $("age").value.trim() || "Not entered",
    kennel: $("kennel").value.trim()
  });

  $("animalForm").reset();
  $("formPanel").hidden = true;
  render();

  alert("Demo profile created: " + id);
};

$("scheduleForm").onsubmit = e => {
  e.preventDefault();

  let qty = Number($("quantity").value);

  if (qty <= 0) return;

  schedules.push({
    animalId: $("scheduleAnimal").value,
    time: $("feedTime").value,
    qty,
    notes: $("notes").value.trim()
  });

  render();
  e.target.reset();

  alert("Demo schedule saved. Confirm real feeding quantities with a veterinarian.");
};

$("dispenseForm").onsubmit = e => {
  e.preventDefault();

  let id = $("dispenseAnimal").value;
  let measured = Number($("measured").value);
  let s = schedules.find(x => x.animalId === id);
  let target = s ? s.qty : measured;
  let ok = Math.abs(target - measured) <= 0.5;

  logs.push({
    time: new Date().toLocaleString() + " demo",
    animalId: id,
    target,
    measured,
    result: ok ? "Target matched in demo" : "Quantity mismatch in demo"
  });

  $("result").innerHTML = `
    <b>Simulation complete.</b>
    ${id}: target ${target} mL; simulated measurement ${measured} mL.<br>
    <span class="pill orange">No pump activated · No real sensor reading</span>
  `;

  if (!ok) {
    alerts.push({
      id: Date.now(),
      title: "Simulated quantity mismatch — " + id,
      detail: "Sample values differ; real hardware testing required.",
      open: true
    });
  }

  render();
};

function ack(id) {
  let a = alerts.find(x => x.id === id);

  if (a) a.open = false;

  render();
}

render();