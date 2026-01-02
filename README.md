# Java CFR Online Decompiler

A web-based Java decompiler running entirely in your browser.

[LiveDemo](https://dp.cutebaka.cloud/)

## Features
- **Client-side only** - No server required, privacy-focused
- **High-quality output** - CFR engine produces readable Java code
- **Syntax highlighting** - Clean code display with line numbers
- **Completely free** - No limits or registration required

## Quick Start
1. Visit the website
2. Click "Choose File" to upload `.class` or `.jar`
3. View decompiled source code instantly

## How It Works
The tool runs entirely in your browser:
1. Reads uploaded file via FileReader API
2. Uses JSZip to extract JAR files
3. Decompiles bytecode using CFR engine
4. Displays syntax-highlighted Java code

## Dependencies
```html
<!-- CFR Decompiler -->
<script src="https://cdn.jsdelivr.net/npm/@run-slicer/cfr/cfr.js"></script>

<!-- File Processing -->
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>

<!-- Code Highlighting -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlightjs-line-numbers.js/2.8.0/highlightjs-line-numbers.min.js"></script>
```

## Usage Examples
- Analyze third-party libraries
- Learn Java bytecode structure
- Educational purposes

---

**Note**: Use responsibly and respect software licenses.