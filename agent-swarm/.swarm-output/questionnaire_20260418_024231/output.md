Now I have full context. Here are the clarifying questions, following the Questionnaire Agent protocol from this swarm:

---

## Clarifying Questions

### Must-Answer (Blockers)

1. **What defines "top 10"?** Are prospects ranked by deal size potential, strategic fit, likelihood to convert, or a weighted combination? Without a ranking criterion, the research has no selection logic.

2. **Who is the seller / what product are you selling?** "Fintech enterprise prospect" means something very different depending on whether you're selling an AI agent platform, a compliance tool, a payments API, or an analytics layer. The prospect profile, the pain points, and the right contacts all change.

3. **What does "enterprise" mean in your context?** Is there a revenue floor (e.g., $100M+ ARR), employee count threshold (500+), funding stage, or deal size floor (e.g., $50K+ ACV) that qualifies a company?

4. **Which tools/APIs are available?** The swarm's `lead-intelligence` skill requires **Exa MCP** and optionally **X API**, **LinkedIn**, **Apollo**. Do you have credentials for any of these? Without them, research is limited to web search only.

---

### Should-Answer (Important)

5. **Which fintech sub-verticals are in scope?** Fintech is enormous — payments, lending, wealth management, insurtech, banking infrastructure, crypto/Web3, RegTech, B2B spend management, embedded finance. Should research cover all of them, or focus on specific segments?

6. **Geography?** US-only, North America, global? Enterprise deals in EU vs. US involve different compliance contexts and buying cycles.

7. **What's the desired output format?** Options in this swarm include:
   - A markdown report (default `output/` directory)
   - A Google Drive doc (via `mcp__claude_ai_Google_Drive__create_file`)
   - A structured JSON/CSV for CRM import
   - Outreach-ready profiles with personalized email drafts

8. **What data fields are needed per prospect?** At minimum: company name, HQ, size, funding, ICP fit score. Do you also need: key decision-maker contacts, tech stack, recent news triggers, estimated budget, pain point hypotheses?

9. **Are there companies already in your pipeline that should be excluded?** No point re-researching warm accounts already being worked.

---

### Nice-to-Answer (Context)

10. **Is this for cold outreach, investor prep, or internal strategic planning?** A sales rep needs contact names and warm paths; an exec preparing a board deck needs market sizing and competitive positioning; a BD team needs partnership angles.

11. **What's the timeline?** Is this needed in the next hour (quick web research pass), by end of day (deeper signal scoring), or over a few days (full `lead-intelligence` pipeline with mutual ranking and warm path discovery)?

12. **Are there any known target companies you already suspect belong on the list?** Anchoring the research around 3–4 known candidates helps calibrate the selection criteria for the remaining 6–7.

13. **Should the swarm also draft outreach sequences?** The `sales-outbound-strategist` and `sales-account-strategist` agents can generate personalized cold email / LinkedIn sequences as a follow-on step — worth knowing if that's in scope now or later.

---

## Assumptions (If Not Answered)

- I'll assume **US-based companies** unless told otherwise
- I'll assume **enterprise = 500+ employees or $50M+ ARR**
- I'll assume the output is a **markdown research report** saved to `output/` unless a different format is specified
- I'll assume **ranking is by ICP fit + deal size potential** (50/50) unless a scoring rubric is provided
- I'll assume **web search only** (no Exa/Apollo/X API) unless credentials are confirmed available
- I'll assume **no existing pipeline to exclude** unless a list is provided
- I'll assume **all fintech sub-verticals are in scope** unless narrowed

---

## Suggested Scope

Based on what I understand, a reasonable breakdown would be:

**MVP includes:**
- 10 company profiles: name, HQ, size, funding stage, fintech segment, ICP fit rationale
- 1–2 key decision-maker titles/names per company (from public sources)
- A brief "why this prospect" paragraph per entry
- A ranked shortlist with scoring rationale

**Phase 2 (if tools are available):**
- Warm path discovery via mutual connections (X API / LinkedIn graph)
- Personalized outreach drafts per prospect
- CRM-ready export

**Out of scope (unless confirmed):**
- Proprietary data enrichment (Apollo, ZoomInfo)
- Real-time monitoring / lead scoring loops
- Financial modeling or deal sizing

---

**→ What answers can you provide?** Even 2–3 of the Must-Answer items will unlock the planning phase.
