import { Scene, CharacterAnalysis, StoryBible } from '../types';

export interface ValidationResult {
  scene_number: number;
  check: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

export function validateContinuity(
  scenes: Scene[],
  characters: CharacterAnalysis[],
  storyBible: StoryBible | null
): ValidationResult[] {
  const results: ValidationResult[] = [];

  scenes.forEach(scene => {
    // Check duration
    if (scene.duration_seconds !== 10) {
      results.push({
        scene_number: scene.scene_number,
        check: 'Durasi',
        status: 'fail',
        message: `Scene ${scene.scene_number} berdurasi ${scene.duration_seconds} detik, seharusnya 10 detik.`
      });
    }

    // Check dialogue presence
    if (!scene.dialogue || scene.dialogue.length === 0) {
      results.push({
        scene_number: scene.scene_number,
        check: 'Dialog',
        status: 'warning',
        message: `Scene ${scene.scene_number} tidak memiliki dialog.`
      });
    }

    // Check video prompt final
    if (!scene.video_prompt_final || scene.video_prompt_final.trim() === '') {
      results.push({
        scene_number: scene.scene_number,
        check: 'Prompt Final',
        status: 'fail',
        message: `Scene ${scene.scene_number} tidak memiliki prompt video final.`
      });
    } else {
      const prompt = scene.video_prompt_final;
      const has10sec = prompt.includes('10-second') || prompt.includes('10 second');
      const hasChars = scene.characters_present.every(id => prompt.includes(id));
      const hasDialogue = scene.dialogue.every(d => prompt.includes(d.text));
      
      if (!has10sec) {
        results.push({
          scene_number: scene.scene_number,
          check: 'Prompt - Durasi',
          status: 'warning',
          message: `Prompt scene ${scene.scene_number} tidak menyebutkan durasi 10 detik.`
        });
      }
      if (!hasChars) {
        results.push({
          scene_number: scene.scene_number,
          check: 'Prompt - Karakter',
          status: 'warning',
          message: `Prompt scene ${scene.scene_number} tidak menyebutkan semua karakter.`
        });
      }
      if (!hasDialogue) {
        results.push({
          scene_number: scene.scene_number,
          check: 'Prompt - Dialog',
          status: 'warning',
          message: `Prompt scene ${scene.scene_number} tidak memasukkan dialog lengkap.`
        });
      }
    }

    // Check character IDs exist
    scene.characters_present.forEach(id => {
      if (!characters.find(c => c.id === id)) {
        results.push({
          scene_number: scene.scene_number,
          check: 'Karakter',
          status: 'fail',
          message: `Karakter "${id}" di scene ${scene.scene_number} tidak ditemukan.`
        });
      }
    });

    // Check ending state
    if (!scene.ending_state || scene.ending_state.trim() === '') {
      results.push({
        scene_number: scene.scene_number,
        check: 'Ending State',
        status: 'warning',
        message: `Scene ${scene.scene_number} tidak memiliki ending state.`
      });
    }
  });

  // Check continuity between scenes
  for (let i = 0; i < scenes.length - 1; i++) {
    const current = scenes[i];
    const next = scenes[i + 1];
    
    if (!current.continuity_link || current.continuity_link.trim() === '') {
      results.push({
        scene_number: current.scene_number,
        check: 'Continuity Link',
        status: 'warning',
        message: `Scene ${current.scene_number} tidak memiliki continuity link.`
      });
    }
  }

  return results;
}

export function getValidationSummary(results: ValidationResult[]) {
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failures = results.filter(r => r.status === 'fail').length;
  
  let overallStatus: 'consistent' | 'needs_review' | 'conflict' = 'consistent';
  if (failures > 0) overallStatus = 'conflict';
  else if (warnings > 0) overallStatus = 'needs_review';

  return { total: results.length, passed, warnings, failures, overallStatus };
}
