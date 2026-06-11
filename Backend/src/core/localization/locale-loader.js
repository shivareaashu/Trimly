import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './language.constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcPath = path.resolve(__dirname, '../../'); // points to Backend/src

// Global In-Memory Translations Cache Registry
export const globalLocaleRegistry = {
  ui: {},
  messages: {},
  versions: {}, // Track version tags
};

// Initialize languages structure in registry
SUPPORTED_LANGUAGES.forEach((lang) => {
  globalLocaleRegistry.ui[lang] = {};
  globalLocaleRegistry.messages[lang] = {};
});

/**
 * Startup scanner that autoloads module translation files.
 * Enforces key uniqueness across modules and outputs the QA status reports.
 */
export function loadAllTranslations() {
  const coreDir = path.join(srcPath, 'core');
  const modulesDir = path.join(srcPath, 'modules');
  
  // Track which module declared which key to detect duplicates
  const uiKeyDeclarations = {};
  const messageKeyDeclarations = {};

  const scanDirectories = [coreDir, modulesDir];

  scanDirectories.forEach((baseDir) => {
    if (!fs.existsSync(baseDir)) return;

    const modules = fs.readdirSync(baseDir);
    modules.forEach((mod) => {
      const localesPath = path.join(baseDir, mod, 'locales');
      if (!fs.existsSync(localesPath) || !fs.statSync(localesPath).isDirectory()) return;

      // Scan ui/ and messages/ subfolders
      ['ui', 'messages'].forEach((type) => {
        const typePath = path.join(localesPath, type);
        if (!fs.existsSync(typePath) || !fs.statSync(typePath).isDirectory()) return;

        const files = fs.readdirSync(typePath);
        files.forEach((file) => {
          if (!file.endsWith('.json')) return;

          const lang = path.basename(file, '.json');
          if (!SUPPORTED_LANGUAGES.includes(lang)) return;

          const filePath = path.join(typePath, file);
          let content;
          let parsed;

          try {
            content = fs.readFileSync(filePath, 'utf8');
            parsed = JSON.parse(content);
          } catch (err) {
            // Fail Fast on Invalid JSON
            throw new Error(`[Localization Boot Error] Invalid JSON formatting in file "${filePath}": ${err.message}`);
          }

          // Read version metadata if specified
          if (parsed._version) {
            const versionKey = `${mod}:${type}:${lang}`;
            globalLocaleRegistry.versions[versionKey] = parsed._version;
          }

          // Process keys
          Object.entries(parsed).forEach(([key, val]) => {
            // Skip metadata keys
            if (key.startsWith('_')) return;

            // Check Duplicate Key Collisions (Fail Fast)
            const registry = type === 'ui' ? uiKeyDeclarations : messageKeyDeclarations;
            if (registry[key] && registry[key] !== mod) {
              throw new Error(
                `[Localization Boot Collision] Duplicate translation key "${key}" found in both "${registry[key]}" and "${mod}" modules inside type "${type}".`
              );
            }
            registry[key] = mod;

            // Save to In-Memory Cache Registry
            globalLocaleRegistry[type][lang][key] = val;
          });
        });
      });
    });
  });

  console.log('🔌 In-Memory Translation Cache Loaded successfully');
  
  // Generate Translation QA Report
  generateLocalizationReport(uiKeyDeclarations, messageKeyDeclarations);
}

/**
 * Compiles a report showing translation completeness across all supported languages.
 * Writes result to both Backend and Frontend folders.
 */
function generateLocalizationReport(uiKeys, msgKeys) {
  const report = {};

  const compileKeys = (keysMap, type) => {
    Object.keys(keysMap).forEach((key) => {
      report[key] = {
        _type: type,
        _module: keysMap[key],
      };
      
      SUPPORTED_LANGUAGES.forEach((lang) => {
        const val = globalLocaleRegistry[type][lang][key];
        report[key][lang] = val !== undefined && val !== null && val !== '';
      });
    });
  };

  compileKeys(uiKeys, 'ui');
  compileKeys(msgKeys, 'messages');

  const reportJson = JSON.stringify(report, null, 2);

  // Define write paths
  const backendReportPath = path.resolve(srcPath, '../localization-report.json');
  const frontendReportPath = path.resolve(srcPath, '../../Frontend/localization-report.json');

  try {
    fs.writeFileSync(backendReportPath, reportJson, 'utf8');
    
    // Write to Frontend only if directory exists
    const frontendDir = path.resolve(srcPath, '../../Frontend');
    if (fs.existsSync(frontendDir)) {
      fs.writeFileSync(frontendReportPath, reportJson, 'utf8');
    }

    console.log(`📊 Localization QA Report written to Backend/ & Frontend/ roots.`);
  } catch (err) {
    console.error('⚠️ Failed to write localization QA report files:', err.message);
  }
}

/**
 * Resolves translation lookup key.
 * 
 * @param {string} key - Lookup key query (e.g. 'booking.select_service')
 * @param {string} [type] - 'ui' or 'messages'
 * @param {string} [language] - Target locale code
 * @returns {string} The translation string, or fallback string.
 */
export function getTranslationKey(key, type = 'ui', language = 'en') {
  const registry = globalLocaleRegistry[type];
  if (!registry) return key;

  const langCode = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

  // 1. Direct Lookup
  if (registry[langCode] && registry[langCode][key]) {
    return registry[langCode][key];
  }

  // Missing translation key logging
  if (langCode !== 'en') {
    console.warn(`[Missing Translation] Key: "${key}", Language: "${langCode}", Type: "${type}"`);
  }

  // 2. Direct English Fallback Chain
  if (langCode !== 'en' && registry['en'] && registry['en'][key]) {
    return registry['en'][key];
  }

  // 3. Fallback to key itself humanized
  return key;
}
