import { CharacterInput, CharacterAnalysis } from '../types';

// Analisis karakter berbasis template (mode demo tanpa API key)
// Menganalisis deskripsi karakter dan menghasilkan profil lengkap

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  'pria': ['CEO', 'Detektif', 'Dokter', 'Pengacara', 'Pengawal', 'Musuh', 'Mantan kekasih', 'Saudara'],
  'wanita': ['CEO wanita', 'Desainer', 'Dokter', 'Jurnalis', 'Sahabat', 'Adik', 'Mantan kekasih', 'Rival'],
  'default': ['Tokoh utama', 'Tokoh pendukung', 'Antagonis', 'Mentor', 'Karakter misterius']
};

const PERSONALITY_KEYWORDS: Record<string, string[]> = {
  'dingin': ['pendiam', 'tegas', 'sulit didekati', 'perfeksionis', 'menyembunyikan emosi'],
  'hangat': ['ramah', 'peduli', 'penuh perhatian', 'mudah tersenyum', 'empatik'],
  'tegas': ['berprinsip', 'tidak mudah dibujuk', 'pemimpin alami', 'berani mengambil keputusan'],
  'lembut': ['penuh kasih', 'sabar', 'pendengar yang baik', 'sensitif'],
  'cerdas': ['analitis', 'strategis', 'cepat belajar', 'wawasan luas'],
  'berani': ['tidak takut risiko', 'melindungi orang lain', 'berani berkata jujur'],
  'pendiam': ['observant', 'berpikir sebelum bicara', 'misterius'],
  'misterius': ['penuh rahasia', 'masa lalu tersembunyi', 'sulit ditebak']
};

const OCCUPATION_KEYWORDS: Record<string, string> = {
  'jas': 'Eksekutif bisnis',
  'ceo': 'CEO perusahaan',
  'dokter': 'Dokter',
  'guru': 'Guru/Dosen',
  'desainer': 'Desainer',
  'seniman': 'Seniman',
  'detektif': 'Detektif',
  'polisi': 'Anggota kepolisian',
  'pengacara': 'Pengacara',
  'wartawan': 'Wartawan/Jurnalis',
  'mahasiswa': 'Mahasiswa',
  'pelajar': 'Pelajar',
  'pengusaha': 'Pengusaha',
  'artis': 'Artis/Selebriti',
  'penyanyi': 'Penyanyi',
  'ratu': 'Bangsawan/Ratu',
  'raja': 'Bangsawan/Raja',
  'pangeran': 'Bangsawan/Pangeran',
  'putri': 'Bangsawan/Putri'
};

function detectGender(description: string, explicitGender: string): string {
  if (explicitGender && explicitGender !== '') return explicitGender;
  
  const maleKeywords = ['pria', 'laki-laki', 'cowok', 'bapak', 'pria', 'man', 'he', 'handsome', 'tampan', 'bergas', 'bapak', 'mas', 'abang'];
  const femaleKeywords = ['wanita', 'perempuan', 'cewek', 'ibu', 'woman', 'she', 'beautiful', 'cantik', 'manis', 'mbak', 'dek', 'gadis'];
  
  const desc = description.toLowerCase();
  if (maleKeywords.some(k => desc.includes(k))) return 'pria';
  if (femaleKeywords.some(k => desc.includes(k))) return 'wanita';
  
  return 'pria';
}

function detectAge(description: string, explicitAge: string): string {
  if (explicitAge && explicitAge !== '') return explicitAge;
  
  const agePatterns = [
    { pattern: /(\d+)\s*(tahun|yrs?|years?)/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /(?:berusia|usia)\s*(\d+)/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /sekitar\s*(\d+)/i, extract: (m: RegExpMatchArray) => m[1] },
  ];
  
  for (const p of agePatterns) {
    const match = description.match(p.pattern);
    if (match) return p.extract(match) + ' tahun';
  }
  
  const youngKeywords = ['muda', 'youth', 'young', 'pelajar', 'mahasiswa', 'remaja'];
  const middleKeywords = ['dewasa', 'tengah', 'matang', 'profesional'];
  const oldKeywords = ['tua', 'sepuh', 'elderly', 'kakek', 'nenek'];
  
  const desc = description.toLowerCase();
  if (youngKeywords.some(k => desc.includes(k))) return '20-30 tahun';
  if (oldKeywords.some(k => desc.includes(k))) return '50-65 tahun';
  if (middleKeywords.some(k => desc.includes(k))) return '35-50 tahun';
  
  return '25-35 tahun';
}

function detectOccupation(description: string, explicitOccupation: string): string {
  if (explicitOccupation && explicitOccupation !== '') return explicitOccupation;
  
  const desc = description.toLowerCase();
  for (const [keyword, occupation] of Object.entries(OCCUPATION_KEYWORDS)) {
    if (desc.includes(keyword)) return occupation;
  }
  
  return 'Profesional';
}

function detectPersonality(description: string, explicitPersonality: string): string {
  if (explicitPersonality && explicitPersonality !== '') return explicitPersonality;
  
  const desc = description.toLowerCase();
  const detected: string[] = [];
  
  for (const [keyword, traits] of Object.entries(PERSONALITY_KEYWORDS)) {
    if (desc.includes(keyword)) {
      detected.push(...traits.slice(0, 2));
    }
  }
  
  if (detected.length === 0) {
    return 'Memiliki kepribadian yang kompleks dan menarik';
  }
  
  return detected.slice(0, 4).join(', ');
}

function extractPhysicalTraits(description: string): { fixed: string[]; creative: string[] } {
  const fixed: string[] = [];
  const creative: string[] = [];
  
  const desc = description.toLowerCase();
  
  // Hair
  if (desc.includes('rambut hitam')) fixed.push('Rambut hitam');
  else if (desc.includes('rambut coklat')) fixed.push('Rambut cokelat');
  else if (desc.includes('rambut pirang')) fixed.push('Rambut pirang');
  else if (desc.includes('rambut pendek')) fixed.push('Rambut pendek');
  else if (desc.includes('rambut panjang')) fixed.push('Rambut panjang');
  else creative.push('Rambut hitam terawat');
  
  // Face
  if (desc.includes('tampan')) fixed.push('Wajah tampan');
  else if (desc.includes('cantik')) fixed.push('Wajah cantik');
  else if (desc.includes('tegas')) fixed.push('Wajah tegas');
  else if (desc.includes('lembut')) fixed.push('Wajah lembut');
  else creative.push('Wajah proporsional dan menarik');
  
  // Body
  if (desc.includes('tinggi')) fixed.push('Tinggi');
  else if (desc.includes('pendek')) fixed.push('Tidak terlalu tinggi');
  else creative.push('Tinggi rata-rata');
  
  if (desc.includes('atletis') || desc.includes('kekar')) fixed.push('Tubuh atletis');
  else if (desc.includes('ramping') || desc.includes('langsing')) fixed.push('Tubuh ramping');
  else creative.push('Tubuh proporsional');
  
  // Eyes
  if (desc.includes('mata cokelat')) fixed.push('Mata cokelat');
  else if (desc.includes('mata hitam')) fixed.push('Mata hitam');
  else creative.push('Mata cerah dengan tatapan tajam');
  
  // Skin
  if (desc.includes('kulit putih')) fixed.push('Kulit putih');
  else if (desc.includes('kulit sawo')) fixed.push('Kulit sawo matang');
  else if (desc.includes('kulit gelap')) fixed.push('Kulit gelap');
  else creative.push('Kulit cerah natural');
  
  // Outfit
  if (desc.includes('jas hitam')) fixed.push('Jas hitam formal');
  else if (desc.includes('gaun')) fixed.push('Gaun elegan');
  else if (desc.includes('kasual')) fixed.push('Pakaian kasual rapi');
  else if (desc.includes('seragam')) fixed.push('Seragam');
  else creative.push('Pakaian sesuai peran dan situasi');
  
  // Ensure minimum
  if (fixed.length < 3) {
    creative.push('Ekspresi wajah natural', 'Postur tubuh tegap');
  }
  
  return { fixed, creative };
}

function suggestRole(description: string, gender: string, occupation: string, allCharacters: CharacterInput[]): string {
  const desc = description.toLowerCase();
  
  // Check for explicit role
  const roleKeywords: Record<string, string> = {
    'ceo': 'CEO',
    'bos': 'CEO',
    'direktur': 'Direktur Perusahaan',
    'detektif': 'Detektif',
    'dokter': 'Dokter',
    'guru': 'Guru',
    'ibu': 'Ibu/Keluarga',
    'ayah': 'Ayah/Keluarga',
    'musuh': 'Antagonis',
    'villain': 'Antagonis',
    'hero': 'Tokoh Utama',
    'protagonis': 'Tokoh Utama',
    'sahabat': 'Sahabat',
    'teman': 'Sahabat',
    'adik': 'Adik',
    'kakak': 'Kakak',
    'mantan': 'Mantan Kekasih',
    'rival': 'Rival'
  };
  
  for (const [keyword, role] of Object.entries(roleKeywords)) {
    if (desc.includes(keyword)) return role;
  }
  
  // Suggest based on position
  if (allCharacters.length === 0) {
    return gender === 'pria' ? 'Tokoh Utama Pria' : 'Tokoh Utama Wanita';
  }
  if (allCharacters.length === 1) {
    return gender === 'pria' ? 'Tokoh Utama Pria' : 'Tokoh Utama Wanita';
  }
  
  // Check occupation
  if (occupation.toLowerCase().includes('ceo') || occupation.toLowerCase().includes('direktur')) {
    return 'CEO / Pemimpin';
  }
  
  return 'Tokoh Pendukung';
}

export function analyzeCharacter(input: CharacterInput, allInputs: CharacterInput[]): CharacterAnalysis {
  const gender = detectGender(input.description, input.gender);
  const age = detectAge(input.description, input.age);
  const occupation = detectOccupation(input.description, input.occupation);
  const personality = detectPersonality(input.description, input.personality);
  const physical = extractPhysicalTraits(input.description);
  const role = input.desired_role || suggestRole(input.description, gender, occupation, allInputs.filter(c => c.id !== input.id));
  
  const name = input.name || `Karakter ${input.id.split('_')[1]}`;
  
  // Build visual identity
  const visualParts = [
    `${age} ${gender === 'pria' ? 'man' : 'woman'}`,
    ...physical.fixed.map(t => t.toLowerCase()),
    ...physical.creative.slice(0, 2).map(t => t.toLowerCase())
  ];
  const visualIdentity = visualParts.join(', ');
  
  // Build default outfit
  const outfitFixed = physical.fixed.find(t => t.toLowerCase().includes('jas') || t.toLowerCase().includes('gaun') || t.toLowerCase().includes('pakaian'));
  const defaultOutfit = input.outfit_style || outfitFixed || 'Pakaian sesuai peran dan lokasi';
  
  // Build consistency rules
  const consistencyRules = [
    ...physical.fixed.map(t => `Pertahankan: ${t}`),
    'Jangan mengubah warna rambut tanpa alasan cerita',
    'Jangan mengubah bentuk wajah',
    'Pertahankan ciri fisik khas di setiap scene'
  ];
  
  // Build motivation based on role
  const motivations: Record<string, string> = {
    'CEO': 'Mempertahankan kekuasaan dan menemukan kebenaran',
    'Tokoh Utama Pria': 'Mencapai tujuan sambil menemukan cinta',
    'Tokoh Utama Wanita': 'Membuktikan diri dan menemukan jati diri',
    'Antagonis': 'Mencapai tujuan dengan cara apapun',
    'Sahabat': 'Melindungi tokoh utama dari bahaya',
    'Detektif': 'Mengungkap kebenaran yang tersembunyi',
    'Dokter': 'Menyelamatkan nyawa sambil menghadapi dilema moral'
  };
  
  return {
    id: `CHAR_${input.id.split('_')[1]}`,
    input_id: input.id,
    name,
    role_recommended: role,
    role_confirmed: role,
    physical_fixed: physical.fixed,
    physical_creative: physical.creative,
    age_range: age,
    personality,
    speaking_style: input.speaking_style || 'Sesuai kepribadian karakter',
    voice_characteristics: gender === 'pria' ? 'Suara berat dan berwibawa' : 'Suara lembut dan jelas',
    occupation,
    motivation: input.goals || motivations[role] || 'Memiliki tujuan yang jelas dalam cerita',
    strengths: 'Memiliki kelebihan yang mendukung perannya',
    weaknesses: 'Memiliki kelemahan yang menciptakan konflik internal',
    personal_conflict: 'Menghadapi konflik antara keinginan dan tanggung jawab',
    character_arc: 'Berkembang dari awal hingga akhir cerita',
    visual_identity: visualIdentity,
    default_outfit: defaultOutfit,
    consistency_rules: consistencyRules,
    locked: true
  };
}

export function analyzeAllCharacters(inputs: CharacterInput[]): CharacterAnalysis[] {
  return inputs.map((input, idx) => analyzeCharacter(input, inputs));
}
