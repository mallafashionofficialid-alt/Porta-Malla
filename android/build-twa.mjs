// Membuat proyek Android (Trusted Web Activity) untuk Portal Malla Official
// memakai @bubblewrap/core — pustaka yang sama yang dipakai PWABuilder & Bubblewrap CLI.
// Dijalankan oleh workflow .github/workflows/build-android.yml
import { TwaGenerator, TwaManifest, ConsoleLog } from '@bubblewrap/core';
import path from 'node:path';

const MANIFEST_URL =
  process.env.MANIFEST_URL ||
  'https://mallafashionofficialid-alt.github.io/Porta-Malla/portal-malla-app/manifest.webmanifest';
const PACKAGE_ID = process.env.PACKAGE_ID || 'id.co.mallaofficial.portal';
const VERSION_CODE = parseInt(process.env.VERSION_CODE || '1', 10);
const VERSION_NAME = process.env.VERSION_NAME || `1.0.${VERSION_CODE}`;
const KEYSTORE_PATH = path.resolve(process.env.KEYSTORE_PATH || 'android-build/malla.keystore');
const KEY_ALIAS = process.env.KEY_ALIAS || 'malla';
const OUT_DIR = path.resolve(process.env.PROJECT_DIR || 'android-build/project');

const log = new ConsoleLog('build-twa');

const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
if (!res.ok) throw new Error(`Gagal mengambil manifest (${res.status}): ${MANIFEST_URL}`);
const webManifest = await res.json();

const twa = TwaManifest.fromWebManifestJson(new URL(MANIFEST_URL), webManifest);
twa.packageId = PACKAGE_ID;
twa.appVersionCode = VERSION_CODE;
twa.appVersionName = VERSION_NAME;
twa.signingKey = { path: KEYSTORE_PATH, alias: KEY_ALIAS };
twa.enableNotifications = false;
twa.minSdkVersion = 24; // androidbrowserhelper 2.7+ butuh minimal Android 7.0 (API 24)

const errors = twa.validate();
if (errors) throw new Error('Konfigurasi TWA tidak valid: ' + errors);

log.info(`Paket: ${twa.packageId} | Host: ${twa.host} | Start: ${twa.startUrl} | Versi: ${VERSION_NAME} (${VERSION_CODE})`);
await new TwaGenerator().createTwaProject(OUT_DIR, twa, log);
await twa.saveToFile(path.join(OUT_DIR, 'twa-manifest.json'));
log.info('Proyek Android berhasil dibuat di ' + OUT_DIR);
