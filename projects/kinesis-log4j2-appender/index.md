---
title: "Kinesis Log4j2 Appender"
date: 2020-11-23
description: "A custom Log4j2 appender that streams application logs directly to AWS Kinesis, for both sync and async delivery."
tags: ["java", "aws", "logging"]
draft: false
tier: common
href: "https://github.com/bhavanichandra/Kinesis-Log4j2-Appender"
---

## Overview

Log4j2 ships appenders for files, consoles, and sockets, but nothing for streaming straight into AWS Kinesis. This project fills that gap: a custom `KinesisAppender` (and an async `KinesisAsyncAppender` variant) that plugs into any Java or Mule application's `log4j2.xml` and forwards each log line to a Kinesis stream, using AWS access/secret keys and a stream name supplied as appender properties.

Packaged as a Maven dependency (`com.themuler:kinesis-log4j2-appender`), so adding centralized log streaming to an existing app is a `pom.xml` + XML config change — no application code changes required.
