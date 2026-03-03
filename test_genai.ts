import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: 'AIzaSyA2PUgeYTn22s83PVzL2rKdc9PzVnZ6tUI' });

async function run() {
  const models = await ai.models.list();
  for await (const m of models) {
    if (m.name?.includes('flash')) console.log(m.name);
  }
}
run().catch(console.error);
