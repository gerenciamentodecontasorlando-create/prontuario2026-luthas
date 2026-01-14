// BTX-Pront — Presets (modelos) do receituário
export const RX_CATEGORIES = [
  { id:"analgesicos", label:"Analgésicos" },
  { id:"antiinflamatorios", label:"Anti-inflamatórios" },
  { id:"antibioticos", label:"Antibióticos" },
  { id:"antifungicos", label:"Antifúngicos" },
  { id:"hipertensao", label:"Anti-hipertensivos" },
  { id:"diabetes", label:"Antidiabéticos" },
];

export const RX_PRESETS = {
  analgesicos: [
    { label:"Dipirona 1g (adulto)", text:"Dipirona 1 g comprimido — tomar 1 comp VO a cada 6–8h se dor, por __ dias." },
    { label:"Paracetamol 500mg (adulto)", text:"Paracetamol 500 mg comprimido — tomar 1 comp VO a cada 6–8h se dor, por __ dias." },
    { label:"Paracetamol 750mg (adulto)", text:"Paracetamol 750 mg comprimido — tomar 1 comp VO a cada 8h se dor, por __ dias." },
    { label:"Paracetamol (pediatria)", text:"Paracetamol (solução/gotas) — 10–15 mg/kg/dose VO a cada 4–6h se dor/febre, por __ dias. (Peso: __ kg)" },
    { label:"Dipirona (pediatria)", text:"Dipirona (gotas/solução) — __ mg/kg/dose VO a cada 6–8h, por __ dias. (Peso: __ kg)" },
  ],
  antiinflamatorios: [
    { label:"Diclofenaco (adulto)", text:"Diclofenaco — __ mg VO a cada 8–12h, por __ dias, após alimentação." },
    { label:"Naproxeno (adulto)", text:"Naproxeno — __ mg VO a cada 12h, por __ dias, após alimentação." },
    { label:"Ibuprofeno (adulto)", text:"Ibuprofeno — __ mg VO a cada 8h, por __ dias, após alimentação." },
    { label:"Ibuprofeno suspensão (pediatria)", text:"Ibuprofeno (suspensão) — __ mg/kg/dose VO a cada 6–8h, por __ dias. (Peso: __ kg)" },
  ],
  antibioticos: [
    { label:"Amoxicilina (adulto)", text:"Amoxicilina — __ mg VO a cada 8h, por __ dias." },
    { label:"Amoxicilina suspensão (pediatria)", text:"Amoxicilina (suspensão) — __ mg/kg/dia VO dividido em __ tomadas, por __ dias. (Peso: __ kg)" },
    { label:"Clavulin (adulto)", text:"Amoxicilina + clavulanato (Clavulin) — __/__ mg VO a cada 12h, por __ dias." },
    { label:"Clavulin suspensão (pediatria)", text:"Amoxicilina + clavulanato (suspensão) — __ mg/kg/dia (amoxicilina) dividido em __ tomadas, por __ dias. (Peso: __ kg)" },
    { label:"Azitromicina (adulto)", text:"Azitromicina — __ mg VO 1x/dia, por __ dias." },
    { label:"Azitromicina suspensão (pediatria)", text:"Azitromicina (suspensão) — __ mg/kg/dia VO 1x/dia, por __ dias. (Peso: __ kg)" },
    { label:"Cefalexina (adulto)", text:"Cefalexina — __ mg VO a cada 6–8h, por __ dias." },
    { label:"Cefalexina suspensão (pediatria)", text:"Cefalexina (suspensão) — __ mg/kg/dia dividido em __ tomadas, por __ dias. (Peso: __ kg)" },
    { label:"Metronidazol", text:"Metronidazol — __ mg VO a cada 8–12h, por __ dias. (Evitar álcool durante o uso.)" },
    { label:"Ciprofloxacino", text:"Ciprofloxacino — __ mg VO a cada 12h, por __ dias." },
  ],
  antifungicos: [
    { label:"Fluconazol (comprimido)", text:"Fluconazol — __ mg VO, esquema: __ (dose única / semanal / diário por __ dias)." },
    { label:"Itraconazol (comprimido)", text:"Itraconazol — __ mg VO por __ dias (conforme indicação)." },
    { label:"Clotrimazol creme", text:"Clotrimazol creme — aplicar camada fina 2x/dia por __ dias." },
    { label:"Miconazol creme", text:"Miconazol creme — aplicar 2x/dia por __ dias." },
    { label:"Nistatina creme", text:"Nistatina creme — aplicar __x/dia por __ dias." },
    { label:"Cetoconazol shampoo", text:"Cetoconazol shampoo — aplicar, deixar agir __ min; usar __x/semana por __ semanas." },
    { label:"Sulfeto de selênio shampoo", text:"Sulfeto de selênio shampoo — aplicar, deixar __ min; usar __x/semana por __ semanas." },
    { label:"Sabonete antifúngico", text:"Sabonete antifúngico — uso diário na área afetada por __ dias, conforme orientação." },
  ],
  hipertensao: [
    { label:"Tiazídico (HCTZ/Clortalidona)", text:"Tiazídico — __ mg VO 1x/dia. (Ajustar conforme resposta/condições clínicas.)" },
    { label:"IECA (Enalapril)", text:"IECA (enalapril) — __ mg VO __x/dia. (Evitar em gestação; monitorar K+/função renal.)" },
    { label:"BRA (Losartana)", text:"BRA (losartana) — __ mg VO 1–2x/dia. (Evitar em gestação; monitorar K+/função renal.)" },
  ],
  diabetes: [
    { label:"Metformina", text:"Metformina — __ mg VO __x/dia com refeições. (Ajustar conforme tolerância/TFG.)" },
    { label:"Sulfonilureia (Gliclazida/Glimepirida)", text:"Sulfonilureia — __ mg VO 1x/dia. (Atenção a hipoglicemia.)" },
    { label:"SGLT2 (Dapagliflozina)", text:"SGLT2 — __ mg VO 1x/dia. (Atenção a hidratação/ITU/TFG.)" },
  ],
};
