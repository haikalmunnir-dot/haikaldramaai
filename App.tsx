import { useState } from 'react';
import { AppView, StoryConfig, CharacterInput, CharacterAnalysis, StoryBible, Scene, Project } from './types';
import { analyzeAllCharacters } from './services/characterAnalyzer';
import { generateStory, regenerateSingleScene } from './services/storyGenerator';
import { validateContinuity, getValidationSummary, ValidationResult } from './services/validator';
import { saveProject, getAllProjects, exportAsJSON, exportAsTXT, downloadFile, copyToClipboard } from './services/storage';
import { v4 as uuidv4 } from 'uuid';
import { Film, Users, Plus, Trash2, Copy, RefreshCw, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Lock, Unlock, Save, FolderOpen, Wand2, FileText, Download, Sparkles, UserCheck } from 'lucide-react';

const DEFAULT_CONFIG: StoryConfig = {
  genre: 'Romansa CEO',
  custom_genre: '',
  story_idea: '',
  scene_count: 10,
  aspect_ratio: '9:16',
  visual_style: 'Sinematik realistis',
  dialogue_language: 'Bahasa Indonesia',
  narration_mode: 'Tanpa narator',
  ending_type: 'Bahagia',
  music_atmosphere: 'Sinematik'
};

function App() {
  const [view, setView] = useState<AppView>('input');
  const [config, setConfig] = useState<StoryConfig>(DEFAULT_CONFIG);
  const [characterInputs, setCharacterInputs] = useState<CharacterInput[]>([]);
  const [characters, setCharacters] = useState<CharacterAnalysis[]>([]);
  const [storyBible, setStoryBible] = useState<StoryBible | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [projectId] = useState(uuidv4());
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const updateConfig = (key: keyof StoryConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // CHARACTER INPUT MANAGEMENT
  const addCharacterInput = () => {
    const newInput: CharacterInput = {
      id: `INPUT_${String(characterInputs.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      physical_traits: '',
      gender: '',
      age: '',
      personality: '',
      occupation: '',
      desired_role: '',
      relationships: '',
      outfit_style: '',
      speaking_style: '',
      goals: ''
    };
    setCharacterInputs([...characterInputs, newInput]);
  };

  const updateCharacterInput = (index: number, key: keyof CharacterInput, value: string) => {
    setCharacterInputs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const removeCharacterInput = (index: number) => {
    setCharacterInputs(characterInputs.filter((_, i) => i !== index));
  };

  const resetCharacterInputs = () => {
    if (confirm('Reset semua karakter?')) {
      setCharacterInputs([]);
      setCharacters([]);
      setShowAnalysis(false);
    }
  };

  // CHARACTER ANALYSIS
  const handleAnalyzeCharacters = () => {
    if (characterInputs.length === 0) {
      notify('error', 'Tambahkan minimal satu karakter terlebih dahulu.');
      return;
    }
    const hasDescription = characterInputs.some(c => c.description.trim() !== '');
    if (!hasDescription) {
      notify('error', 'Minimal satu karakter harus memiliki deskripsi.');
      return;
    }
    const analyzed = analyzeAllCharacters(characterInputs);
    setCharacters(analyzed);
    setShowAnalysis(true);
    notify('success', `${analyzed.length} karakter berhasil dianalisis.`);
  };

  const updateCharacterAnalysis = (index: number, key: keyof CharacterAnalysis, value: any) => {
    setCharacters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const toggleCharacterLock = (index: number) => {
    setCharacters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], locked: !updated[index].locked };
      return updated;
    });
  };

  // STORY GENERATION
  const handleGenerateDrama = () => {
    if (characters.length === 0) {
      notify('error', 'Analisis karakter terlebih dahulu sebelum membuat drama.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const { storyBible: bible, scenes: newScenes } = generateStory(config, characters);
        setStoryBible(bible);
        setScenes(newScenes);
        setView('results');
        notify('success', `Drama berhasil dibuat! ${newScenes.length} scene × 10 detik = ${newScenes.length * 10} detik.`);
      } catch (e: any) {
        notify('error', e.message);
      } finally {
        setIsGenerating(false);
      }
    }, 800);
  };

  const handleRegenerateScene = (index: number) => {
    if (scenes[index]?.locked) {
      notify('error', 'Scene ini terkunci dan tidak bisa diubah.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const newScene = regenerateSingleScene(index, scenes, characters, config);
        setScenes(prev => {
          const updated = [...prev];
          updated[index] = newScene;
          return updated;
        });
        notify('success', `Scene ${index + 1} berhasil dibuat ulang.`);
      } catch (e: any) {
        notify('error', e.message);
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  const handleValidate = () => {
    const results = validateContinuity(scenes, characters, storyBible);
    setValidationResults(results);
    const summary = getValidationSummary(results);
    if (summary.failures > 0) {
      notify('error', `Ditemukan ${summary.failures} konflik. Periksa hasil validasi.`);
    } else if (summary.warnings > 0) {
      notify('info', `Validasi selesai. ${summary.warnings} peringatan.`);
    } else {
      notify('success', 'Semua scene konsisten!');
    }
  };

  // PROJECT
  const handleSaveProject = () => {
    const project: Project = {
      id: projectId,
      name: storyBible?.title || 'Drama Tanpa Judul',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      config, character_inputs: characterInputs, characters,
      story_bible: storyBible, scenes, is_demo: true
    };
    saveProject(project);
    notify('success', 'Proyek berhasil disimpan!');
  };

  const handleLoadProject = () => {
    const projects = getAllProjects();
    if (projects.length === 0) {
      notify('error', 'Belum ada proyek tersimpan.');
      return;
    }
    const latest = projects[projects.length - 1];
    setConfig(latest.config);
    setCharacterInputs(latest.character_inputs);
    setCharacters(latest.characters);
    setStoryBible(latest.story_bible);
    setScenes(latest.scenes);
    setView('results');
    notify('success', `Proyek "${latest.name}" dimuat.`);
  };

  const handleReset = () => {
    if (confirm('Reset semua data?')) {
      setConfig(DEFAULT_CONFIG);
      setCharacterInputs([]);
      setCharacters([]);
      setStoryBible(null);
      setScenes([]);
      setValidationResults([]);
      setShowAnalysis(false);
      setView('input');
      notify('success', 'Semua data direset.');
    }
  };

  // EXPORT
  const handleExportJSON = () => {
    const project: Project = {
      id: projectId, name: storyBible?.title || 'Drama',
      created_at: '', updated_at: '', config, character_inputs: characterInputs,
      characters, story_bible: storyBible, scenes, is_demo: true
    };
    downloadFile(exportAsJSON(project), `${storyBible?.title || 'drama'}.json`, 'application/json');
    notify('success', 'File JSON diunduh!');
  };

  const handleExportTXT = () => {
    const project: Project = {
      id: projectId, name: storyBible?.title || 'Drama',
      created_at: '', updated_at: '', config, character_inputs: characterInputs,
      characters, story_bible: storyBible, scenes, is_demo: true
    };
    downloadFile(exportAsTXT(project), `${storyBible?.title || 'drama'}.txt`, 'text/plain');
    notify('success', 'File TXT diunduh!');
  };

  const handleCopyPrompt = async (prompt: string) => {
    await copyToClipboard(prompt);
    notify('success', 'Prompt berhasil disalin!');
  };

  const handleCopyAllPrompts = async () => {
    const all = scenes.map(s =>
      `${'═'.repeat(50)}\nSCENE ${String(s.scene_number).padStart(2, '0')}: ${s.title}\n${'═'.repeat(50)}\n\n${s.video_prompt_final}\n`
    ).join('\n\n');
    await copyToClipboard(all);
    notify('success', 'Semua prompt disalin!');
  };

  const toggleSceneLock = (index: number) => {
    setScenes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], locked: !updated[index].locked };
      return updated;
    });
  };

  const validationSummary = validationResults.length > 0 ? getValidationSummary(validationResults) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-indigo-600" />
            <div>
              <h1 className="text-lg font-bold">AI DRAMA STUDIO</h1>
              <p className="text-xs text-gray-500">Mode Demo — Cerita dihasilkan dari template</p>
            </div>
          </div>
          <div className="flex gap-2">
            {view === 'results' && (
              <button onClick={() => setView('input')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                ← Edit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className={`rounded-lg p-3 flex items-center gap-2 shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <XCircle className="w-4 h-4" />}
            {notification.type === 'info' && <AlertTriangle className="w-4 h-4" />}
            <p className="text-sm">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium">Sedang membuat drama...</p>
            <p className="text-xs text-gray-500">Mode Demo — Menggunakan template cerita</p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* INPUT VIEW */}
        {view === 'input' && (
          <div className="space-y-6">
            {/* 1. Story Idea & Genre */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-600" /> Ide & Genre Cerita
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre Drama</label>
                  <select value={config.genre} onChange={e => updateConfig('genre', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {['Romansa CEO', 'K-Drama Korea', 'C-Drama China', 'Drama Indonesia', 'Misteri', 'Thriller', 'Fantasi', 'Horor', 'Komedi Romantis', 'Drama Keluarga', 'Drama Kerajaan'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Scene</label>
                  <select value={config.scene_count} onChange={e => updateConfig('scene_count', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value={5}>5 scene (50 detik)</option>
                    <option value={10}>10 scene (100 detik)</option>
                    <option value={15}>15 scene (150 detik)</option>
                    <option value={20}>20 scene (200 detik)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ide Cerita (opsional)</label>
                <textarea value={config.story_idea} onChange={e => updateConfig('story_idea', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" placeholder="Tulis ide cerita atau biarkan sistem yang menentukan..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format Video</label>
                  <select value={config.aspect_ratio} onChange={e => updateConfig('aspect_ratio', e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="9:16">Vertikal 9:16</option>
                    <option value="16:9">Horizontal 16:9</option>
                    <option value="1:1">Persegi 1:1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gaya Visual</label>
                  <select value={config.visual_style} onChange={e => updateConfig('visual_style', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {['Sinematik realistis', 'C-Drama modern', 'K-Drama modern', 'Horor realistis', 'Fantasi realistis'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa Dialog</label>
                  <select value={config.dialogue_language} onChange={e => updateConfig('dialogue_language', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="English">English</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Korean">Korean</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Character Input */}
            <section className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> KARAKTER PILIHAN SAYA
                </h2>
                <button onClick={addCharacterInput} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> Tambah Karakter
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Masukkan karakter yang ingin kamu gunakan. Kamu boleh memasukkan deskripsi fisik, sifat, pekerjaan, atau cukup menuliskan gambaran karakter. AI akan menganalisis dan menyesuaikannya dengan cerita.
              </p>

              {characterInputs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">Belum ada karakter. Klik "Tambah Karakter" untuk mulai.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {characterInputs.map((input, idx) => (
                    <div key={input.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Karakter {idx + 1}</span>
                        <button onClick={() => removeCharacterInput(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Nama (opsional)</label>
                          <input value={input.name} onChange={e => updateCharacterInput(idx, 'name', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-sm" placeholder="Nama karakter" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Deskripsi Karakter <span className="text-red-500">*</span></label>
                          <textarea value={input.description} onChange={e => updateCharacterInput(idx, 'description', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-sm h-16 resize-none" placeholder='Contoh: "Pria China berusia 32 tahun, wajah tampan dan tegas, rambut hitam rapi, memakai jas hitam, terlihat dingin dan pendiam."' />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Jenis Kelamin</label>
                            <select value={input.gender} onChange={e => updateCharacterInput(idx, 'gender', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-xs">
                              <option value="">Otomatis</option>
                              <option value="pria">Pria</option>
                              <option value="wanita">Wanita</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Usia</label>
                            <input value={input.age} onChange={e => updateCharacterInput(idx, 'age', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-xs" placeholder="25-35" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Pekerjaan</label>
                            <input value={input.occupation} onChange={e => updateCharacterInput(idx, 'occupation', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-xs" placeholder="CEO" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Peran</label>
                            <input value={input.desired_role} onChange={e => updateCharacterInput(idx, 'desired_role', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-xs" placeholder="Tokoh utama" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Ciri fisik yang harus dipertahankan</label>
                            <input value={input.physical_traits} onChange={e => updateCharacterInput(idx, 'physical_traits', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-xs" placeholder="Rambut hitam, wajah tegas" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Gaya pakaian</label>
                            <input value={input.outfit_style} onChange={e => updateCharacterInput(idx, 'outfit_style', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 border rounded text-xs" placeholder="Jas hitam formal" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Character Action Buttons */}
              {characterInputs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <button onClick={handleAnalyzeCharacters} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    <Sparkles className="w-4 h-4" /> Analisis Karakter
                  </button>
                  <button onClick={resetCharacterInputs} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    <RefreshCw className="w-4 h-4" /> Reset Karakter
                  </button>
                </div>
              )}
            </section>

            {/* 3. Character Analysis Results */}
            {showAnalysis && characters.length > 0 && (
              <section className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" /> Hasil Analisis Karakter
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Ciri fisik yang ditentukan pengguna ditandai sebagai <strong>"Tetap"</strong>. Detail tambahan dari analisis ditandai sebagai <em>"Kreatif"</em>. Edit peran dan detail sebelum membuat drama.
                </p>
                <div className="space-y-3">
                  {characters.map((char, idx) => (
                    <div key={char.id} className={`border rounded-lg p-4 ${char.locked ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{char.id}</span>
                          <span className="font-medium">{char.name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{char.role_confirmed}</span>
                          {char.locked && <Lock className="w-3 h-3 text-indigo-600" />}
                        </div>
                        <button onClick={() => toggleCharacterLock(idx)} className="p-1 rounded hover:bg-gray-100">
                          {char.locked ? <Lock className="w-4 h-4 text-indigo-600" /> : <Unlock className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 font-medium">Ciri Fisik Tetap (dari pengguna):</p>
                          <ul className="mt-1 space-y-0.5">
                            {char.physical_fixed.map((t, i) => <li key={i} className="text-green-700">✓ {t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Ciri Fisik Tambahan (analisis):</p>
                          <ul className="mt-1 space-y-0.5">
                            {char.physical_creative.map((t, i) => <li key={i} className="text-blue-700">✦ {t}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-gray-500">Peran:</label>
                          <input value={char.role_confirmed} onChange={e => updateCharacterAnalysis(idx, 'role_confirmed', e.target.value)} className="w-full mt-0.5 px-2 py-1 border rounded" />
                        </div>
                        <div>
                          <label className="text-gray-500">Usia:</label>
                          <input value={char.age_range} onChange={e => updateCharacterAnalysis(idx, 'age_range', e.target.value)} className="w-full mt-0.5 px-2 py-1 border rounded" />
                        </div>
                        <div>
                          <label className="text-gray-500">Kepribadian:</label>
                          <input value={char.personality} onChange={e => updateCharacterAnalysis(idx, 'personality', e.target.value)} className="w-full mt-0.5 px-2 py-1 border rounded" />
                        </div>
                        <div>
                          <label className="text-gray-500">Pakaian Default:</label>
                          <input value={char.default_outfit} onChange={e => updateCharacterAnalysis(idx, 'default_outfit', e.target.value)} className="w-full mt-0.5 px-2 py-1 border rounded" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-xs text-gray-500">Visual Identity (untuk prompt):</label>
                        <p className="text-xs mt-0.5 bg-gray-100 p-2 rounded font-mono">{char.visual_identity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Generate Button */}
            <section className="bg-white rounded-xl border p-5">
              <div className="flex flex-wrap gap-2">
                <button onClick={handleGenerateDrama} disabled={characters.length === 0 || isGenerating} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Wand2 className="w-5 h-5" /> Buat Drama Otomatis
                </button>
                <button onClick={handleSaveProject} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  <Save className="w-4 h-4" /> Simpan
                </button>
                <button onClick={handleLoadProject} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  <FolderOpen className="w-4 h-4" /> Muat
                </button>
                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100">
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
              {characters.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">⚠ Tambahkan dan analisis karakter terlebih dahulu.</p>
              )}
            </section>
          </div>
        )}

        {/* RESULTS VIEW */}
        {view === 'results' && (
          <div className="space-y-4">
            {/* Story Bible */}
            {storyBible && (
              <section className="bg-white rounded-xl border p-5">
                <h2 className="text-lg font-semibold mb-3">📖 {storyBible.title}</h2>
                <p className="text-sm text-gray-700 mb-2">{storyBible.synopsis}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
                  <div><span className="font-medium">Genre:</span> {storyBible.genre}</div>
                  <div><span className="font-medium">Konflik:</span> {storyBible.main_conflict}</div>
                  <div><span className="font-medium">Ending:</span> {storyBible.ending}</div>
                </div>
              </section>
            )}

            {/* Validation */}
            {validationSummary && (
              <div className={`rounded-lg border p-3 ${validationSummary.overallStatus === 'consistent' ? 'bg-green-50 border-green-200' : validationSummary.overallStatus === 'needs_review' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 text-sm">
                  {validationSummary.overallStatus === 'consistent' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {validationSummary.overallStatus === 'needs_review' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  {validationSummary.overallStatus === 'conflict' && <XCircle className="w-4 h-4 text-red-600" />}
                  <span className="font-medium">
                    {validationSummary.overallStatus === 'consistent' ? 'Konsisten' : validationSummary.overallStatus === 'needs_review' ? 'Perlu Diperiksa' : 'Konflik'}
                  </span>
                  <span className="text-xs text-gray-500">({validationSummary.passed}✓ {validationSummary.warnings}⚠ {validationSummary.failures}✗)</span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2">
              <button onClick={handleValidate} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                <CheckCircle className="w-4 h-4" /> Periksa Konsistensi
              </button>
              <button onClick={handleCopyAllPrompts} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                <Copy className="w-4 h-4" /> Salin Semua Prompt
              </button>
              <button onClick={handleExportTXT} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                <Download className="w-4 h-4" /> Unduh TXT
              </button>
              <button onClick={handleExportJSON} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                <FileText className="w-4 h-4" /> Unduh JSON
              </button>
            </div>

            {/* Scene Cards */}
            <div className="space-y-3">
              {scenes.map((scene, idx) => (
                <div key={idx} className={`bg-white rounded-xl border overflow-hidden ${scene.locked ? 'border-indigo-200' : 'border-gray-200'}`}>
                  {/* Scene Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer" onClick={() => setExpandedScene(expandedScene === idx ? null : idx)}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">SCENE {String(scene.scene_number).padStart(2, '0')}</span>
                      <span className="font-medium text-sm">{scene.title}</span>
                      <span className="text-xs text-gray-400">10 detik</span>
                      {scene.locked && <Lock className="w-3 h-3 text-indigo-600" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {scene.continuity_status === 'consistent' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {expandedScene === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedScene === idx && (
                    <div className="p-4 space-y-4">
                      {/* Info */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Lokasi:</span> {scene.location}</div>
                        <div><span className="text-gray-500">Waktu:</span> {scene.time_of_day}</div>
                        <div><span className="text-gray-500">Karakter:</span> {scene.characters_present.join(', ')}</div>
                      </div>

                      {/* Narration */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Narasi Cerita:</p>
                        <p className="text-sm text-gray-700">{scene.narration}</p>
                      </div>

                      {/* Dialogue */}
                      {scene.dialogue.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Dialog:</p>
                          <div className="space-y-1">
                            {scene.dialogue.map((d, di) => (
                              <p key={di} className="text-sm">
                                <span className="font-medium text-indigo-700">{d.character_name}:</span>
                                <span className="text-gray-800"> "{d.text}"</span>
                                <span className="text-xs text-gray-400 ml-1">({d.emotion})</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PROMPT VIDEO FINAL - THE MAIN FEATURE */}
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-indigo-800">PROMPT VIDEO FINAL</p>
                          <button onClick={() => handleCopyPrompt(scene.video_prompt_final)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700">
                            <Copy className="w-3 h-3" /> Salin Prompt
                          </button>
                        </div>
                        <pre className="text-xs text-indigo-900 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">{scene.video_prompt_final}</pre>
                      </div>

                      {/* Continuity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="font-medium text-gray-500">Ending State:</p>
                          <p className="text-gray-700">{scene.ending_state}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="font-medium text-gray-500">Continuity Link:</p>
                          <p className="text-gray-700">{scene.continuity_link}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <button onClick={() => handleRegenerateScene(idx)} disabled={scene.locked || isGenerating} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-xs hover:bg-indigo-200 disabled:opacity-50">
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                        <button onClick={() => handleCopyPrompt(scene.video_prompt_final)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                          <Copy className="w-3 h-3" /> Salin Prompt
                        </button>
                        <button onClick={() => toggleSceneLock(idx)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                          {scene.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {scene.locked ? 'Terkunci' : 'Kunci'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <span>AI Drama Studio • Mode Demo • {scenes.length} scene • {characters.length} karakter</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            Template-based generation
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
