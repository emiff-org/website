#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Basic slugify function
function slugify(str) {
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9]/g, '-')   // replace non-alphanumerics
    .replace(/--+/g, '-')            // remove double dashes
    .replace(/^-+|-+$/g, '')         // trim dashes
    .toLowerCase();
}

// Transforms a local file path to full URL with slugified filename
function transformPath(localPath, baseUrl) {
  const parts = localPath.replace(/^\.\//, '').split('/');

  const filename = parts.pop();
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  let newName;
  if (ext === '.gsheet') {
    newName = slugify(name) + '.json';
  } else {
    newName = slugify(name) + ext; // keeps .gdoc etc.
  }

  const cleanParts = parts.map(decodeURIComponent); // optionally slugify folders too
  cleanParts.push(newName);

  return baseUrl.replace(/\/$/, '') + '/' + cleanParts.join('/');
}

// CLI usage
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const baseUrl = process.argv[4]; // e.g. https://main--website--emiff-org.aem.page/en

if (!inputFile || !outputFile || !baseUrl) {
  console.error('Usage: node transform.js <input.txt> <output.txt> <baseUrl>');
  process.exit(1);
}

const lines = fs.readFileSync(inputFile, 'utf-8').split('\n').filter(Boolean);
const urls = lines.map(line => transformPath(line.trim(), baseUrl));
fs.writeFileSync(outputFile, urls.join('\n'), 'utf-8');

console.log(`✅ Written ${urls.length} URLs to: ${outputFile}`);