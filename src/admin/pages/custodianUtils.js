// Utility to ensure custodian exists and return its ID
export async function getOrCreateCustodianId(custodianName, ipcRenderer) {
  if (!custodianName || custodianName.trim() === '') return null;
  // Get all custodians
  const custodians = await ipcRenderer.invoke('get-custodians');
  let custodian = custodians.find(c => c.name.trim().toLowerCase() === custodianName.trim().toLowerCase());
  if (custodian) return custodian.id;
  // Create new custodian
  const newId = await ipcRenderer.invoke('add-custodian', { name: custodianName.trim() });
  return newId;
}
