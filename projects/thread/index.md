---
title: "Thread — Distributed Tracing & AI-Powered Recovery"
date: 2026-07-16
description: "A distributed transaction tracing SDK and AI-powered recovery platform — built for the Splunk Agentic Ops Hackathon 2026 to cut incident investigation from an hour to under 30 seconds."
tags: ["python", "splunk", "ai-agents", "observability"]
draft: false
tier: epic
href: "https://github.com/bhavanichandra/thread"
---

## Overview

Built for the Splunk Agentic Ops Hackathon 2026 (Observability track): THREAD tackles the standard distributed-systems failure mode — a payment times out, an inventory sync fails, an API gateway drops requests — and the 30–90 minutes of manual log-hunting across services that normally follows.

Services publish a small, consistent 5-field contract to RabbitMQ and log to Splunk via HEC. When something fails, an AI agent fires six queries through the Splunk MCP Server (transaction chain, failure details, service health, system errors, error-rate time series, and an `anomalydetect` anomaly score), scores the incident, and posts a Slack alert with one-click recovery — collapsing investigate-decide-recover into under 30 seconds. A replay engine re-executes the original failed request straight from Slack once ops approves it.

Built with 3 FastAPI demo microservices (order/payment/inventory), a RabbitMQ-based consumer pipeline, and a Slack bot (Socket Mode, Block Kit) driving `/thread-fail`, `/thread-recover`, `/thread-search`, `/thread-status`, and `/thread-analyse` slash commands.
