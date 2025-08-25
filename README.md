# Enterprise Agentic AI Production Readiness Checklist Wizard

A comprehensive checklist wizard for preparing agentic AI systems and services for production in enterprise environments. This tool helps teams systematically assess readiness across architecture, security, monitoring, compliance, and more.

## Features

- **Multi-Tab Wizard UI:** Covers all critical readiness domains: overview, executive summary, architecture, security, performance, monitoring, logging, testing, deployment, incident response, documentation, compliance, business validation, appendices, and export.
- **Project Metadata & Executive Summary:** Capture essential metadata, project description, business impact, risks, and success criteria.
- **Service Type & Criticality:** Specify AI service types (agentic service, enhancement, integration, infrastructure change, etc.) and criticality level.
- **Checklist Sections:** Guided input for system architecture, security, performance, monitoring, logging, testing, deployment, incident handling, documentation, compliance, business validation.
- **Appendices:** Document critical dependencies, performance benchmarks, security reviews, test results, and rollback procedures.
- **Progress Tracking:** Visual progress indicators per section and overall completion.
- **Export Options:** Generate and download readiness documents in DOCX and PDF formats.
- **Theme Support:** Light/dark theme toggle.
- **User Feedback:** Toast notifications and loading indicators for improved UX.

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- No backend required—runs fully client-side

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kpatta/ai-prod-checklist.git
   cd ai-prod-checklist
   ```

2. **Open the app:**
   - Double-click `index.html` to launch in your browser
   - Or serve with a simple HTTP server:
     ```bash
     python -m http.server
     # Then visit http://localhost:8000
     ```

### File Structure

- `index.html` — main app UI
- `app.js` — application logic and checklist management
- `style.css` — styles and theme definitions

## Usage

1. **Fill out Metadata:** Enter project name, owner, service type, and criticality.
2. **Complete Executive Summary:** Add a description, business impact, risks, and success criteria.
3. **Go through Tabs:** Fill in details for each checklist domain (architecture, security, etc.). Progress indicators will update.
4. **Appendices:** Add supporting documentation as needed.
5. **Export Checklist:** Use the export tab to download your completed readiness checklist as a DOCX or PDF file.
6. **Theme Toggle:** Use the theme switch (top right) for light/dark mode.

## Checklist Domains

- **Overview & Metadata:** Project details, owner, criticality
- **Executive Summary:** Description, goals, business impact, risks, success criteria
- **System Architecture:** Design, scalability, dependencies
- **Security:** Threat modeling, data protection, authentication, authorization
- **Performance:** Benchmarks, capacity planning
- **Monitoring & Logging:** Metrics, alerts, audit logs
- **Testing:** Unit, integration, end-to-end, validation
- **Deployment:** Rollout plans, rollback strategies
- **Incident Response:** Handling, escalation, recovery
- **Documentation:** Internal and external docs
- **Compliance:** Regulatory checks, audits
- **Business Validation:** KPIs, ROI, stakeholder sign-off
- **Appendices:** Critical dependencies, benchmarks, security reviews, rollback procedures

## Export Formats

- **DOCX:** Professional Word document using [docx.js]
- **PDF:** Compact, printable output

## Customization

You can modify checklist sections, add new fields, or adapt for your organization's standards by editing `app.js` and `index.html`.

## License

Currently not specified. Contact the repository owner for usage terms.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

**Author:** [@kpatta](https://github.com/kpatta)

**Repository:** https://github.com/kpatta/ai-prod-checklist
