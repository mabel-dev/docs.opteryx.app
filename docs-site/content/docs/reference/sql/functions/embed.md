---
title: EMBED — Opteryx Function
description: Embeds text using the configured engine embedding provider.
---

# EMBED

Embeds text using the configured engine embedding provider.

**Category:** Vector / Embedding Functions

## Syntax

```
EMBED(text)
```

## Arguments

- **text** `varchar`
    Input text to convert into an embedding vector.

## Returns

**array<double>** — Returns an embedding vector represented as an array of doubles.

## Usage Notes

This function depends on the configured embedding provider and returns a numeric vector as `array<double>`.
