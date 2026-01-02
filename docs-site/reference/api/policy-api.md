
# Policy API

**Status:** Published

Base URL: https://policy.opteryx.app

## Overview

Manage and inspect access policies for workspaces. Create, update, list and delete policy documents that control who can access resources.

## List Workspace Policies

**Request:** `[GET] /v1/policies/workspace/{workspace}`

Returns policy principals for the workspace `{ "principals": [ {"identity":"...","role":"...","pattern":"...","policy":"id"}, ... ] }`.

## Get Policy Details

**Request:** `[GET] /v1/policies/workspace/{workspace}/policies/{policy}`

Returns full policy document details including `principal`, `role`, `pattern`, `created_at`, `updated_at`, `updated_by`.

## Create Policy

**Request:** `[POST] /v1/policies/workspace/{workspace}/policies`

Request body: `{ "principal": {"identity":"justin"}, "role": "owner", "pattern": "analytics.*" }`.

## Update Policy

**Request:** `[PUT] /v1/policies/workspace/{workspace}/policies/{policy}`

Request body: `{ "role": "owner", "pattern": "analytics.*" }`.

## Delete Policy

**Request:** `[DELETE] /v1/policies/workspace/{workspace}/policies/{policy}`

Removes the specified policy.
