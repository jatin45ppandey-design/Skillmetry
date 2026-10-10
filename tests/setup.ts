const values = new Map<string,string>();

const localStorageMock:Storage = {
  get length() { return values.size; },
  clear:() => values.clear(),
  getItem:key => values.get(key) ?? null,
  key:index => [...values.keys()][index] ?? null,
  removeItem:key => { values.delete(key); },
  setItem:(key,value) => { values.set(key,value); }
};

Object.defineProperty(globalThis,"localStorage",{
  value:localStorageMock,
  configurable:true
});

Object.defineProperty(globalThis,"window",{
  value:globalThis,
  configurable:true
});
