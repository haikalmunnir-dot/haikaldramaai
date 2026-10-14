import { Project, Scene, CharacterAnalysis } from '../types';

const STORAGE_KEY = 'drama_studio_projects';

export function getAllProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  project.updated_at = new Date().toISOString();
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadProject(id: string): Project | null {
  return getAllProjects().find(p => p.id === id) || null;
}

export function deleteProject(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getAllProjects().filter(p => p.id !== id)));
}

export function exportAsJSON(project: Project): string {
  return JSON.stringify({
    project: {
      title: project.name,
      genre: project.config.genre,
      visual_style: project.config.visual_style,
      aspect_ratio: project.config.aspect_ratio,
      scene_duration_seconds: 10,
      total_scenes: project.scenes.length,
      total_duration_seconds: project.scenes.length * 10,
      dialogue_language: project.config.dialogue_language,
      is_demo: project.is_demo
    },
    characters: project.characters.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role_confirmed,
      visual_identity: c.visual_identity,
      default_outfit: c.default_outfit,
      personality: c.personality,
      consistency_rules: c.consistency_rules
    })),
    story_bible: project.story_bible,
    scenes: project.scenes.map(s => ({
      scene_number: s.scene_number,
      title: s.title,
      duration_seconds: s.duration_seconds,
      narration: s.narration,
      dialogue: s.dialogue,
      characters_present: s.characters_present,
      video_prompt_final: s.video_prompt_final,
      ending_state: s.ending_state,
      continuity_link: s.continuity_link,
      continuity_status: s.continuity_status
    }))
  }, null, 2);
}

export function exportAsTXT(project: Project): string {
  let txt = `═══════════════════════════════════════\n`;
  txt += `  ${project.name}\n`;
  txt += `═══════════════════════════════════════\n`;
  txt += `${project.is_demo ? '[DEMO MODE]' : ''}\n\n`;
  txt += `Genre: ${project.config.genre}\n`;
  txt += `Format: ${project.config.aspect_ratio}\n`;
  txt += `Gaya Visual: ${project.config.visual_style}\n`;
  txt += `Bahasa Dialog: ${project.config.dialogue_language}\n`;
  txt += `Total Scene: ${project.scenes.length} × 10 detik = ${project.scenes.length * 10} detik\n\n`;

  if (project.story_bible) {
    txt += `───────────────────────────────────────\n`;
    txt += `  STORY BIBLE\n`;
    txt += `───────────────────────────────────────\n\n`;
    txt += `Judul: ${project.story_bible.title}\n`;
    txt += `Premis: ${project.story_bible.premise}\n\n`;
    txt += `Sinopsis:\n${project.story_bible.synopsis}\n\n`;
    txt += `Konflik Utama: ${project.story_bible.main_conflict}\n`;
    txt += `Klimaks: ${project.story_bible.climax}\n`;
    txt += `Ending: ${project.story_bible.ending}\n\n`;
  }

  txt += `───────────────────────────────────────\n`;
  txt += `  KARAKTER\n`;
  txt += `───────────────────────────────────────\n\n`;
  project.characters.forEach(c => {
    txt += `[${c.id}] ${c.name} — ${c.role_confirmed}\n`;
    txt += `  Visual: ${c.visual_identity}\n`;
    txt += `  Pakaian: ${c.default_outfit}\n`;
    txt += `  Kepribadian: ${c.personality}\n`;
    txt += `  Aturan Konsistensi: ${c.consistency_rules.join('; ')}\n\n`;
  });

  txt += `───────────────────────────────────────\n`;
  txt += `  SCENE-SCENE\n`;
  txt += `───────────────────────────────────────\n\n`;
  project.scenes.forEach(s => {
    txt += `╔═══════════════════════════════════════╗\n`;
    txt += `  SCENE ${String(s.scene_number).padStart(2, '0')} — ${s.title}\n`;
    txt += `╚═══════════════════════════════════════╝\n\n`;
    txt += `Durasi: ${s.duration_seconds} detik\n`;
    txt += `Lokasi: ${s.location} | Waktu: ${s.time_of_day}\n`;
    txt += `Karakter: ${s.characters_present.join(', ')}\n\n`;
    txt += `Narasi:\n${s.narration}\n\n`;
    txt += `Dialog:\n`;
    s.dialogue.forEach(d => {
      txt += `  ${d.character_name}: "${d.text}" (${d.emotion})\n`;
    });
    txt += `\n`;
    txt += `PROMPT VIDEO FINAL:\n${s.video_prompt_final}\n\n`;
    txt += `Ending State: ${s.ending_state}\n`;
    txt += `Continuity Link: ${s.continuity_link}\n\n`;
    txt += `───────────────────────────────────────\n\n`;
  });

  return txt;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
