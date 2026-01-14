// BTX-Pront — IndexedDB wrapper (offline-first)
const DB_NAME = "btx_pront_db";
const DB_VERSION = 1;

function openDB(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if(!db.objectStoreNames.contains("patients")){
        const s = db.createObjectStore("patients", { keyPath: "id" });
        s.createIndex("name", "name", { unique:false });
        s.createIndex("phone", "phone", { unique:false });
      }

      if(!db.objectStoreNames.contains("appointments")){
        const s = db.createObjectStore("appointments", { keyPath: "id" });
        s.createIndex("date", "date", { unique:false });
        s.createIndex("patientId", "patientId", { unique:false });
      }

      if(!db.objectStoreNames.contains("encounters")){
        const s = db.createObjectStore("encounters", { keyPath: "id" });
        s.createIndex("patientId", "patientId", { unique:false });
        s.createIndex("date", "date", { unique:false });
      }

      if(!db.objectStoreNames.contains("meta")){
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode="readonly"){
  const db = await openDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

function uid(prefix="id"){
  return `${prefix}_${crypto.randomUUID()}`;
}

export const DB = {
  uid,

  async put(store, value){
    const s = await tx(store, "readwrite");
    return new Promise((resolve, reject) => {
      const r = s.put(value);
      r.onsuccess = () => resolve(true);
      r.onerror = () => reject(r.error);
    });
  },

  async get(store, key){
    const s = await tx(store, "readonly");
    return new Promise((resolve, reject) => {
      const r = s.get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  },

  async del(store, key){
    const s = await tx(store, "readwrite");
    return new Promise((resolve, reject) => {
      const r = s.delete(key);
      r.onsuccess = () => resolve(true);
      r.onerror = () => reject(r.error);
    });
  },

  async getAllByIndex(store, indexName, matchValue){
    const s = await tx(store, "readonly");
    const idx = s.index(indexName);
    return new Promise((resolve, reject) => {
      const out = [];
      const r = idx.openCursor(IDBKeyRange.only(matchValue));
      r.onsuccess = () => {
        const cur = r.result;
        if(cur){ out.push(cur.value); cur.continue(); }
        else resolve(out);
      };
      r.onerror = () => reject(r.error);
    });
  },

  async getAll(store){
    const s = await tx(store, "readonly");
    return new Promise((resolve, reject) => {
      const r = s.getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  },

  async setMeta(key, value){
    return this.put("meta", { key, value });
  },

  async getMeta(key, fallback=null){
    const v = await this.get("meta", key);
    return v ? v.value : fallback;
  },

  async exportAll(){
    const [patients, appointments, encounters, meta] = await Promise.all([
      this.getAll("patients"),
      this.getAll("appointments"),
      this.getAll("encounters"),
      this.getAll("meta"),
    ]);
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      patients, appointments, encounters, meta
    };
  },

  async importAll(payload){
    if(!payload || !payload.version) throw new Error("Backup inválido.");

    for(const p of (payload.patients||[])) await this.put("patients", p);
    for(const a of (payload.appointments||[])) await this.put("appointments", a);
    for(const e of (payload.encounters||[])) await this.put("encounters", e);
    for(const m of (payload.meta||[])) await this.put("meta", m);

    return true;
  }
};
