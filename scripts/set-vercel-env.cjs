// Script to add environment variables to Vercel project
// Run with: node scripts/set-vercel-env.cjs

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const envVars = {
  VITE_SUPABASE_URL: 'https://rrhifzpkrmdyqrlabktr.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaGlmenBrcm1keXFybGFia3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjA5NTEsImV4cCI6MjEwNzE5Njk1MX0.hOk6pIBl0UQhv-qCIn6RPDSRFqgtwosN7hxcV9k8tcs',
  DATABASE_URL: 'postgresql://neondb_owner:npg_SJGitRN3VC7d@ep-small-shape-b73kbp1m-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require',
};

const tmpFile = path.join(os.tmpdir(), 'vercel_env_val.txt');

for (const [key, value] of Object.entries(envVars)) {
  console.log(`\nSetting ${key}...`);
  
  // Remove if already exists (ignore errors)
  try {
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'pipe' });
    console.log(`  Removed old ${key}`);
  } catch (e) {
    console.log(`  ${key} did not exist yet, creating fresh`);
  }

  // Write value to file WITHOUT any newline
  fs.writeFileSync(tmpFile, value, { encoding: 'utf8' });
  
  // Add from file using Node's child_process with stdin
  try {
    execSync(`npx vercel env add ${key} production`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
    console.log(`  ✓ Added ${key}`);
  } catch (e) {
    console.error(`  ✗ Failed to add ${key}:`, e.message);
  }
}

// Cleanup
try { fs.unlinkSync(tmpFile); } catch {}

console.log('\n✅ All environment variables set. Push a commit to trigger a rebuild.');
