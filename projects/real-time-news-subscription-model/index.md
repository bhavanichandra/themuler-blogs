---
title: "Real-Time News & Stock Subscription via Slack"
date: 2020-11-29
description: "A MuleSoft + Kafka integration letting Slack users subscribe to real-time news and stock updates via slash commands — built for MuleSoft Hackathon 2020."
tags: ["mulesoft", "kafka", "architecture", "slack"]
draft: false
tier: rare
href: "https://github.com/bhavanichandra/Real-Time-News-Subscription-Model"
---

## Overview

Built for MuleSoft Hackathon 2020: a subscription model that lets Slack users subscribe to news snippets and stock quotes via `/subscribe`, `/unsubscribe`, and `/list-subscriptions` slash commands — all from inside Slack.

The first design polled The Guardian and Alpha Vantage APIs on a timer and wrote results to a database, but that meant heavy, wasteful I/O just to keep data "fresh enough." Swapping in Apache Kafka (Confluent Cloud) as the backbone made subscriptions genuinely real-time instead of polling-based: a subscriber API (the Slack-facing Experience API) publishes subscribe/unsubscribe events onto Kafka topics, and a separate publisher application consumes them, fetches the relevant feed, and pushes updates back to Slack — decoupling the two directions of traffic and giving the system low-latency, high-throughput delivery.
