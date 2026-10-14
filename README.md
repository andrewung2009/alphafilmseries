<p align="center">
  <img src="assets/images/alphahtbb.jpg" alt="Alpha Resource Hub banner" width="760">
</p>

<h1 align="center">Alpha Resource Hub for Hosts and Helpers</h1>

<p align="center">
  Equipping Alpha hosts and helpers with everything they need to create warm, welcoming spaces for conversations about life, faith and God.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=fff" alt="HTML5">
  <img src="https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat&logo=bootstrap&logoColor=fff" alt="Bootstrap 5">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/content-data.json-ff69b4?style=flat" alt="Content driven by data.json">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Weekly Resources](#weekly-resources)
- [Weekend Away Resources](#weekend-away-resources)
- [Additional Resources](#additional-resources)
- [Editing Your Content](#editing-your-content)
- [Google Sheets Integration](#google-sheets-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Contact](#contact)

## Overview

The **Alpha Resource Hub** provides organised access to training materials, week-by-week resources, weekend-away content and additional guides for people running Alpha courses.

It is a responsive, data-driven static site: all content lives in a single JSON file, so updates go live with no build step — edit, save, refresh.

## Features

| Feature | Description |
| --- | --- |
| 📚 Training Videos | Essential preparation videos for hosts and helpers |
| 📅 Week-by-Week Guide | Complete materials for every Alpha week |
| 🏕️ Weekend Away Resources | Talks, guides and materials for the Alpha weekend |
| ❓ FAQs | Answers to common questions about running Alpha |
| 💡 Share What Works | Submit icebreakers, discussion questions and tips |
| 🔗 Additional Resources | Extra tools and helpful links |

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection for streaming videos
- [Python](https://www.python.org/) or [Node.js](https://nodejs.org/) for running a local server (optional but recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/michaeltingkc/Alpha-HTBB.git
   cd Alpha-HTBB
   ```

2. **Windows — easiest:** double-click `start.bat`. The server starts and the site opens in your browser automatically.

   **Or start a server manually** — this step is required because browsers block loading `data/data.json` over the `file://` protocol:

   ```bash
   python -m http.server 8000
   ```

   or

   ```bash
   npx http-server
   ```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.

## Project Structure

```text
Alpha-HTBB/
├── index.html            # Page markup and app entry point
├── admin.html            # Admin panel — edit content without touching code
├── start.bat             # Double-click to run the site locally (Windows)
├── css/
│   ├── style.css         # Site styling
│   └── admin.css         # Admin panel styling
├── js/
│   ├── main.js           # App logic — renders content from data.json
│   ├── admin.js          # Admin panel logic (saves via GitHub)
│   └── admin-config.js   # Admin settings — password, repository
├── assets/
│   └── images/           # Logos and hero image
├── data/
│   └── data.json         # ⭐ All site content
└── README.md
```

## Weekly Resources

Every week follows the same structure: an Alpha talk, a host & helper briefing, a guest guide, a team guide, an icebreaker, discussion questions and tips.

| # | Title | Talk |
| --- | --- | --- |
| 1 | Is There More to Life Than This? | [Watch](https://player.vimeo.com/video/184825483) |
| 2 | Who Is Jesus? | [Watch](https://player.vimeo.com/video/184825484) |
| 3 | Why Did Jesus Die? | [Watch](https://player.vimeo.com/video/250767723) |
| 4 | How Can I Have Faith? | [Watch](https://player.vimeo.com/video/250771916) |
| 5 | Why and How Do I Pray? | [Watch](https://player.vimeo.com/video/250771919) |
| 6 | Why and How Should I Read the Bible? | [Watch](https://player.vimeo.com/video/184825488) |
| 7 | How Does God Guide Us? | [Watch](https://player.vimeo.com/video/250771931) |
| 8 | How Can I Resist Evil? | [Watch](https://player.vimeo.com/video/250771966) |
| 9 | Does God Heal Today? | [Watch](https://player.vimeo.com/video/184825500) |
| 10 | What About The Church? | [Watch](https://player.vimeo.com/video/250771976) |

All briefings, guides, icebreakers, discussion questions and tips are maintained in [`data/data.json`](data/data.json).

### Week 1 — *Is There More to Life Than This?*

- **Alpha Talk:** [Vimeo](https://player.vimeo.com/video/184825483)
- **Host & Helper Briefing:** [Vimeo](https://player.vimeo.com/video/340385686)
- **Guest Guide:** [Google Drive](https://drive.google.com/drive/folders/1N2wuDY9YybXy1xsxgcjemgzaoGFzFOXj)
- **Team Guide:** [Google Drive](https://drive.google.com/file/d/14HDWNy1MJc2THSJF-AYqDse4pIOiRuM8/view)
- **Icebreaker:** Say your name with an adjective that starts with the same letter.
- **Discussion Questions:**
  - How and why did you come to Alpha?
  - If it turned out there *was* a God...
- **Tips:** Arrive early and welcome guests intentionally.

### Week 2 — *Who Is Jesus?*

- **Alpha Talk:** [Vimeo](https://player.vimeo.com/video/184825484)
- **Host & Helper Briefing:** [Vimeo](https://player.vimeo.com/video/340385692)
- **Guest Guide:** [Google Drive](https://drive.google.com/file/d/1jttEyvllS8ycR4CDC8f82mvUWGlTg16-/view)
- **Team Guide:** [Google Drive](https://drive.google.com/file/d/1wXpmbb3PxpBnIxcct-6WDR9HBVEZfsyt/view)
- **Icebreaker:** If you were stuck on a desert island and could take *one thing*...
- **Discussion Questions:** What makes you happy? What do you think about Jesus?
- **Tips:** Consistency matters — arrive early.

## Weekend Away Resources

### Main Talks

- **Introduction:** [Vimeo](https://player.vimeo.com/video/184825491)
- **Who Is the Holy Spirit?:** [Vimeo](https://player.vimeo.com/video/184825492)
- **What Does the Holy Spirit Do?:** [Vimeo](https://player.vimeo.com/video/184825493)
- **How Can I Be Filled?:** [Vimeo](https://player.vimeo.com/video/184825495)
- **How Can I Make the Most of My Life?:** [Vimeo](https://player.vimeo.com/video/184825496)

### Training Videos

- Prayer & The Weekend — [Vimeo](https://player.vimeo.com/video/214170194)
- Prayer Ministry — [Vimeo](https://player.vimeo.com/video/490974388)

### Guest Guides

- Who Is The Holy Spirit? — [Google Drive](https://drive.google.com/file/d/1fN1i5ql7BCbHKpk1iRxGlywYJWWnBcXN/view)
- What Does He Do? — [Google Drive](https://drive.google.com/file/d/1yDghXCu0EBqrQcmjxQNx1nUv5PtTqw96/view)
- How Can I Be Filled? — [Google Drive](https://drive.google.com/file/d/1S5wDQykDAsPliN8Tzy7xCA1bpgWgwdm3/view)
- How Can I Make the Most of Life? — [Google Drive](https://drive.google.com/file/d/1Jn3Q8vFh2wENFUmHeLIg64-SMujpd-p-/view)

### Team Guides

- Who Is The Holy Spirit? — [Google Drive](https://drive.google.com/file/d/1TMxEOrH6lpGAz4UL_q7xMyP6h-qBGa0s/view?usp=sharing)
- What Does He Do? — [Google Drive](https://drive.google.com/file/d/1wDqgHpSqTl5ptGQm8XvDgnYAA2h2Xqja/view?usp=sharing)
- How Can I Be Filled? — [Google Drive](https://drive.google.com/file/d/1tG6icY40KUnisieiv_0cJMflYR1ORyST/view?usp=sharing)
- How Can I Make the Most of Life? — [Google Drive](https://drive.google.com/file/d/1u0H8pK5sFM3hQKu-F46oEQ5Szej1BS3_/view?usp=sharing)

## Additional Resources

| Resource | Link |
| --- | --- |
| Alpha Toolbox | [Google Drive](https://drive.google.com/file/d/1MaTKJIATzN0DxHm4wtDJBHevWiuLTreC/view) |
| Small Group Training | [Google Drive](https://drive.google.com/file/d/1Hzpl5qqQlsQXpjelEF1_C1OVaynJkdlZ/view) |
| The Bible with Nicky and Pippa Gumbel | [bible.alpha.org](https://bible.alpha.org/en/) |
| YouVersion Bible App | [bible.com](https://www.bible.com/app) |

## Editing Your Content

**No coding needed.** The site includes an admin panel that edits all content through simple forms — no JSON, no terminal, no pull requests.

### Opening the panel

1. Open `admin.html`:
   - **Online:** `https://michaeltingkc.github.io/Alpha-HTBB/admin.html`
   - **Locally:** double-click `start.bat`, then visit `http://localhost:8080/admin.html`
2. Enter the admin password (set in [`js/admin-config.js`](js/admin-config.js) — change it there)
3. Enter your GitHub access token once — the browser remembers it for next time

### One-time token setup

1. Go to [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) (sign in to GitHub first)
2. **Token name:** anything, e.g. `Alpha Hub Admin`
3. **Repository access:** Only select repositories → `Alpha-HTBB`
4. **Permissions → Repository permissions → Contents:** Read and write
5. Click **Generate token**, copy it, and paste it into the panel

Only people holding a valid token for this repository can save changes — GitHub itself enforces that. The password simply keeps visitors out of the editor screen. Revoke a token at any time from the same GitHub settings page.

> **Repository owned by someone else?** A token can never grant more access than your own GitHub account has. If the repository belongs to another person or organisation, ask the owner to set your account to the **Write** role under **Settings → Collaborators** — only then will a correctly configured token be able to save.

### Making a change

1. Pick a tab: **Training Videos**, **Week-by-Week**, **Weekend Away**, **FAQs** or **Extra Resources**
2. Edit fields directly — for lists (icebreakers, questions, tips) write **one item per line**
3. Press **Save to website** — the panel commits `data/data.json` for you, and GitHub Pages redeploys within about a minute

The **FAQs** tab feeds a section on the site between Weekend Away and Share What Works; that section (and its menu links) stays hidden while no FAQs are filled in.

Every save is a git commit, so the repository history is a full undo/restore log. The **Download backup** button saves a copy of the content file to your computer.

### Editing `data.json` by hand (optional)

Advanced users can still edit [`data/data.json`](data/data.json) directly. It begins with a 👋 `_instructions` block of rules (keep the quotes, colons and commas intact) — a malformed JSON file will break the site, which is why the admin panel is the recommended path.

## Google Sheets Integration

The "Share What Works" form submits to a Google Sheet:

1. Create a Google Sheet with columns: `timestamp`, `name`, `role`, `category`, `weekNumber`, `idea`
2. Open **Extensions → Apps Script**
3. Paste this code:

   ```javascript
   function doPost(e) {
     try {
       const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       const data = JSON.parse(e.postData.contents);

       if (!data.timestamp) {
         data.timestamp = new Date().toISOString();
       }

       const row = [
         data.timestamp,
         data.name,
         data.role,
         data.category,
         data.weekNumber,
         data.idea
       ];

       sheet.appendRow(row);

       return ContentService
         .createTextOutput(JSON.stringify({
           status: 'success',
           message: 'Form submitted successfully'
         }))
         .setMimeType(ContentService.MimeType.JSON);

     } catch (error) {
       return ContentService
         .createTextOutput(JSON.stringify({
           status: 'error',
           message: error.toString()
         }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```

4. Deploy as a web app
5. Replace `GOOGLE_SCRIPT_URL` in `js/main.js` with your deployment URL

## Deployment

The site is fully static — any static host works. For GitHub Pages:

1. Open **Settings → Pages** in this repository
2. Under **Build and deployment**, select **Deploy from a branch**
3. Choose `main` / `(root)` and save

The site will be live at `https://michaeltingkc.github.io/Alpha-HTBB/`.

## Contributing

You can contribute by:

1. **Submitting ideas** via the "Share What Works" form on the site
2. **Reporting issues** on GitHub
3. **Opening pull requests** for improvements

## Contact

For support: **[michael.ting@htbb.org](mailto:michael.ting@htbb.org)**

© 2026 Alpha Course Resources. All rights reserved.
