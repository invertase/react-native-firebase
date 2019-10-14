---
title: Query limitations
description: Cursor snapshot queries have limitations.
---

Cloud Firestore does not support the following types of queries:

 * Queries with range filters on different fields, as described in the previous section.
 * Logical `OR` queries. In this case, you should create a separate query for each OR condition and merge the query results in your app.
 * Queries with a `!=` clause. In this case, you should split the query into a greater-than query and a less-than query. For example, although the query clause `where("age", "!=", "30")` is not supported, you can get the same result set by combining two queries, one with the clause `where("age", "<", "30")` and one with the clause `where("age", ">", 30)`.

