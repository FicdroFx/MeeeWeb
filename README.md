# Mani — Developer Portfolio

Personal portfolio for **Mani** — Product Developer | ERP Developer | Web Developer | QA & Software Testing.

Plain HTML, CSS, and JavaScript. No build step, no dependencies, ready for GitHub Pages.

## Structure

```
index.html                     Home: hero, about, skills, projects, process, experience, resume, contact
projects/fitsiomax-os/         Case study — Fitsiomax OS (ERP product)
projects/qa-testing/           Case study — QA & testing, with a sample bug report (fictional data)
projects/websites/             Case study — website & WordPress projects
404.html                       Custom "page not found"
assets/css/styles.css          Design system (colour tokens, components, sections)
assets/js/config.js            YOUR DETAILS — email, LinkedIn, resume, contact form
assets/js/main.js              Theme toggle, menu, tabs, filters, form, animations
assets/img/                    Favicon, social preview image
sitemap.xml, robots.txt        SEO
tools/serve.ps1                Local preview server (Windows, no install needed)
```

## Updating your details

1. **Email, LinkedIn, resume, contact form** — edit `assets/js/config.js`.
   Anything left as `""` shows as "coming soon" on the site.
   - Resume: put your PDF in `assets/resume/` and set `resumeUrl: "assets/resume/your-file.pdf"`.
   - Contact form: create a free form at [formspree.io](https://formspree.io), then set `formEndpoint`
     to the URL it gives you (e.g. `https://formspree.io/f/abcdwxyz`). This URL is public by design.
2. **Placeholders in the pages** — search the project for `class="ph"`. Each one marks text
   that still needs your confirmed details (job title, company, dates, website contributions, …).
3. **Website projects** — once an owner approves sharing, fill in the entry in
   `projects/websites/index.html` and add the live link and screenshots.

## Preview locally

```powershell
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

Open <http://localhost:8080/>. (The VS Code "Live Server" extension also works.)

## Deploy to GitHub Pages

1. Push this folder to `https://github.com/FicdroFx/MeeeWeb`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`, then **Save**.
3. After a minute the site is live at <https://ficdrofx.github.io/MeeeWeb/>.

If you later use a custom domain or rename the repository, update the URLs in
`sitemap.xml`, `robots.txt`, the `canonical` / `og:` tags in each page, and `repo` in `404.html`.

## Content rules

- No invented employers, dates, qualifications, metrics, or testimonials.
- Fitsiomax OS is private: no live URL, real screenshots, or internal details are published.
  The screens on its case study are recreated mock-ups with dummy data.
- The sample QA report uses fictional data only.
