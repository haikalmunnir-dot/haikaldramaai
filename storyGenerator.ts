import { StoryConfig, CharacterAnalysis, StoryBible, Scene, Dialogue, TimelineEvent } from '../types';

// Template cerita berdasarkan genre
interface StoryTemplate {
  titles: string[];
  premises: string[];
  conflicts: string[];
  locations: string[];
  sceneArcs: {
    title: string;
    function: string;
    location: string;
    time: string;
    characters: number[]; // index karakter
    action: string;
    emotion: string;
    endingState: string;
  }[];
}

const TEMPLATES: Record<string, StoryTemplate> = {
  'Romansa CEO': {
    titles: ['Di Balik Pintu Kaca', 'Cinta di Lantai 50', 'Janji Sang CEO', 'Takdir di Ruang Rapat'],
    premises: ['Seorang CEO dingin dan seorang wanita sederhana dipertemukan oleh takdir, tetapi rahasia masa lalu mengancam hubungan mereka.'],
    conflicts: ['Rahasia identitas yang tersembunyi', 'Tekanan keluarga vs cinta', 'Pengkhianatan bisnis'],
    locations: ['Lobi kantor mewah', 'Ruang rapat eksekutif', 'Kafe dekat kantor', 'Penthouse', 'Ballroom hotel', 'Taman kota', 'Studio desain'],
    sceneArcs: [
      { title: 'Pertemuan Pertama', function: 'Memperkenalkan dua karakter utama', location: 'Lobi kantor mewah', time: 'Pagi hari', characters: [0, 1], action: 'Tabrakan tak sengaja di lobi', emotion: 'Tegang', endingState: 'Kedua karakter saling menatap setelah tabrakan' },
      { title: 'Proyek Tak Terduga', function: 'Menghubungkan karakter melalui pekerjaan', location: 'Studio desain', time: 'Siang hari', characters: [1], action: 'Menerima proyek dari perusahaan besar', emotion: 'Antusias', endingState: 'Karakter utama wanita tersenyum melihat brief proyek' },
      { title: 'Presentasi', function: 'Membangun ketertarikan profesional', location: 'Ruang rapat eksekutif', time: 'Sore hari', characters: [0, 1], action: 'Presentasi desain yang mengesankan', emotion: 'Profesional', endingState: 'CEO menyetujui desain dengan tatapan tertarik' },
      { title: 'Undangan Gala', function: 'Momen romantis pertama', location: 'Ballroom hotel', time: 'Malam hari', characters: [0, 1], action: 'Berdansa bersama di acara gala', emotion: 'Romantis', endingState: 'Mereka berdansa dengan tatapan saling terkunci' },
      { title: 'Peringatan', function: 'Konflik batin dimulai', location: 'Kafe dekat kantor', time: 'Sore hari', characters: [1, 2], action: 'Sahabat memperingatkan tentang bahaya', emotion: 'Khawatir', endingState: 'Wanita terdiam dengan ekspresi ragu' },
      { title: 'Rahasia Terungkap', function: 'Klimaks dimulai', location: 'Arsip kantor', time: 'Malam hari', characters: [1], action: 'Menemukan dokumen rahasia', emotion: 'Terkejut', endingState: 'Dokumen di tangan dengan air mata jatuh' },
      { title: 'Konfrontasi', function: 'Konflik memuncak', location: 'Penthouse', time: 'Malam hari, hujan', characters: [0, 1], action: 'Menghadapkan kebenaran', emotion: 'Marah dan sedih', endingState: 'Wanita pergi meninggalkan dokumen di meja' },
      { title: 'Keputusan', function: 'Karakter utama memilih', location: 'Ruang kerja keluarga', time: 'Pagi hari', characters: [0], action: 'Menghadapi ayah tentang kebenaran', emotion: 'Tegas', endingState: 'CEO meninggalkan ruangan dengan keputusan bulat' },
      { title: 'Penjelasan', function: 'Resolusi konflik', location: 'Taman kota', time: 'Sore golden hour', characters: [0, 1], action: 'Menjelaskan segalanya dengan jujur', emotion: 'Harapan', endingState: 'Tangan mereka bertemu, saling memaafkan' },
      { title: 'Lembaran Baru', function: 'Ending bahagia', location: 'Studio bersama', time: 'Pagi cerah', characters: [0, 1], action: 'Memulai bisnis bersama', emotion: 'Bahagia', endingState: 'Mereka tersenyum bersama menatap masa depan' }
    ]
  },
  'K-Drama Korea': {
    titles: ['Bintang yang Jatuh', 'Musim Cinta', 'Destiny in Seoul', 'Cahaya di Matamu'],
    premises: ['Dua orang dari dunia berbeda bertemu di Seoul dan harus menghadapi takdir yang memisahkan mereka.'],
    conflicts: ['Perbedaan status sosial', 'Rahasia keluarga', 'Cinta segitiga'],
    locations: ['Jalanan Seoul', 'Kafe Hongdae', 'Apartemen mewah', 'Kampus universitas', 'Taman Namsan', 'Stasiun kereta'],
    sceneArcs: [
      { title: 'Pertemuan di Seoul', function: 'Memperkenalkan karakter di kota', location: 'Jalanan Seoul malam', time: 'Malam hari', characters: [0, 1], action: 'Bertemu secara tidak sengaja', emotion: 'Heran', endingState: 'Kedua karakter saling memperhatikan' },
      { title: 'Kafe Hongdae', function: 'Momen kedekatan pertama', location: 'Kafe Hongdae', time: 'Sore hari', characters: [0, 1], action: 'Berbagi cerita di kafe', emotion: 'Hangat', endingState: 'Mereka tertawa bersama' },
      { title: 'Rahasia Terungkap', function: 'Konflik dimulai', location: 'Apartemen mewah', time: 'Malam hari', characters: [0], action: 'Menemukan kebenaran', emotion: 'Terkejut', endingState: 'Ekspresi terkejut dan bingung' },
      { title: 'Taman Namsan', function: 'Momen romantis', location: 'Taman Namsan', time: 'Sore golden hour', characters: [0, 1], action: 'Berjalan bersama di taman', emotion: 'Romantis', endingState: 'Mereka berhenti dan saling menatap' },
      { title: 'Konfrontasi', function: 'Klimaks', location: 'Stasiun kereta', time: 'Malam hari', characters: [0, 1], action: 'Pertengkaran tentang rahasia', emotion: 'Sedih dan marah', endingState: 'Salah satu karakter pergi dengan air mata' },
      { title: 'Keputusan', function: 'Resolusi', location: 'Kampus universitas', time: 'Pagi hari', characters: [0], action: 'Membuat keputusan penting', emotion: 'Tegas', endingState: 'Karakter berjalan dengan tekad baru' },
      { title: 'Reuni', function: 'Pertemuan kembali', location: 'Jalanan Seoul', time: 'Sore hari', characters: [0, 1], action: 'Bertemu lagi secara tak sengaja', emotion: 'Harapan', endingState: 'Mereka tersenyum satu sama lain' },
      { title: 'Penjelasan', function: 'Kebenaran terungkap', location: 'Kafe Hongdae', time: 'Malam hari', characters: [0, 1], action: 'Menjelaskan segalanya', emotion: 'Lega', endingState: 'Mereka berpelukan' },
      { title: 'Musim Baru', function: 'Ending bahagia', location: 'Taman Namsan', time: 'Pagi musim semi', characters: [0, 1], action: 'Memulai lembaran baru', emotion: 'Bahagia', endingState: 'Mereka berjalan bersama di bawah bunga sakura' },
      { title: 'Janji', function: 'Penutup', location: 'Jalanan Seoul', time: 'Malam hari', characters: [0, 1], action: 'Saling berjanji', emotion: 'Penuh harap', endingState: 'Kedua karakter berjalan menjauh bersama' }
    ]
  },
  'Misteri': {
    titles: ['Bayangan di Cermin', 'Jejak yang Hilang', 'Rahasia Tengah Malam', 'Kode Terakhir'],
    premises: ['Sebuah misteri yang mengguncang kota, hanya satu detektif yang bisa mengungkap kebenarannya.'],
    conflicts: ['Pembunuhan misterius', 'Suspek yang berbohong', 'Waktu yang terbatas'],
    locations: ['Kantor polisi', 'TKP', 'Rumah suspek', 'Laboratorium forensik', 'Gudang tua', 'Kafe'],
    sceneArcs: [
      { title: 'Kasus Baru', function: 'Memperkenalkan kasus', location: 'Kantor polisi', time: 'Pagi hari', characters: [0, 1], action: 'Menerima kasus baru', emotion: 'Serius', endingState: 'Detektif membaca berkas dengan tatapan tajam' },
      { title: 'TKP', function: 'Investigasi awal', location: 'TKP', time: 'Siang hari', characters: [0], action: 'Memeriksa lokasi kejadian', emotion: 'Fokus', endingState: 'Menemukan petunjuk penting' },
      { title: 'Interogasi', function: 'Mengumpulkan informasi', location: 'Kantor polisi', time: 'Sore hari', characters: [0, 2], action: 'Menginterogasi suspek', emotion: 'Tegang', endingState: 'Suspek menunjukkan ekspresi mencurigakan' },
      { title: 'Petunjuk Baru', function: 'Perkembangan kasus', location: 'Laboratorium forensik', time: 'Malam hari', characters: [0, 1], action: 'Menerima hasil lab', emotion: 'Terkejut', endingState: 'Hasil lab mengungkap fakta mengejutkan' },
      { title: 'Ancaman', function: 'Eskalasi konflik', location: 'Gudang tua', time: 'Malam hari', characters: [0], action: 'Mendapat ancaman', emotion: 'Tegang', endingState: 'Detektif menerima pesan ancaman' },
      { title: 'Kebenaran', function: 'Klimaks', location: 'Rumah suspek', time: 'Tengah malam', characters: [0, 2], action: 'Menghadapi pelaku', emotion: 'Tegas', endingState: 'Pelaku terpojok' },
      { title: 'Pengungkapan', function: 'Resolusi', location: 'Kantor polisi', time: 'Pagi hari', characters: [0, 1], action: 'Mengungkapkan kebenaran', emotion: 'Lega', endingState: 'Kasus terpecahkan' },
      { title: 'Keadilan', function: 'Ending', location: 'Pengadilan', time: 'Siang hari', characters: [0], action: 'Melihat keadilan ditegakkan', emotion: 'Puas', endingState: 'Detektif tersenyum tipis' },
      { title: 'Refleksi', function: 'Penutup', location: 'Kafe', time: 'Sore hari', characters: [0, 1], action: 'Merefleksikan kasus', emotion: 'Tenang', endingState: 'Mereka minum kopi bersama' },
      { title: 'Kasus Berikutnya', function: 'Hook', location: 'Kantor polisi', time: 'Pagi hari', characters: [0], action: 'Menerima telepon tentang kasus baru', emotion: 'Siap', endingState: 'Detektif mengambil jasnya' }
    ]
  },
  'default': {
    titles: ['Cerita Kita', 'Jejak Langkah', 'Momen Berharga', 'Titik Balik'],
    premises: ['Sebuah cerita tentang pertemuan, konflik, dan pertumbuhan yang mengubah hidup semua karakter.'],
    conflicts: ['Konflik internal', 'Hubungan yang diuji', 'Pilihan sulit'],
    locations: ['Ruang tamu', 'Kafe', 'Kantor', 'Taman', 'Rumah', 'Jalanan kota'],
    sceneArcs: [
      { title: 'Awal Mula', function: 'Pengenalan', location: 'Ruang tamu', time: 'Pagi hari', characters: [0, 1], action: 'Pertemuan pertama', emotion: 'Antusias', endingState: 'Karakter saling mengenal' },
      { title: 'Perkembangan', function: 'Hubungan tumbuh', location: 'Kafe', time: 'Siang hari', characters: [0, 1], action: 'Berbagi cerita', emotion: 'Hangat', endingState: 'Hubungan semakin dekat' },
      { title: 'Masalah', function: 'Konflik muncul', location: 'Kantor', time: 'Sore hari', characters: [0], action: 'Menghadapi masalah', emotion: 'Khawatir', endingState: 'Karakter bingung' },
      { title: 'Dukungan', function: 'Momen dukungan', location: 'Taman', time: 'Sore hari', characters: [0, 1], action: 'Saling mendukung', emotion: 'Peduli', endingState: 'Mereka berjanji saling membantu' },
      { title: 'Krisis', function: 'Konflik memuncak', location: 'Rumah', time: 'Malam hari', characters: [0, 1], action: 'Pertengkaran', emotion: 'Marah', endingState: 'Salah satu pergi' },
      { title: 'Refleksi', function: 'Momen perenungan', location: 'Jalanan kota', time: 'Malam hari', characters: [0], action: 'Merefleksikan keadaan', emotion: 'Sedih', endingState: 'Karakter membuat keputusan' },
      { title: 'Permintaan Maaf', function: 'Resolusi dimulai', location: 'Kafe', time: 'Pagi hari', characters: [0, 1], action: 'Saling memaafkan', emotion: 'Lega', endingState: 'Mereka berdamai' },
      { title: 'Bekerja Sama', function: 'Penyelesaian masalah', location: 'Kantor', time: 'Siang hari', characters: [0, 1], action: 'Menyelesaikan masalah bersama', emotion: 'Semangat', endingState: 'Masalah terpecahkan' },
      { title: 'Pertumbuhan', function: 'Perkembangan karakter', location: 'Taman', time: 'Sore hari', characters: [0, 1], action: 'Merefleksikan perjalanan', emotion: 'Bersyukur', endingState: 'Mereka tumbuh bersama' },
      { title: 'Babak Baru', function: 'Ending', location: 'Ruang tamu', time: 'Pagi cerah', characters: [0, 1], action: 'Memulai babak baru', emotion: 'Penuh harap', endingState: 'Masa depan yang cerah' }
    ]
  }
};

function getTemplate(genre: string): StoryTemplate {
  for (const key of Object.keys(TEMPLATES)) {
    if (genre.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(genre.toLowerCase())) {
      return TEMPLATES[key];
    }
  }
  return TEMPLATES['default'];
}

function generateDialogue(
  characters: CharacterAnalysis[],
  charIndices: number[],
  sceneNumber: number,
  emotion: string,
  language: string
): Dialogue[] {
  const dialogues: Dialogue[] = [];
  
  // Dialogue templates based on emotion and scene position
  const dialogueTemplates: Record<string, Record<string, string[]>> = {
    'Bahasa Indonesia': {
      'Tegang': ['Kamu harus pergi sekarang.', 'Aku tidak akan membiarkan ini terjadi.', 'Apa yang kamu sembunyikan?', 'Ini bukan urusanmu.'],
      'Romantis': ['Aku tidak bisa berhenti memikirkannya.', 'Kamu berarti banyak bagiku.', 'Aku ingin bersamamu selamanya.', 'Kamu membuat hidupku berwarna.'],
      'Marah': ['Bagaimana bisa kamu melakukan ini?', 'Aku kecewa padamu.', 'Jangan bicara padaku!', 'Ini sudah terlambat.'],
      'Sedih': ['Maafkan aku...', 'Aku tidak tahu harus berbuat apa.', 'Kenapa ini terjadi?', 'Tolong jangan pergi.'],
      'Terkejut': ['Apa?! Tidak mungkin!', 'Aku tidak percaya ini.', 'Bagaimana kamu tahu?', 'Ini mengubah segalanya.'],
      'Hangat': ['Terima kasih sudah ada.', 'Aku senang bisa mengenalmu.', 'Kamu selalu mendukungku.', 'Aku beruntung memilikimu.'],
      'Tegas': ['Aku sudah membuat keputusan.', 'Ini harga mati.', 'Tidak ada pilihan lain.', 'Ikuti rencanaku.'],
      'default': ['Aku mengerti sekarang.', 'Kita harus menghadapi ini.', 'Ceritakan padaku.', 'Apa langkah selanjutnya?']
    },
    'English': {
      'Tegang': ['You need to leave now.', "I won't let this happen.", 'What are you hiding?', "This isn't your business."],
      'Romantis': ["I can't stop thinking about you.", 'You mean everything to me.', 'I want to be with you forever.', 'You color my world.'],
      'Marah': ['How could you do this?', "I'm disappointed in you.", "Don't talk to me!", "It's too late."],
      'Sedih': ["I'm sorry...", "I don't know what to do.", 'Why is this happening?', "Please don't go."],
      'Terkejut': ['What?! No way!', "I can't believe this.", 'How did you know?', 'This changes everything.'],
      'Hangat': ['Thank you for being here.', "I'm glad to know you.", 'You always support me.', "I'm lucky to have you."],
      'Tegas': ["I've made my decision.", 'This is non-negotiable.', "There's no other choice.", 'Follow my plan.'],
      'default': ["I understand now.", 'We have to face this.', 'Tell me about it.', "What's the next step?"]
    }
  };
  
  const langDialogues = dialogueTemplates[language] || dialogueTemplates['Bahasa Indonesia'];
  const emotionDialogues = langDialogues[emotion] || langDialogues['default'];
  
  charIndices.forEach((charIdx, i) => {
    if (charIdx < characters.length) {
      const char = characters[charIdx];
      const dialogueText = emotionDialogues[(sceneNumber + i) % emotionDialogues.length];
      dialogues.push({
        character_id: char.id,
        character_name: char.name,
        text: dialogueText,
        emotion: emotion.toLowerCase()
      });
    }
  });
  
  return dialogues;
}

function buildUnifiedPrompt(
  scene: Omit<Scene, 'video_prompt_final'>,
  characters: CharacterAnalysis[],
  config: StoryConfig,
  prevEndingState?: string
): string {
  const presentChars = scene.characters_present
    .map(id => characters.find(c => c.id === id))
    .filter(Boolean) as CharacterAnalysis[];
  
  const charDescriptions = presentChars.map(c => {
    const genderEn = c.visual_identity.includes('woman') ? 'woman' : 'man';
    return `${c.name} (${c.id}): ${c.visual_identity}. Wearing ${c.default_outfit}. Maintain exact facial features, hair, body type, and skin tone throughout the shot.`;
  }).join('\n');
  
  const dialogueInstructions = scene.dialogue.map((d, i) => {
    const timeStart = 2 + (i * 2);
    const timeEnd = timeStart + 2;
    return `${timeStart}.0-${timeEnd}.0 seconds: ${d.character_name} speaks in ${config.dialogue_language} with ${d.emotion} emotion: "${d.text}". Only ${d.character_name}'s mouth moves during this line. Other characters remain silent with natural listening expressions.`;
  }).join('\n');
  
  const aspectRatioEn = config.aspect_ratio === '9:16' ? 'vertical 9:16' : config.aspect_ratio === '16:9' ? 'horizontal 16:9' : 'square 1:1';
  
  const prompt = `Generate a single continuous 10-second ${aspectRatioEn} ${config.visual_style.toLowerCase()} video. Scene ${String(scene.scene_number).padStart(2, '0')}: "${scene.title}". Location: ${scene.location}. Time: ${scene.time_of_day}.

CHARACTERS IN SCENE:
${charDescriptions}

SCENE STRUCTURE:
0.0-2.0 seconds: Opening shot establishing the location and character positions. ${scene.initial_condition}
${dialogueInstructions}
${Math.max(8, 2 + scene.dialogue.length * 2)}.0-10.0 seconds: Final reaction and transition. ${scene.ending_state}

NARRATIVE CONTEXT: ${scene.narration}

CAMERA: Stable shot with minimal movement. Eye-level framing. Focus on active speaker during dialogue. Shallow depth of field to isolate characters from background.

LIGHTING: Natural realistic lighting appropriate for ${scene.time_of_day}. True-to-life skin tones. No color casts or excessive filters.

AUDIO: Clear dialogue audio as primary sound. Subtle ambient sound matching location. ${config.music_atmosphere} background score at low volume. No overlapping speech.

CONTINUITY REQUIREMENTS:
- Maintain exact character appearance as described above
- No facial morphing, no feature changes
- Natural body proportions and realistic movement
- Consistent clothing and props throughout
- ${prevEndingState ? `Scene begins from this state: "${prevEndingState}"` : 'This is the opening scene'}
- Scene ends at: "${scene.ending_state}"
- Next scene will continue from this ending state

NEGATIVE INSTRUCTIONS: Do not include visual glitches, flickering, frame distortion, inconsistent character identity, changing facial features, face morphing, unnatural body proportions, deformed hands, extra fingers, missing fingers, extra limbs, duplicated characters, duplicated objects, floating objects, disappearing props, inconsistent clothing, unnatural body movement, robotic gestures, broken anatomy, unnatural eye movement, unnatural lip movement, unsynchronized dialogue, incorrect speaker mouth movement, sudden lighting changes, inconsistent shadows, background warping, object deformation, unwanted text, subtitles, captions, logos, watermarks, low-resolution facial details, excessive motion blur, abrupt camera jumps, random scene transitions, or visual artifacts.`;

  return prompt;
}

export function generateStory(
  config: StoryConfig,
  characters: CharacterAnalysis[]
): { storyBible: StoryBible; scenes: Scene[] } {
  const template = getTemplate(config.genre);
  
  // Build Story Bible
  const storyBible: StoryBible = {
    title: template.titles[Math.floor(Math.random() * template.titles.length)],
    premise: template.premises[0],
    synopsis: `${template.premises[0]} Cerita ini mengikuti perjalanan ${characters.map(c => c.name).join(' dan ')} melalui ${config.scene_count} adegan yang penuh emosi dan konflik.`,
    genre: config.genre,
    theme: 'Cinta, konflik, dan pertumbuhan',
    main_conflict: template.conflicts[0],
    climax: 'Konflik mencapai titik tertinggi ketika rahasia terungkap',
    ending: config.ending_type === 'Bahagia' ? 'Semua karakter menemukan kedamaian' : 'Ending yang emosional dan bermakna',
    locations: template.locations,
    continuity_rules: [
      'Identitas karakter harus konsisten di setiap scene',
      'Pakaian hanya berubah jika diceritakan dalam alur',
      'Lokasi berpindah secara logis',
      'Properti tetap konsisten'
    ]
  };
  
  // Generate scenes
  const scenes: Scene[] = [];
  const totalArcs = template.sceneArcs.length;
  
  for (let i = 0; i < config.scene_count; i++) {
    const arcIndex = Math.min(i, totalArcs - 1);
    const arc = template.sceneArcs[arcIndex];
    
    // Map character indices (ensure within bounds)
    const charIndices = arc.characters.map(idx => Math.min(idx, characters.length - 1));
    const charsPresent = charIndices.map(idx => characters[idx]?.id).filter(Boolean);
    
    // Generate dialogue
    const dialogue = generateDialogue(characters, charIndices, i, arc.emotion, config.dialogue_language);
    
    // Build timeline
    const timeline: TimelineEvent[] = [
      { time: '00.0-02.0', description: `Opening shot - ${arc.action} dimulai`, type: 'action' },
      ...dialogue.map((d, di) => ({
        time: `${String(2 + di * 2).padStart(2, '0')}.0-${String(4 + di * 2).padStart(2, '0')}.0`,
        description: `${d.character_name}: "${d.text}"`,
        type: 'dialogue' as const
      })),
      { time: '08.0-10.0', description: `Reaksi akhir - ${arc.endingState}`, type: 'reaction' }
    ];
    
    const prevEnding = i > 0 ? scenes[i - 1].ending_state : '';
    
    const sceneBase: Omit<Scene, 'video_prompt_final'> = {
      scene_number: i + 1,
      title: arc.title,
      duration_seconds: 10,
      narration: `${arc.function}. ${arc.action}. Suasana ${arc.emotion.toLowerCase()} mengisi lokasi.`,
      dialogue,
      timeline,
      characters_present: charsPresent,
      location: arc.location,
      time_of_day: arc.time,
      initial_condition: i === 0 ? 'Scene pembuka. Karakter berada di posisi awal.' : `Melanjutkan dari scene sebelumnya: ${prevEnding}`,
      ending_state: arc.endingState,
      continuity_link: i < config.scene_count - 1 ? `Scene ${i + 2} dimulai dari keadaan: ${arc.endingState}` : 'Scene terakhir. Cerita selesai.',
      continuity_status: 'consistent',
      locked: false
    };
    
    const videoPromptFinal = buildUnifiedPrompt(sceneBase, characters, config, prevEnding);
    
    scenes.push({
      ...sceneBase,
      video_prompt_final: videoPromptFinal
    });
  }
  
  return { storyBible, scenes };
}

export function regenerateSingleScene(
  sceneIndex: number,
  scenes: Scene[],
  characters: CharacterAnalysis[],
  config: StoryConfig
): Scene {
  const template = getTemplate(config.genre);
  const totalArcs = template.sceneArcs.length;
  const arcIndex = Math.min(sceneIndex, totalArcs - 1);
  const arc = template.sceneArcs[arcIndex];
  
  const charIndices = arc.characters.map(idx => Math.min(idx, characters.length - 1));
  const charsPresent = charIndices.map(idx => characters[idx]?.id).filter(Boolean);
  const dialogue = generateDialogue(characters, charIndices, sceneIndex, arc.emotion, config.dialogue_language);
  
  const timeline: TimelineEvent[] = [
    { time: '00.0-02.0', description: `Opening shot - ${arc.action} dimulai`, type: 'action' },
    ...dialogue.map((d, di) => ({
      time: `${String(2 + di * 2).padStart(2, '0')}.0-${String(4 + di * 2).padStart(2, '0')}.0`,
      description: `${d.character_name}: "${d.text}"`,
      type: 'dialogue' as const
    })),
    { time: '08.0-10.0', description: `Reaksi akhir - ${arc.endingState}`, type: 'reaction' }
  ];
  
  const prevEnding = sceneIndex > 0 ? scenes[sceneIndex - 1].ending_state : '';
  
  const sceneBase: Omit<Scene, 'video_prompt_final'> = {
    scene_number: sceneIndex + 1,
    title: arc.title,
    duration_seconds: 10,
    narration: `${arc.function}. ${arc.action}. Suasana ${arc.emotion.toLowerCase()} mengisi lokasi.`,
    dialogue,
    timeline,
    characters_present: charsPresent,
    location: arc.location,
    time_of_day: arc.time,
    initial_condition: sceneIndex === 0 ? 'Scene pembuka.' : `Melanjutkan dari scene sebelumnya: ${prevEnding}`,
    ending_state: arc.endingState,
    continuity_link: sceneIndex < scenes.length - 1 ? `Scene ${sceneIndex + 2} dimulai dari: ${arc.endingState}` : 'Scene terakhir.',
    continuity_status: 'consistent',
    locked: false
  };
  
  const videoPromptFinal = buildUnifiedPrompt(sceneBase, characters, config, prevEnding);
  
  return { ...sceneBase, video_prompt_final: videoPromptFinal };
}
