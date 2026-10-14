// === TIPE DATA UTAMA ===

export interface CharacterInput {
  id: string;
  name: string;
  description: string; // Deskripsi karakter dari pengguna
  physical_traits: string; // Ciri fisik yang ingin dipertahankan
  gender: string;
  age: string;
  personality: string;
  occupation: string;
  desired_role: string; // Peran yang diinginkan dalam cerita
  relationships: string;
  outfit_style: string;
  speaking_style: string;
  goals: string;
  reference_image?: string; // Base64 atau URL jika didukung
}

export interface CharacterAnalysis {
  id: string;
  input_id: string;
  name: string;
  role_recommended: string;
  role_confirmed: string; // Peran yang dikonfirmasi pengguna
  physical_fixed: string[]; // Ciri fisik yang ditentukan pengguna
  physical_creative: string[]; // Ciri fisik tambahan dari AI
  age_range: string;
  personality: string;
  speaking_style: string;
  voice_characteristics: string;
  occupation: string;
  motivation: string;
  strengths: string;
  weaknesses: string;
  personal_conflict: string;
  character_arc: string;
  visual_identity: string; // Deskripsi visual lengkap untuk konsistensi
  default_outfit: string;
  consistency_rules: string[]; // Aturan yang harus dipertahankan
  locked: boolean;
}

export interface StoryConfig {
  genre: string;
  custom_genre: string;
  story_idea: string;
  scene_count: number;
  aspect_ratio: '9:16' | '16:9' | '1:1';
  visual_style: string;
  dialogue_language: string;
  narration_mode: string;
  ending_type: string;
  music_atmosphere: string;
}

export interface Dialogue {
  character_id: string;
  character_name: string;
  text: string;
  emotion: string;
}

export interface TimelineEvent {
  time: string;
  description: string;
  type: 'action' | 'dialogue' | 'reaction';
}

export interface Scene {
  scene_number: number;
  title: string;
  duration_seconds: number;
  narration: string;
  dialogue: Dialogue[];
  timeline: TimelineEvent[];
  characters_present: string[];
  location: string;
  time_of_day: string;
  initial_condition: string;
  ending_state: string;
  continuity_link: string;
  video_prompt_final: string; // SATU prompt lengkap dan utuh
  continuity_status: 'consistent' | 'needs_review' | 'conflict';
  locked: boolean;
}

export interface StoryBible {
  title: string;
  premise: string;
  synopsis: string;
  genre: string;
  theme: string;
  main_conflict: string;
  climax: string;
  ending: string;
  locations: string[];
  continuity_rules: string[];
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  config: StoryConfig;
  character_inputs: CharacterInput[];
  characters: CharacterAnalysis[];
  story_bible: StoryBible | null;
  scenes: Scene[];
  is_demo: boolean;
}

export type AppView = 'input' | 'results';
