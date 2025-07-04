# 📘 API Doc Builder

A modern, open-source web app to **generate, preview, and export API documentation**—with auto-analysis, live testing (real or mock), rich export options, and seamless versioning. No sign-up needed. No vendor lock-in.

---

## ✨ Features

- **Auto Analyzer:** Paste your API endpoint, fetches and analyzes response, generates documentation and response schema automatically.
- **Manual Doc Mode:** Complete control—define endpoints, parameters, types, descriptions, and examples.
- **Request & Response Param Tables:** Add, edit, and document all your fields in clean, exportable tables (supporting types, required, enum, example, and nested/dotted fields).
- **Live Preview:** See documentation update in real-time as you edit.
- **Export Documentation:** 
  - PDF
  - Markdown (.md)
  - HTML
  - OpenAPI Spec (basic)
- **"Try It Live" Playground:**
  - Instantly test real API calls or use a **Mock Server** (auto-generates a fake response from your schema for safe demos).
- **API Versioning:** 
  - Save, name, and restore snapshots of your API docs at any time.
- **Authentication Flows:** 
  - Add Bearer tokens, API Key (header/query), or Basic Auth to both docs and live tests in one click.
- **Integration Notes:** 
  - Write rich integration guides using Markdown.
- **Dark/Light Mode:** 
  - Switch themes instantly for readability.

---

## 🚀 Quick Start

1. **Clone & install:**

   ```bash
git clone https://github.com/shantanuweb/api-doc-builder.git
cd api-doc-builder
npm install
```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview the production build:**

   ```bash
   npm run preview
   ```
