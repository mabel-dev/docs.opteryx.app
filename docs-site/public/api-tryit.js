/*
 * api-tryit.js — hydrates "Try it live" cards on the API reference pages.
 *
 * The markup is emitted by scripts/update_docs_from_definitions.py straight from
 * the OpenAPI definitions, so this file never hardcodes an endpoint. It attaches
 * to any `.api-tryit` element and reads everything it needs from data-attributes.
 *
 * Loaded from app/layout.tsx — markdown is injected with dangerouslySetInnerHTML,
 * and scripts inside that HTML never execute, so this cannot live in the page body.
 *
 * No framework, no build step, no dependencies.
 */
(function () {
  "use strict";

  // Token is kept in a module-local only: never localStorage, never a cookie,
  // never anywhere it could outlive the tab or be picked up by another script.
  var sessionToken = "";

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function highlightJSON(text) {
    return esc(text).replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (m) {
        var cls = "j-num";
        if (/^"/.test(m)) cls = /:$/.test(m) ? "j-key" : "j-str";
        else if (/true|false/.test(m)) cls = "j-bool";
        else if (/null/.test(m)) cls = "j-null";
        return '<span class="' + cls + '">' + m + "</span>";
      },
    );
  }

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  function statusText(code) {
    var map = {
      200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
      400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
      404: "Not Found", 409: "Conflict", 422: "Unprocessable Entity",
      429: "Too Many Requests", 500: "Server Error", 503: "Unavailable",
    };
    return map[code] || "";
  }

  function buildURL(widget) {
    var base = widget.dataset.base;
    var path = widget.dataset.path;

    // Path parameters are substituted into the template, e.g. {identifier}.
    widget.querySelectorAll(".t-path").forEach(function (input) {
      var value = input.value.trim();
      path = path.replace(
        "{" + input.dataset.name + "}",
        value ? encodeURIComponent(value) : "{" + input.dataset.name + "}",
      );
    });

    var query = [];
    widget.querySelectorAll(".t-query").forEach(function (input) {
      var value = input.value.trim();
      if (value) {
        query.push(
          encodeURIComponent(input.dataset.name) + "=" + encodeURIComponent(value),
        );
      }
    });

    return base + path + (query.length ? "?" + query.join("&") : "");
  }

  function renderURL(widget) {
    var urlEl = widget.querySelector(".t-url");
    var base = widget.dataset.base;
    var url = buildURL(widget);
    urlEl.innerHTML =
      '<span class="t-host">' + esc(base) + "</span>" + esc(url.slice(base.length));
  }

  // Snippets must never carry a real credential. A field marked data-secret
  // renders as a placeholder the reader substitutes themselves.
  function formEntries(widget, redactSecrets) {
    var out = [];
    widget.querySelectorAll(".t-form").forEach(function (input) {
      var value = input.value.trim();
      if (!value) return;
      if (redactSecrets && input.dataset.secret) {
        value = "YOUR_" + input.dataset.name.toUpperCase();
      }
      out.push([input.dataset.name, value]);
    });
    return out;
  }

  function curlFor(widget) {
    var lines = ["curl -X " + widget.dataset.method + " '" + buildURL(widget) + "'"];
    if (widget.querySelector(".t-token")) {
      lines.push("  -H 'Authorization: Bearer YOUR_TOKEN'");
    }

    var bodyEl = widget.querySelector(".t-body");
    if (bodyEl) {
      lines.push("  -H 'Content-Type: application/json'");
      lines.push("  -d '" + bodyEl.value.replace(/\s+/g, " ").trim() + "'");
    } else if (widget.dataset.bodyType === "form") {
      formEntries(widget, true).forEach(function (pair) {
        lines.push("  --data-urlencode '" + pair[0] + "=" + pair[1] + "'");
      });
    }
    return lines.join(" \\\n");
  }

  function pythonFor(widget) {
    var method = widget.dataset.method;
    var base = widget.dataset.base;
    var path = widget.dataset.path;
    var bodyEl = widget.querySelector(".t-body");

    var lines = ["import requests", ""];

    // Path params become f-string-free explicit substitution so the snippet
    // reads the same whether or not the reader filled the box in.
    var pathParams = [];
    widget.querySelectorAll(".t-path").forEach(function (input) {
      pathParams.push([input.dataset.name, input.value.trim()]);
    });

    if (pathParams.length) {
      pathParams.forEach(function (pair) {
        lines.push(pair[0] + ' = "' + (pair[1] || "...") + '"');
        path = path.replace("{" + pair[0] + "}", '" + ' + pair[0] + ' + "');
      });
      lines.push("");
      lines.push('url = "' + base + path + '"');
    } else {
      lines.push('url = "' + base + path + '"');
    }

    var hasToken = !!widget.querySelector(".t-token");
    if (hasToken) {
      lines.push('headers = {"Authorization": "Bearer " + TOKEN}');
    }

    var query = [];
    widget.querySelectorAll(".t-query").forEach(function (input) {
      var value = input.value.trim();
      if (value) query.push('    "' + input.dataset.name + '": "' + value + '",');
    });
    if (query.length) {
      lines.push("params = {");
      query.forEach(function (line) {
        lines.push(line);
      });
      lines.push("}");
    }

    if (bodyEl) {
      var pretty;
      try {
        // Re-serialize so the snippet carries a real Python literal, not raw
        // JSON text that may not be valid Python (true/false/null).
        pretty = JSON.stringify(JSON.parse(bodyEl.value), null, 4)
          .replace(/\btrue\b/g, "True")
          .replace(/\bfalse\b/g, "False")
          .replace(/\bnull\b/g, "None");
      } catch (e) {
        pretty = "{}  # request body was not valid JSON";
      }
      lines.push("payload = " + pretty);
    } else if (widget.dataset.bodyType === "form") {
      var entries = formEntries(widget, true);
      if (entries.length) {
        lines.push("data = {");
        entries.forEach(function (pair) {
          lines.push('    "' + pair[0] + '": "' + pair[1] + '",');
        });
        lines.push("}");
      }
    }

    var args = ["url"];
    if (hasToken) args.push("headers=headers");
    if (query.length) args.push("params=params");
    if (bodyEl) args.push("json=payload");
    else if (widget.dataset.bodyType === "form" && formEntries(widget, true).length) {
      args.push("data=data");
    }

    lines.push("");
    lines.push(
      "response = requests." + method.toLowerCase() + "(" + args.join(", ") + ")",
    );
    lines.push("response.raise_for_status()");
    lines.push("print(response.json())");

    return lines.join("\n");
  }

  function flash(button, message) {
    var original = button.textContent;
    button.textContent = message;
    setTimeout(function () {
      button.textContent = original;
    }, 1200);
  }

  function showResponse(widget, opts) {
    var resp = widget.querySelector(".t-resp");
    var pill = resp.querySelector(".t-pill");
    var meta = resp.querySelector(".t-meta");
    var pre = resp.querySelector(".t-pre");
    var note = resp.querySelector(".t-note");

    pill.className = "t-pill " + (opts.ok ? "t-pill--ok" : "t-pill--err");
    pill.textContent = opts.status
      ? opts.status + " " + statusText(opts.status)
      : "Failed";
    meta.textContent = opts.meta || "";
    pre.innerHTML = opts.bodyHTML || "";
    note.innerHTML = opts.note || "";
    resp.classList.add("is-open");
  }

  function send(widget) {
    var button = widget.querySelector(".t-send");
    var tokenEl = widget.querySelector(".t-token");
    var bodyEl = widget.querySelector(".t-body");

    // Absent on endpoints that do not take one — the token endpoint itself.
    if (tokenEl && !tokenEl.value.trim()) {
      var authDocs = widget.dataset.authDocs;
      showResponse(widget, {
        ok: false,
        status: 401,
        meta: "not sent",
        note:
          "<b>A bearer token is required.</b> See the " +
          (authDocs
            ? '<a href="' + authDocs + '">Authentication API</a>'
            : "Authentication API") +
          " for how to get one.",
      });
      tokenEl.focus();
      return;
    }

    var init = { method: widget.dataset.method, headers: {} };
    if (tokenEl) {
      init.headers.Authorization = "Bearer " + tokenEl.value.trim();
    }

    if (widget.dataset.bodyType === "form") {
      var params = new URLSearchParams();
      formEntries(widget, false).forEach(function (pair) {
        params.append(pair[0], pair[1]);
      });
      init.headers["Content-Type"] = "application/x-www-form-urlencoded";
      init.body = params.toString();
    }

    if (bodyEl) {
      try {
        JSON.parse(bodyEl.value);
      } catch (e) {
        showResponse(widget, {
          ok: false,
          meta: "not sent",
          note: "<b>Request body is not valid JSON.</b> " + esc(e.message),
        });
        return;
      }
      init.headers["Content-Type"] = "application/json";
      init.body = bodyEl.value;
    }

    button.disabled = true;
    button.innerHTML = '<span class="t-spin"></span>Sending';
    var started = performance.now();

    fetch(buildURL(widget), init)
      .then(function (response) {
        return response.text().then(function (text) {
          var elapsed = Math.round(performance.now() - started);
          var bodyHTML;
          var contentType = response.headers.get("content-type") || "";

          if (contentType.indexOf("application/json") > -1 && text) {
            try {
              bodyHTML = highlightJSON(JSON.stringify(JSON.parse(text), null, 2));
            } catch (e) {
              bodyHTML = esc(text);
            }
          } else {
            bodyHTML = esc(text) || "<em>empty response body</em>";
          }

          // A token that the service rejects deserves the same signpost as no
          // token at all — otherwise the reader just sees a bare 401 body.
          var note = "";
          if (response.status === 401 || response.status === 403) {
            var docs = widget.dataset.authDocs;
            note =
              "The service rejected this token. See the " +
              (docs
                ? '<a href="' + docs + '">Authentication API</a>'
                : "Authentication API") +
              " for issuing a new one.";
          }

          showResponse(widget, {
            ok: response.ok,
            status: response.status,
            meta: elapsed + " ms · " + formatBytes(new Blob([text]).size),
            bodyHTML: bodyHTML,
            note: note,
          });
        });
      })
      .catch(function (err) {
        // A cross-origin rejection surfaces here as an opaque TypeError; the
        // browser deliberately withholds the detail. Say so rather than guess.
        showResponse(widget, {
          ok: false,
          meta: Math.round(performance.now() - started) + " ms",
          note:
            "<b>Request failed before a response was read.</b> " +
            esc(err.message) +
            " — this is usually a network error or a CORS rejection; the browser " +
            "console will have the specifics.",
        });
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = "Send request";
      });
  }

  function hydrate(widget) {
    if (widget.dataset.hydrated) return;
    widget.dataset.hydrated = "1";

    var tokenEl = widget.querySelector(".t-token");

    // One token, shared across every card on the page, for the life of the tab.
    if (tokenEl) {
      if (sessionToken) tokenEl.value = sessionToken;
      tokenEl.addEventListener("input", function () {
        sessionToken = tokenEl.value;
        document.querySelectorAll(".api-tryit .t-token").forEach(function (other) {
          if (other !== tokenEl) other.value = sessionToken;
        });
      });
    }

    widget.querySelectorAll(".t-path, .t-query").forEach(function (input) {
      input.addEventListener("input", function () {
        renderURL(widget);
      });
    });

    widget.querySelector(".t-send").addEventListener("click", function () {
      send(widget);
    });

    [
      [widget.querySelector(".t-curl"), curlFor],
      [widget.querySelector(".t-python"), pythonFor],
    ].forEach(function (pair) {
      var button = pair[0];
      var render = pair[1];
      if (!button) return;
      button.addEventListener("click", function () {
        navigator.clipboard.writeText(render(widget)).then(
          function () {
            flash(button, "Copied");
          },
          function () {
            flash(button, "Copy failed");
          },
        );
      });
    });

    renderURL(widget);
  }

  function init() {
    document.querySelectorAll(".api-tryit").forEach(hydrate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
