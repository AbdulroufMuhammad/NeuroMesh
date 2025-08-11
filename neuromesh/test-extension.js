#!/usr/bin/env node

/**
 * Simple test runner for NeuroMesh extension
 * This script helps test the extension without requiring VS Code download
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧠 NeuroMesh Extension Test Runner');
console.log('=====================================\n');

// Test 1: Check if extension files exist
console.log('📁 Checking extension files...');
const requiredFiles = [
    'package.json',
    'src/extension.ts',
    'src/sidebar.ts',
    'dist/extension.js'
];

let filesOk = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        filesOk = false;
    }
});

if (!filesOk) {
    console.log('\n❌ Some required files are missing. Run "npm run compile" first.');
    process.exit(1);
}

// Test 2: Validate package.json
console.log('\n📦 Validating package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'displayName', 'description', 'version', 'engines', 'main', 'contributes'];
    requiredFields.forEach(field => {
        if (packageJson[field]) {
            console.log(`✅ ${field}: ${typeof packageJson[field] === 'object' ? 'defined' : packageJson[field]}`);
        } else {
            console.log(`❌ ${field} missing`);
        }
    });

    // Check commands
    if (packageJson.contributes && packageJson.contributes.commands) {
        console.log(`✅ Commands defined: ${packageJson.contributes.commands.length}`);
        packageJson.contributes.commands.forEach(cmd => {
            console.log(`   - ${cmd.command}: ${cmd.title}`);
        });
    }

    // Check views
    if (packageJson.contributes && packageJson.contributes.views) {
        console.log(`✅ Views defined`);
    }

} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    process.exit(1);
}

// Test 3: Check TypeScript compilation
console.log('\n🔧 Testing TypeScript compilation...');
try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
} catch (error) {
    console.log('❌ TypeScript compilation failed');
    console.log(error.stdout?.toString() || error.message);
}

// Test 4: Check ESLint
console.log('\n🔍 Running ESLint...');
try {
    execSync('npx eslint src --format=compact', { stdio: 'pipe' });
    console.log('✅ ESLint passed');
} catch (error) {
    const output = error.stdout?.toString();
    if (output && output.trim()) {
        console.log('⚠️  ESLint warnings/errors:');
        console.log(output);
    } else {
        console.log('✅ ESLint passed');
    }
}

// Test 5: Check extension bundle
console.log('\n📦 Checking extension bundle...');
const distPath = 'dist/extension.js';
if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    console.log(`✅ Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Basic content check
    const content = fs.readFileSync(distPath, 'utf8');
    if (content.includes('activate') && content.includes('deactivate')) {
        console.log('✅ Bundle contains required exports');
    } else {
        console.log('⚠️  Bundle may be missing required exports');
    }
} else {
    console.log('❌ Extension bundle not found');
}

// Test 6: Check media files
console.log('\n🎨 Checking media files...');
const mediaFiles = ['media/icon.svg', 'media/sidebar.css', 'media/sidebar.js'];
mediaFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`⚠️  ${file} missing (optional)`);
    }
});

console.log('\n🎉 Extension testing complete!');
console.log('\n📋 Next steps:');
console.log('1. Open this project in VS Code');
console.log('2. Press F5 to launch Extension Development Host');
console.log('3. Test the extension manually using the commands');
console.log('4. Check the NeuroMesh sidebar in the Activity Bar');
console.log('\n📖 See TESTING.md for detailed testing instructions');
