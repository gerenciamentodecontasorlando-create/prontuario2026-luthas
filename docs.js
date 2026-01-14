// BTX-Pront — Documentos: HTML + Print (Salvar em PDF)
import { DB } from "./db.js";

function esc(s=""){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function baseDocCSS(){
  return `
  <style>
    *{ box-sizing:border-box; }
    body{ margin:0; font-family: Arial, sans-serif; color:#000; }
    .page{ width:210mm; min-height:297mm; padding:14mm; }
    .frame{
      border:1px solid #111;
      padding:10mm;
      min-height:270mm;
      position:relative;
    }
    .brand{
      position:absolute; left:10mm; top:8mm;
      font-size:10px; opacity:.35;
    }
    .watermark{
      position:absolute; inset:0;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none; opacity:.06;
      transform: rotate(-10deg);
      font-size:80px; font-weight:800;
    }
    header{ text-align:center; margin-bottom:10mm; }
    header h1{ margin:0; font-size:14px; }
    header p{ margin:2px 0; font-size:11px; }
    .patient{ margin:6mm 0 8mm; font-size:12px; }
    .title{ text-align:center; font-size:14px; margin:6mm 0 8mm; font-weight:700; }
    .textblock{ font-size:12px; white-space:pre-wrap; }
    .footer{
      position:absolute; left:10mm; right:10mm; bottom:10mm;
      font-size:11px;
    }
    .footer .row{ display:flex; justify-content:space-between; gap:10mm; }
    .sig{ flex:1; border-top:1px solid rgba(0,0,0,.65); padding-top:2mm; }
    .addr{ margin-top:6mm; border-top:1px solid rgba(0,0,0,.35); padding-top:3mm; font-size:10.5px; opacity:.9;}
    @media print{
      @page{ size:A4; margin:0; }
      .page{ padding:0; }
      .frame{ border:0; padding:16mm; min-height:297mm; }
      .brand{ top:10mm; }
    }
  </style>`;
}

async function getPro(){
  return await DB.getMeta("professional", { name:"", reg:"", phone:"", addr:"" });
}

function openPrintWindow(html){
  const w = window.open("", "_blank");
  if(!w) throw new Error("Pop-up bloqueado. Permita pop-ups para gerar PDF.");
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

export async function docPrescription({patientName, rxText}){
  const pro = await getPro();
  const d = new Date().toLocaleDateString("pt-BR");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseDocCSS()}</head><body>
    <div class="page"><div class="frame">
      <div class="brand">BTX-Pront</div>
      <div class="watermark">⬢</div>

      <header>
        <h1>${esc(pro.name||"")}</h1>
        <p>${esc(pro.reg||"")}</p>
        <p>${esc(pro.phone||"")}</p>
      </header>

      <div class="patient"><strong>Paciente:</strong> ${esc(patientName||"")}</div>
      <div class="title">Receituário</div>
      <div class="textblock">${esc(rxText||"")}</div>

      <div class="footer">
        <div class="row">
          <div class="sig">Assinatura</div>
          <div class="sig">Data: ${esc(d)}</div>
        </div>
        <div class="addr">${esc(pro.addr||"")}</div>
      </div>
    </div></div>
  </body></html>`;

  openPrintWindow(html);
}

export async function docSimple({title, patientName, bodyText}){
  const pro = await getPro();
  const d = new Date().toLocaleDateString("pt-BR");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseDocCSS()}</head><body>
    <div class="page"><div class="frame">
      <div class="brand">BTX-Pront</div>
      <div class="watermark">⬢</div>

      <header>
        <h1>${esc(pro.name||"")}</h1>
        <p>${esc(pro.reg||"")}</p>
        <p>${esc(pro.phone||"")}</p>
      </header>

      <div class="patient"><strong>Paciente:</strong> ${esc(patientName||"")}</div>
      <div class="title">${esc(title)}</div>
      <div class="textblock">${esc(bodyText||"")}</div>

      <div class="footer">
        <div class="row">
          <div class="sig">Assinatura</div>
          <div class="sig">Data: ${esc(d)}</div>
        </div>
        <div class="addr">${esc(pro.addr||"")}</div>
      </div>
    </div></div>
  </body></html>`;

  openPrintWindow(html);
}

export async function docScheduleDay({dateISO, items}){
  const pro = await getPro();
  const d = new Date(dateISO + "T00:00:00").toLocaleDateString("pt-BR");
  const lines = (items||[]).map(i => `• ${i.time} — ${i.patientName} (${i.status||"agendado"})`).join("\\n");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseDocCSS()}</head><body>
    <div class="page"><div class="frame">
      <div class="brand">BTX-Pront</div>
      <div class="watermark">⬢</div>

      <header>
        <h1>${esc(pro.name||"")}</h1>
        <p>${esc(pro.reg||"")}</p>
        <p>${esc(pro.phone||"")}</p>
      </header>

      <div class="title">Agenda do dia — ${esc(d)}</div>
      <div class="textblock">${esc(lines||"")}</div>

      <div class="footer">
        <div class="addr">${esc(pro.addr||"")}</div>
      </div>
    </div></div>
  </body></html>`;

  openPrintWindow(html);
}
