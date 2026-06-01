---
title: Shreya
description: Part 1 was written for electronic records and signatures, long before generative models. Applying it to an AI system that produces non-deterministic output forces questions the regulation never anticipated — and that auditors are starting to ask.
pubDate: 2026-01-28
published: true
author: The SR Soft team
category: Pharma & Compliance
readingTime: 10 min read
---

21 CFR Part 11 has governed electronic records and electronic signatures in FDA-regulated environments since 1997. It assumes a world of deterministic systems: the same input produces the same output, audit trails are complete and tamper-evident, and a validated system behaves predictably across its lifecycle. Generative AI breaks the first assumption and complicates the rest.

This is the question we field most often from pharma and life-sciences clients right now: can you even _use_ an LLM in a GxP-relevant workflow, and if so, how do you validate something that doesn't give the same answer twice?

## Validation when output is non-deterministic

The short answer is yes, but the validation target shifts. You stop trying to prove the model produces one correct output and start proving that the _system around it_ is controlled: inputs are governed, outputs are reviewed by a qualified human before they affect a record, the audit trail captures the prompt, the response, and the reviewer's decision, and the whole thing operates inside a documented intended-use boundary.

In practice, the human-in-the-loop checkpoint is doing the regulatory heavy lifting. The AI proposes; a qualified person disposes; the record reflects the person's signed decision.

## Intended use is the whole game

Part 11 compliance for AI lives or dies on a tightly written intended-use statement and the controls that enforce its boundary. Get that right and most of the rest follows. We'll walk through a worked example — and the documentation set an auditor will expect — in a dedicated post.
