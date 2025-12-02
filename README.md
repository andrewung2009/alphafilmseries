# Alpha Resource Hub for Hosts and Helpers

A comprehensive, GitHub‑friendly resource platform designed to equip
Alpha course hosts and helpers with everything needed to create warm and
welcoming environments for conversations about life, faith, and God.

## Overview

The **Alpha Resource Hub** provides organized access to training
materials, weekly resources, weekend-away content, and additional guides
to support those running Alpha courses.\
This responsive web application makes it easy to find, view, and share
resources for both in‑person and online Alpha sessions.

## Features

  -----------------------------------------------------------------------
  Feature                     Description
  --------------------------- -------------------------------------------
  📚 Training Videos          Essential preparation videos for hosts and
                              helpers

  📅 Week‑by‑Week Guide       Complete materials for all 11 Alpha weeks

  🏕️ Weekend Away Resources   Specialized materials for the Alpha weekend
                              experience

  ❓ FAQs                     Answers to common questions about running
                              Alpha

  💡 Share What Works         Submit icebreakers, discussion questions,
                              and tips

  🔗 Additional Resources     Extra tools and helpful links
  -----------------------------------------------------------------------

## Getting Started

### Prerequisites

-   A modern web browser (Chrome, Firefox, Safari, Edge)
-   Internet connection for viewing videos

### Installation

1.  Clone this repository:

        git clone https://github.com/your-username/alpha-resource-hub.git

2.  Open `index.html`:

        open index.html

3.  Optional: run a local dev server

        python -m http.server 8000

    or

        npx http-server

## Weekly Resources

Below is the structure for each Alpha week:

### Week 1 --- *Is There More to Life Than This?*

-   **Alpha Talk:** https://player.vimeo.com/video/184825483\
-   **Host & Helper Briefing:**
    https://player.vimeo.com/video/340385686\
-   **Guest Guide:**
    https://drive.google.com/drive/folders/1N2wuDY9YybXy1xsxgcjemgzaoGFzFOXj\
-   **Team Guide:**
    https://drive.google.com/file/d/14HDWNy1MJc2THSJF-AYqDse4pIOiRuM8/view\
-   **Icebreaker:** Say your name with an adjective that starts with the
    same letter.\
-   **Discussion Questions:**
    -   How and why did you come to Alpha?\
    -   If it turned out there *was* a God...\
-   **Tips:** Arrive early and welcome guests intentionally.

### Week 2 --- *Who Is Jesus?*

-   **Alpha Talk:** https://player.vimeo.com/video/184825484\
-   **Host & Helper Briefing:**
    https://player.vimeo.com/video/340385692\
-   **Guest Guide:**
    https://drive.google.com/file/d/1jttEyvllS8ycR4CDC8f82mvUWGlTg16-/view\
-   **Team Guide:**
    https://drive.google.com/file/d/1wXpmbb3PxpBnIxcct-6WDR9HBVEZfsyt/view\
-   **Icebreaker:** If you were stuck on a desert island and could take
    *one thing*...\
-   **Discussion Questions:** What makes you happy? What do you think
    about Jesus?\
-   **Tips:** Consistency matters --- arrive early.

*(Weeks 3--11 follow the same structure and should be added with their
respective links.)*

## Weekend Away Resources

### Main Talks

-   **Introduction:** https://player.vimeo.com/video/184825491\
-   **Who is the Holy Spirit?:**
    https://player.vimeo.com/video/184825492\
-   **What does the Holy Spirit do?:**
    https://player.vimeo.com/video/184825493\
-   **How can I be filled?:** https://player.vimeo.com/video/184825495\
-   **How can I make the most of my life?:**
    https://player.vimeo.com/video/184825496

### Training Videos

-   Prayer & The Weekend --- https://player.vimeo.com/video/214170194\
-   Prayer Ministry --- https://player.vimeo.com/video/490974388

### Guest Guides

-   Who Is The Holy Spirit? ---
    https://drive.google.com/file/d/1fN1i5ql7BCbHKpk1iRxGlywYJWWnBcXN/view\
-   What Does He Do? ---
    https://drive.google.com/file/d/1yDghXCu0EBqrQcmjxQNx1nUv5PtTqw96/view\
-   How Can I Be Filled? ---
    https://drive.google.com/file/d/1S5wDQykDAsPliN8Tzy7xCA1bpgWgwdm3/view\
-   How Can I Make the Most of Life? ---
    https://drive.google.com/file/d/1Jn3Q8vFh2wENFUmHeLIg64-SMujpd-p-/view

### Team Guides

-   Who Is The Holy Spirit? ---
    https://drive.google.com/file/d/1_HwU497m5NO0N--v5669igJ2kRmjrcng/view\
-   What Does He Do? ---
    https://drive.google.com/file/d/1xb9JPEWRFUaAFWY_PufnrdqEDynA_0MW/view\
-   How Can I Be Filled? ---
    https://drive.google.com/file/d/1hIkGiM0ZcdWOb1VyZUpG9QvAa4jT2mE6/view\
-   How Can I Make the Most of Life? ---
    https://drive.google.com/file/d/108Cf2uiep7S0qe67IGTTNwRQVVvCJQMA/view

## Additional Resources

  -------------------------------------------------------------------------------------------------------------------
  Resource                                   Link
  ------------------------------------------ ------------------------------------------------------------------------
  Alpha Toolbox                              https://drive.google.com/file/d/1MaTKJIATzN0DxHm4wtDJBHevWiuLTreC/view

  Small Group Training                       https://drive.google.com/file/d/1Hzpl5qqQlsQXpjelEF1_C1OVaynJkdlZ/view

  Bible in One Year                          https://bible.alpha.org/en/

  YouVersion Bible App                       https://www.bible.com/app
  -------------------------------------------------------------------------------------------------------------------

## Contributing

You can contribute by:

1.  **Submitting Ideas** via the "Share What Works" form\
2.  **Reporting Issues** on GitHub\
3.  **Opening Pull Requests** for code improvements

## Google Sheets Integration

1.  Create a Google Sheet with columns:\
    `timestamp`, `name`, `role`, `category`, `weekNumber`, `idea`
2.  Open Extensions → Apps Script\
3.  Paste this code:

``` javascript
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

4.  Deploy as web app\
5.  Replace `GOOGLE_SCRIPT_URL` in your `index.html` script

## Contact

For support: **michael.ting@htbb.org**

© 2024 Alpha Course Resources. All rights reserved.
