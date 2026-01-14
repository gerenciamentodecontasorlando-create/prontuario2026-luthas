import { DB } from "./db.js";
import { RX_CATEGORIES, RX_PRESETS } from "./presets.js";
import { docPrescription, docSimple, docScheduleDay } from "./docs.js";

const $ = (id) => document.getElementById(id);

const state = {
  dateISO: new Date().toISOString().slice(0,10),
  selectedApptId: null,
  selectedPatientId: null,
  rxCategory: "analgesicos"
};

function toast(msg){
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2000);
}

function fmtDate(iso){
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"2-digit", year:"numeric" });
}

function setAutosave(text="autosave"){
  $("autosaveState").textContent = text;
}

async function loadProfessional(){
  const pro = await DB.getMeta("professional", null);
  if(pro){
    $("proName").value = pro.name || "";
    $("proReg").value = pro.reg || "";
    $("proPhone").value = pro.phone || "";
    $("proAddr").value = pro.addr || "";
  }
}

async function saveProfessional(){
  const pro = {
    name: $("proName").value.trim(),
    reg: $("proReg").value.trim(),
    phone: $("proPhone").value.trim(),
    addr: $("proAddr").value.trim()
  };
  await DB.setMeta("professional", pro);
  $("proSavedState").textContent = "salvo ✓";
  setTimeout(()=> $("proSavedState").textContent="", 1200);
  toast("Dados do profissional salvos.");
}

function renderRxCategories(){
  const wrap = $("rxCategories");
  wrap.innerHTML = "";
  for(const c of RX_CATEGORIES){
    const b = document.createElement("button");
    b.className = "chip" + (state.rxCategory===c.id ? " active" : "");
    b.textContent = c.label;
    b.onclick = () => { state.rxCategory = c.id; renderRxCategories(); renderRxPresets(); };
    wrap.appendChild(b);
  }
}

function appendRx(text){
  const t = $("rxText");
  t.value = (t.value ? t.value.trimEnd() + "\n\n" : "") + text;
}

function renderRxPresets(){
  const wrap = $("rxPresets");
  wrap.innerHTML = "";
  const items = RX_PRESETS[state.rxCategory] || [];
  for(const p of items){
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = p.label;
    b.onclick = () => appendRx(p.text);
    wrap.appendChild(b);
  }
}

async function refreshAgenda(){
  $("datePicker").value = state.dateISO;
  $("dayTitle").textContent = "Dia — " + fmtDate(state.dateISO);

  const appts = await DB.getAllByIndex("appointments","date", state.dateISO);
  appts.sort((a,b) => a.time.localeCompare(b.time));

  const patients = await DB.getAll("patients");
  const pmap = new Map(patients.map(p => [p.id, p]));

  const ul = $("agendaList");
  ul.innerHTML = "";

  for(const a of appts){
    const p = pmap.get(a.patientId) || {name:"(sem nome)", phone:""};
    const li = document.createElement("li");
    if(a.id === state.selectedApptId) li.classList.add("active");

    const meta = document.createElement("div");
    meta.className = "meta";

    const strong = document.createElement("strong");
    strong.textContent = `${a.time} — ${p.name}`;

    const span = document.createElement("span");
    span.textContent = `${p.phone || ""} ${a.status ? "• "+a.status : ""}`.trim();

    meta.appendChild(strong);
    meta.appendChild(span);

    const actions = document.createElement("div");
    actions.className = "actions";

    const btnOpen = document.createElement("button");
    btnOpen.className = "ghost";
    btnOpen.textContent = "Abrir";
    btnOpen.onclick = async () => selectAppointment(a.id);

    const btnDel = document.createElement("button");
    btnDel.className = "ghost";
    btnDel.textContent = "Remover";
    btnDel.onclick = async () => {
      await DB.del("appointments", a.id);
      if(state.selectedApptId === a.id){
        state.selectedApptId = null;
        state.selectedPatientId = null;
      }
      toast("Item removido.");
      refreshAgenda();
    };

    actions.appendChild(btnOpen);
    actions.appendChild(btnDel);

    li.appendChild(meta);
    li.appendChild(actions);
    ul.appendChild(li);
  }
}

async function selectAppointment(apptId){
  const appt = await DB.get("appointments", apptId);
  if(!appt) return;

  state.selectedApptId = apptId;
  state.selectedPatientId = appt.patientId;

  const patient = await DB.get("patients", appt.patientId);
  $("patientName").value = patient?.name || "";
  $("patientPhone").value = patient?.phone || "";
  $("patientDob").value = patient?.dob || "";

  const encounterId = `enc_${apptId}`;
  const enc = await DB.get("encounters", encounterId);

  $("clinicalNotes").value = enc?.notes || "";
  $("rxText").value = enc?.rxText || "";

  setAutosave("carregado");
  refreshAgenda();
}

async function ensurePatientFromInputs(){
  const name = $("patientName").value.trim();
  const phone = $("patientPhone").value.trim();
  const dob = $("patientDob").value;

  if(!name) throw new Error("Informe o nome do paciente (ou selecione na agenda).");

  const all = await DB.getAll("patients");
  let found = all.find(p => (p.name||"").toLowerCase() === name.toLowerCase() && (p.phone||"") === phone);

  if(found){
    found = { ...found, name, phone, dob };
    await DB.put("patients", found);
    return found.id;
  }

  if(state.selectedPatientId){
    const p = await DB.get("patients", state.selectedPatientId);
    if(p){
      const upd = { ...p, name, phone, dob };
      await DB.put("patients", upd);
      return upd.id;
    }
  }

  const id = DB.uid("pat");
  await DB.put("patients", { id, name, phone, dob, createdAt: new Date().toISOString() });
  return id;
}

async function addToDay(){
  const time = $("timeInput").value || "08:00";
  const query = $("searchPatient").value.trim();

  let patientId = null;

  if(query){
    const all = await DB.getAll("patients");
    const q = query.toLowerCase();
    const hit = all.find(p => (p.name||"").toLowerCase().includes(q) || (p.phone||"").includes(q));
    if(hit) patientId = hit.id;
  }

  if(!patientId){
    patientId = await ensurePatientFromInputs();
  }

  const appt = {
    id: DB.uid("apt"),
    date: state.dateISO,
    time,
    patientId,
    status: "agendado",
    createdAt: new Date().toISOString()
  };

  await DB.put("appointments", appt);
  toast("Adicionado na agenda do dia.");
  refreshAgenda();
}

async function saveEncounter(){
  if(!state.selectedApptId){
    toast("Selecione um item na agenda (Abrir) para salvar o atendimento vinculado.");
    return;
  }

  const appt = await DB.get("appointments", state.selectedApptId);
  if(!appt) return;

  const patientId = await ensurePatientFromInputs();
  appt.patientId = patientId;
  await DB.put("appointments", appt);

  const encounterId = `enc_${appt.id}`;
  const enc = {
    id: encounterId,
    patientId,
    date: appt.date,
    apptId: appt.id,
    notes: $("clinicalNotes").value || "",
    rxText: $("rxText").value || "",
    updatedAt: new Date().toISOString()
  };

  await DB.put("encounters", enc);
  setAutosave("salvo ✓");
  toast("Atendimento salvo.");
  refreshAgenda();
}

function clearEncounter(){
  $("clinicalNotes").value = "";
  $("rxText").value = "";
  setAutosave("limpo");
}

async function exportBackup(){
  const data = await DB.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `BTX-Pront-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Backup exportado.");
}

async function importBackup(file){
  const text = await file.text();
  const json = JSON.parse(text);
  await DB.importAll(json);
  toast("Backup importado.");
  await loadProfessional();
  await refreshAgenda();
}

function shiftDay(delta){
  const d = new Date(state.dateISO + "T00:00:00");
  d.setDate(d.getDate() + delta);
  state.dateISO = d.toISOString().slice(0,10);
  refreshAgenda();
}

async function init(){
  $("storageState").textContent = "offline";

  $("datePicker").value = state.dateISO;
  $("datePicker").addEventListener("change", (e) => {
    state.dateISO = e.target.value;
    refreshAgenda();
  });

  $("btnPrevDay").onclick = () => shiftDay(-1);
  $("btnNextDay").onclick = () => shiftDay(1);
  $("btnToday").onclick = () => {
    state.dateISO = new Date().toISOString().slice(0,10);
    refreshAgenda();
  };

  $("btnAddToDay").onclick = addToDay;

  $("btnNewPatient").onclick = async () => {
    state.selectedPatientId = null;
    state.selectedApptId = null;
    $("patientName").value = "";
    $("patientPhone").value = "";
    $("patientDob").value = "";
    clearEncounter();
    toast("Novo paciente (preencha os campos).");
    refreshAgenda();
  };

  $("btnSaveEncounter").onclick = saveEncounter;
  $("btnClearEncounter").onclick = clearEncounter;

  // autosave leve (quando digitando e com atendimento selecionado)
  let t;
  function scheduleAutosave(){
    clearTimeout(t);
    t = setTimeout(async () => {
      if(!state.selectedApptId) return;
      try{ await saveEncounter(); } catch(e){ /* silêncio */ }
    }, 1200);
    setAutosave("digitando…");
  }
  $("clinicalNotes").addEventListener("input", scheduleAutosave);
  $("rxText").addEventListener("input", scheduleAutosave);

  renderRxCategories();
  renderRxPresets();

  $("btnRxClear").onclick = () => {
    $("rxText").value = "";
    toast("Receita limpa.");
  };

  $("btnDocPrescription").onclick = async () => {
    const patientName = $("patientName").value.trim();
    await docPrescription({ patientName, rxText: $("rxText").value || "" });
  };

  $("btnDocAttest").onclick = async () => {
    await docSimple({
      title:"Atestado",
      patientName: $("patientName").value.trim(),
      bodyText:"Atesto para os devidos fins que o(a) paciente acima identificado(a) esteve em atendimento nesta data, necessitando de ____ dias de afastamento."
    });
  };

  $("btnDocReceipt").onclick = async () => {
    await docSimple({
      title:"Recibo",
      patientName: $("patientName").value.trim(),
      bodyText:"Recebi do(a) paciente acima identificado(a) a quantia de R$ ______ referente a ____________________________."
    });
  };

  $("btnDocReport").onclick = async () => {
    await docSimple({
      title:"Laudo",
      patientName: $("patientName").value.trim(),
      bodyText:"Descrição / achados / conclusão:\n\n_____________________________________________"
    });
  };

  $("btnDocEstimate").onclick = async () => {
    await docSimple({
      title:"Orçamento",
      patientName: $("patientName").value.trim(),
      bodyText:"Procedimentos / itens:\n- ______________________ (R$ ______)\n- ______________________ (R$ ______)\n\nTotal: R$ ______"
    });
  };

  $("btnDocSchedule").onclick = async () => {
    const appts = await DB.getAllByIndex("appointments","date", state.dateISO);
    const patients = await DB.getAll("patients");
    const pmap = new Map(patients.map(p => [p.id, p]));

    const items = appts
      .sort((a,b)=>a.time.localeCompare(b.time))
      .map(a => ({
        time: a.time,
        status: a.status,
        patientName: (pmap.get(a.patientId)?.name || "(sem nome)")
      }));

    await docScheduleDay({ dateISO: state.dateISO, items });
  };

  $("btnSavePro").onclick = saveProfessional;

  $("btnExport").onclick = exportBackup;
  $("btnImport").onclick = () => $("fileImport").click();

  $("fileImport").addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if(!f) return;
    try{ await importBackup(f); }
    catch(err){ toast("Erro ao importar: " + err.message); }
    e.target.value = "";
  });

  await loadProfessional();
  await refreshAgenda();

  // PWA
  if("serviceWorker" in navigator){
    try{
      await navigator.serviceWorker.register("./service-worker.js");
    }catch(e){
      // ok
    }
  }
}

init();
