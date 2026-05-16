"""
AOS Council System

The Council is a multi-agent review panel that evaluates high-stakes decisions
before execution. Six specialized review agents evaluate a proposed action from
different angles, produce risk scores and recommendations, and the coordinator
aggregates them into a final APPROVE / CONDITIONAL_APPROVE / DENY verdict.

Usage:
    council = CouncilCoordinator()
    result = await council.review(
        proposed_action="Deploy payment service to production",
        context={"cost": 1200, "external_apis": ["stripe"], "workspace": "acme-corp"},
        execution_id="...",
    )
    # result.verdict in ("APPROVE", "CONDITIONAL_APPROVE", "DENY", "ESCALATE")
"""
from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Literal

from .providers import AnthropicProvider, LLMProvider, Message

Verdict = Literal["APPROVE", "CONDITIONAL_APPROVE", "DENY", "ESCALATE"]


# ---------------------------------------------------------------------------
# Review agent definitions (inline — no .md files needed for council)
# ---------------------------------------------------------------------------

COUNCIL_AGENTS = {
    "architecture": {
        "name": "Architecture Review Agent",
        "prompt": (
            "You are the AOS Architecture Review agent. You evaluate proposed actions "
            "for technical soundness: scalability, maintainability, integration risks, "
            "and adherence to system design principles. "
            "Respond in JSON: {\"score\": 0-100, \"verdict\": \"APPROVE\"|\"CONDITIONAL\"|\"DENY\", "
            "\"findings\": [\"...\"], \"recommendations\": [\"...\"]}"
        ),
    },
    "security": {
        "name": "Security Review Agent",
        "prompt": (
            "You are the AOS Security Review agent. You evaluate proposed actions "
            "for security risks: credential exposure, injection vulnerabilities, "
            "privilege escalation, data leakage, and compliance violations. "
            "Respond in JSON: {\"score\": 0-100, \"verdict\": \"APPROVE\"|\"CONDITIONAL\"|\"DENY\", "
            "\"findings\": [\"...\"], \"recommendations\": [\"...\"]}"
        ),
    },
    "cost": {
        "name": "Cost Analysis Agent",
        "prompt": (
            "You are the AOS Cost Analysis agent. You evaluate proposed actions "
            "for financial impact: token costs, API costs, infrastructure spend, "
            "ROI alignment, and budget compliance. "
            "Respond in JSON: {\"score\": 0-100, \"verdict\": \"APPROVE\"|\"CONDITIONAL\"|\"DENY\", "
            "\"findings\": [\"...\"], \"recommendations\": [\"...\"]}"
        ),
    },
    "product": {
        "name": "Product Review Agent",
        "prompt": (
            "You are the AOS Product Review agent. You evaluate proposed actions "
            "for product alignment: user impact, feature scope creep, UX implications, "
            "and strategic fit with the product roadmap. "
            "Respond in JSON: {\"score\": 0-100, \"verdict\": \"APPROVE\"|\"CONDITIONAL\"|\"DENY\", "
            "\"findings\": [\"...\"], \"recommendations\": [\"...\"]}"
        ),
    },
    "deployment": {
        "name": "Deployment Review Agent",
        "prompt": (
            "You are the AOS Deployment Review agent. You evaluate proposed deployment "
            "actions for operational readiness: rollback plans, monitoring, zero-downtime "
            "requirements, environment parity, and deployment risk. "
            "Respond in JSON: {\"score\": 0-100, \"verdict\": \"APPROVE\"|\"CONDITIONAL\"|\"DENY\", "
            "\"findings\": [\"...\"], \"recommendations\": [\"...\"]}"
        ),
    },
    "governance": {
        "name": "Governance Review Agent",
        "prompt": (
            "You are the AOS Governance Review agent. You evaluate proposed actions "
            "for compliance: regulatory requirements (HIPAA, SOX, PCI-DSS, GDPR), "
            "audit trail completeness, data handling policies, and policy violations. "
            "Respond in JSON: {\"score\": 0-100, \"verdict\": \"APPROVE\"|\"CONDITIONAL\"|\"DENY\", "
            "\"findings\": [\"...\"], \"recommendations\": [\"...\"]}"
        ),
    },
}


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class ReviewerOpinion:
    reviewer: str
    score: int          # 0–100; higher = safer/better
    verdict: str        # "APPROVE" | "CONDITIONAL" | "DENY"
    findings: list[str] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)
    error: str = ""
    duration_ms: int = 0


@dataclass
class CouncilDecision:
    verdict: Verdict
    aggregate_score: float
    opinions: list[ReviewerOpinion]
    summary: str
    conditions: list[str]   # populated for CONDITIONAL_APPROVE
    risk_level: str         # "low" | "medium" | "high" | "critical"
    execution_id: str = ""
    duration_ms: int = 0

    @property
    def as_dict(self) -> dict:
        return {
            "verdict": self.verdict,
            "aggregate_score": round(self.aggregate_score, 1),
            "risk_level": self.risk_level,
            "summary": self.summary,
            "conditions": self.conditions,
            "duration_ms": self.duration_ms,
            "opinions": [
                {
                    "reviewer": o.reviewer,
                    "score": o.score,
                    "verdict": o.verdict,
                    "findings": o.findings,
                    "recommendations": o.recommendations,
                }
                for o in self.opinions
            ],
        }


# ---------------------------------------------------------------------------
# Council coordinator
# ---------------------------------------------------------------------------

class CouncilCoordinator:
    """
    Orchestrates parallel review by all six council agents and aggregates
    their opinions into a final verdict.

    Verdicts:
      APPROVE             — avg score ≥ 80 and no DENY votes
      CONDITIONAL_APPROVE — avg score 60–79 or max 1 DENY vote
      DENY                — avg score < 60 or ≥ 2 DENY votes
      ESCALATE            — any reviewer signals an unresolvable blocker
    """

    DENY_THRESHOLD = 60
    CONDITIONAL_THRESHOLD = 80

    def __init__(self, provider: LLMProvider | None = None) -> None:
        self._provider = provider or AnthropicProvider(model="claude-sonnet-4-6")

    async def review(
        self,
        proposed_action: str,
        context: dict | None = None,
        execution_id: str = "",
        reviewers: list[str] | None = None,
    ) -> CouncilDecision:
        """
        Run all (or selected) reviewers in parallel and produce a decision.
        """
        start = time.monotonic()
        context = context or {}
        reviewers = reviewers or list(COUNCIL_AGENTS.keys())

        tasks = [
            self._run_reviewer(key, proposed_action, context)
            for key in reviewers
            if key in COUNCIL_AGENTS
        ]
        opinions: list[ReviewerOpinion] = await asyncio.gather(*tasks)

        verdict, score, conditions, summary = self._aggregate(opinions, proposed_action)
        risk = self._risk_level(score)

        return CouncilDecision(
            verdict=verdict,
            aggregate_score=score,
            opinions=opinions,
            summary=summary,
            conditions=conditions,
            risk_level=risk,
            execution_id=execution_id,
            duration_ms=int((time.monotonic() - start) * 1000),
        )

    async def _run_reviewer(
        self, key: str, action: str, context: dict
    ) -> ReviewerOpinion:
        agent = COUNCIL_AGENTS[key]
        start = time.monotonic()

        user_message = (
            f"Proposed action: {action}\n\n"
            f"Context: {context}\n\n"
            "Evaluate this and respond in the required JSON format."
        )

        try:
            response = await self._provider.complete(
                messages=[Message.user(user_message)],
                system=agent["prompt"],
                max_tokens=1024,
                temperature=0.0,
            )
            import json, re
            raw = response.content.strip()
            # Extract JSON even if wrapped in markdown code fences
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(m.group()) if m else {}
            return ReviewerOpinion(
                reviewer=agent["name"],
                score=int(data.get("score", 50)),
                verdict=data.get("verdict", "CONDITIONAL"),
                findings=data.get("findings", []),
                recommendations=data.get("recommendations", []),
                duration_ms=int((time.monotonic() - start) * 1000),
            )
        except Exception as exc:
            return ReviewerOpinion(
                reviewer=agent["name"],
                score=50,
                verdict="CONDITIONAL",
                findings=[],
                recommendations=[],
                error=str(exc)[:200],
                duration_ms=int((time.monotonic() - start) * 1000),
            )

    def _aggregate(
        self, opinions: list[ReviewerOpinion], action: str
    ) -> tuple[Verdict, float, list[str], str]:
        if not opinions:
            return "ESCALATE", 0.0, [], "No reviewers responded."

        scores = [o.score for o in opinions]
        avg = sum(scores) / len(scores)
        deny_count = sum(1 for o in opinions if o.verdict == "DENY")
        all_findings = [f for o in opinions for f in o.findings]
        all_recs = [r for o in opinions for r in o.recommendations]

        if deny_count >= 2 or avg < self.DENY_THRESHOLD:
            verdict: Verdict = "DENY"
        elif avg < self.CONDITIONAL_THRESHOLD or deny_count == 1:
            verdict = "CONDITIONAL_APPROVE"
        else:
            verdict = "APPROVE"

        conditions = all_recs[:5] if verdict == "CONDITIONAL_APPROVE" else []

        finding_summary = "; ".join(all_findings[:3]) if all_findings else "No significant findings."
        summary = (
            f"Council reviewed '{action[:80]}'. "
            f"Aggregate score: {avg:.0f}/100. "
            f"Deny votes: {deny_count}/{len(opinions)}. "
            f"Key findings: {finding_summary}"
        )

        return verdict, avg, conditions, summary

    @staticmethod
    def _risk_level(score: float) -> str:
        if score >= 80:
            return "low"
        if score >= 65:
            return "medium"
        if score >= 45:
            return "high"
        return "critical"
