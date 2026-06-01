---
title: "Why most ERP-AI integration projects fail in the first 90 days"
description: "The pattern is depressingly consistent. A board approves an AI initiative, a firm scopes it, and it quietly stalls about ten weeks in. Here's the diagnosis nobody wants to write down."
pubDate: 2026-04-01
published: true
author: "The SR Soft team"
category: "ERP & AI"
readingTime: "12 min read"
---

The pattern is depressingly consistent. A board approves an AI initiative. A consulting firm scopes it. The project starts, makes early demo progress, and quietly stalls about ten weeks in. Three months later, the steering committee gets a "phase one complete" deck, the consultants leave, and nothing meaningful has actually changed about how the business runs.

We've now watched this happen across maybe forty engagements — some ours, most not. The failure mode is so consistent that it's worth writing down, because the reasons are almost never what people say they are afterward.

## What people blame

When a project stalls, the post-mortem usually points to one of four things: the model was wrong, the data was bad, the use case was poorly chosen, or the integration was harder than expected. All of these are partially true. None of them are the actual reason.

The actual reason is that the project was scoped as if AI were a technology problem, when it is mostly a workflow problem with a technology component.

Said differently: the team built something that worked in isolation and then discovered, around week eight or nine, that the business process the AI was supposed to plug into was not the process anyone actually followed. The "as-is" diagram on the kickoff deck was a fiction. The real process had three exception paths, two compensating controls, and a critical step that ran in someone's head once a quarter.

> The AI didn't fail. The map of the territory failed, and the AI was built to the map.

## The 90-day arc

Here's how it usually plays out, broken into the rhythm we keep seeing:

### Weeks 1–3: The strategy phase

Workshops. Use-case prioritization matrices. A roadmap deck with eight initiatives ranked by impact and effort. The deck is good. Everyone leaves the room aligned. The first use case is selected: usually something in finance, customer service, or supply chain. Budget is approved.

### Weeks 4–6: The build phase begins

The technical team gets started. Data extraction. Model selection. Prompt engineering. Integration with the source system — typically SAP, Oracle, or Salesforce. Demos start landing. Stakeholders are happy. There is genuine momentum.

### Weeks 7–9: The reality-contact phase

This is where it goes sideways. The team begins user testing or shadowing real workflows. Three things become apparent at roughly the same time:

  1. The data the AI is consuming has more edge cases than anyone documented.
  2. The workflow the AI is supposed to fit into has unwritten exceptions that the people doing the work consider normal.
  3. The integration with the ERP is fine technically but creates downstream effects in two other systems that nobody scoped.



### Weeks 10–12: The drift phase

The project doesn't formally fail. Failures are easier to recover from. Instead, scope quietly shifts. The use case gets narrower. The "production" deployment becomes a "pilot." The pilot becomes "internal-only." A milestone slips. Then another. The consultants finish their statement of work. Everyone declares partial success. Three months later, the system is still running but nobody uses it for the thing it was supposed to do.

## What actually fixes this

The fix is uncomfortable because it costs more time upfront and produces less impressive demos. We do it anyway, and it's the single biggest reason our engagements survive.

### Spend the first two weeks shadowing, not designing.

Not interviewing. Not running workshops. Sitting with the people doing the work, watching them do it, and writing down what actually happens — including what they don't bother to mention because it's too obvious. The AP clerk who knows that vendor 4892 always submits invoices in a specific format that breaks the OCR, and silently fixes it before submitting. That fix is not in any documentation. It will absolutely break your model in production.

### Map exceptions before you map happy paths.

Most workflow diagrams capture the 80% case. The 20% case is where the value of human judgment lives, and where AI most often fails. Inverted: spend the first half of your discovery time on exceptions. The happy path is usually obvious; the edges are where the real work happens.

### Decide what "human in the loop" actually means before you build anything.

This phrase has become so common that it's lost meaning. We force ourselves to write the answers to three questions before any code gets written:

  * Who is the human?
  * What decision are they making?
  * What information do they need to make it well?



If you can't answer these three questions in two sentences each, you're not ready to build. We've turned down projects at this stage. It's not always popular. It's always correct.

### Define "good enough" with a measurable threshold.

"Improve customer service" is not a target. "Reduce average ticket resolution time by 15% on the top three issue categories, measured over a 30-day rolling window, while maintaining CSAT above 4.2" — that's a target. The first version of the goal is the one most projects actually start with, which is why most projects can't tell when they've succeeded.

## The deeper issue

All of this points at something most enterprise AI conversations are unwilling to name: the AI is rarely the hard part. The hard part is the operational rigor required to integrate any new tool into a business process that has accumulated decades of compensating behaviors.

This is also why companies with strong ERP and process discipline tend to do better with AI than companies that are operationally chaotic but technologically modern. The discipline matters more than the toolchain. We've watched a manufacturing company on twenty-year-old PeopleSoft outperform a SaaS-native competitor on the same AI use case, because the manufacturing company had documented exceptions and the SaaS-native one assumed its workflow was clean.

> AI doesn't fix operational chaos. It amplifies it. If your "as-is" map is fiction, your AI deployment will be too.

## What we recommend

If you're starting an AI initiative, three things to put in the SOW:

  * A discovery phase of at least three weeks, with shadowing as a first-class deliverable, not a "nice to have."
  * An exception-mapping artifact that the operations leader signs off on.
  * A clearly defined human-in-the-loop role for the first six months of production, even if you intend to remove it later.



And one thing to negotiate out: the requirement to demo in week six. Demos before workflow validation create false confidence. Replace "demo" with "first dry-run with one real user, on real data, for one real ticket." Slower. Less impressive. Vastly more predictive of whether the project will land.

The 90-day failure pattern is not inevitable. It just requires saying no to the things that make AI projects feel impressive and yes to the things that make them survive Monday morning. We pick survival every time.
