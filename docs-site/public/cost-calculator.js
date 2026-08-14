/*
 * cost-calculator.js — the estimator on /docs/core-concepts/cost-model.
 *
 * The page is the source of truth. Every price and allowance arrives as a
 * data-attribute on the placeholder <div>, so the tables above the calculator
 * and the calculator itself cannot drift apart: change a number in the
 * markdown and the estimate changes with it. Nothing is hardcoded here except
 * the arithmetic and the wording.
 *
 * Loaded from app/layout.tsx — markdown is injected with dangerouslySetInnerHTML,
 * and scripts inside that HTML never execute, so this cannot live in the page body.
 *
 * No framework, no build step, no dependencies.
 */
(function () {
  "use strict";

  var HOURS_PER_DAY = 24;

  // 1 GB = 1,000,000,000 bytes, the same decimal units the page bills in.
  var UNITS = { MB: 0.001, GB: 1, TB: 1000 };

  var seq = 0;

  function attr(root, name, fallback) {
    var value = parseFloat(root.dataset[name]);
    return isFinite(value) ? value : fallback;
  }

  function readConfig(root) {
    return {
      days: attr(root, "days", 30),
      price: {
        storage: attr(root, "priceStorage", 0.00003), // per GB per hour
        query: attr(root, "priceQuery", 0.1), // per 1,000 queries
        data: attr(root, "priceData", 0.001), // per GB
      },
      plans: {
        free: {
          label: "without billing set up",
          storage: attr(root, "freeStorage", 5),
          queries: attr(root, "freeQueries", 100),
          data: attr(root, "freeData", 0.167),
        },
        paid: {
          label: "with billing set up",
          storage: attr(root, "paidStorage", 25),
          queries: attr(root, "paidQueries", 500),
          data: attr(root, "paidData", 0.835),
        },
      },
    };
  }

  /* --- formatting ---------------------------------------------------- */

  // Billed usage rounds up to the next whole unit, so a fraction of a gigabyte
  // over the allowance is a whole gigabyte on the invoice. The epsilon keeps
  // floating point from turning an exact 15 into 16.
  function ceilUnit(value) {
    return Math.max(0, Math.ceil(value - 1e-9));
  }

  function trim(value, places) {
    return Number(value.toFixed(places)).toLocaleString("en-GB");
  }

  function fmtCount(value) {
    return Math.round(value).toLocaleString("en-GB");
  }

  // Sizes are shown in whichever unit reads smallest, so a 167 MB allowance
  // never appears as 0.167 GB.
  function fmtSize(gb) {
    if (gb <= 0) return "0 GB";
    if (gb < 1) return trim(gb * 1000, 1) + " MB";
    if (gb >= 1000) return trim(gb / 1000, 2) + " TB";
    return trim(gb, 2) + " GB";
  }

  // Line items are shown exactly. Only the headline total is rounded up to the
  // penny, which is where the invoice rounds — rounding each line first would
  // turn three sub-penny charges into 3p.
  function fmtMoney(value) {
    if (value <= 0) return "£0.00";
    if (value < 0.01) return "£" + value.toFixed(4);
    return "£" + value.toFixed(2);
  }

  // Charges round up to the penny. The epsilon is the same guard as ceilUnit:
  // without it an exact £8.10 arrives from the multiplication as 8.100000000000001
  // and bills as £8.11.
  function fmtTotal(value) {
    return "£" + (Math.ceil(value * 100 - 1e-9) / 100).toFixed(2);
  }

  function list(items) {
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  function sentence(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /* --- the estimate --------------------------------------------------- */

  function estimate(cfg, plan, usage) {
    var allowance = cfg.plans[plan];

    var storage = ceilUnit(usage.storage - allowance.storage);
    var queries = ceilUnit(usage.queries - allowance.queries);
    var data = ceilUnit(usage.data - allowance.data);

    var lines = [
      {
        label: "Storage",
        usage: fmtSize(usage.storage),
        allowance: fmtSize(allowance.storage),
        chargeable: storage > 0 ? fmtSize(storage) : "none",
        over: storage > 0,
        cost: storage * cfg.price.storage * HOURS_PER_DAY * cfg.days,
      },
      {
        label: "Queries",
        usage: fmtCount(usage.queries) + " a day",
        allowance: fmtCount(allowance.queries) + " a day",
        chargeable: queries > 0 ? fmtCount(queries) + " a day" : "none",
        over: queries > 0,
        cost: queries * (cfg.price.query / 1000) * cfg.days,
      },
      {
        label: "Data queried",
        usage: fmtSize(usage.data) + " a day",
        allowance: fmtSize(allowance.data) + " a day",
        chargeable: data > 0 ? fmtSize(data) + " a day" : "none",
        over: data > 0,
        cost: data * cfg.price.data * cfg.days,
      },
    ];

    var total = lines.reduce(function (sum, line) {
      return sum + line.cost;
    }, 0);

    return {
      lines: lines,
      total: total,
      over: lines.filter(function (line) {
        return line.over;
      }),
    };
  }

  /* --- rendering ------------------------------------------------------ */

  function markup(id, cfg) {
    var name = "cc-plan-" + id;

    function field(key, label, sub, value, step, units) {
      var unitControl = units
        ? '<select class="cc-unit" data-unit="' +
          key +
          '" aria-label="' +
          label +
          ' unit">' +
          units
            .map(function (unit) {
              return (
                '<option value="' +
                unit.value +
                '"' +
                (unit.selected ? " selected" : "") +
                ">" +
                unit.value +
                "</option>"
              );
            })
            .join("") +
          "</select>"
        : '<span class="cc-unit cc-unit--fixed">a day</span>';

      return (
        '<div class="cc-field">' +
        '<label class="cc-label" for="cc-' +
        key +
        "-" +
        id +
        '">' +
        label +
        "</label>" +
        '<div class="cc-control">' +
        '<input class="cc-num" id="cc-' +
        key +
        "-" +
        id +
        '" data-usage="' +
        key +
        '" type="number" inputmode="decimal" min="0" step="' +
        step +
        '" value="' +
        value +
        '">' +
        unitControl +
        "</div>" +
        '<p class="cc-sub" data-sub="' +
        key +
        '">' +
        sub +
        "</p>" +
        "</div>"
      );
    }

    return (
      '<div class="cc-head">' +
      '<div class="cc-title">Your usage</div>' +
      '<div class="cc-plan" role="radiogroup" aria-label="Billing">' +
      '<label class="cc-pill"><input type="radio" name="' +
      name +
      '" value="free"><span>Without billing</span></label>' +
      '<label class="cc-pill"><input type="radio" name="' +
      name +
      '" value="paid" checked><span>With billing</span></label>' +
      "</div>" +
      "</div>" +
      '<div class="cc-body">' +
      '<div class="cc-fields">' +
      field("storage", "Storage held", "Across all your workspaces.", 40, 1, [
        { value: "GB", selected: true },
        { value: "TB" },
      ]) +
      field("queries", "Queries", "", 2000, 100) +
      field("data", "Data queried", "", 5, 0.1, [
        { value: "MB" },
        { value: "GB", selected: true },
        { value: "TB" },
      ]) +
      "</div>" +
      '<div class="cc-out" aria-live="polite"></div>' +
      '<p class="cc-foot">Assumes the same usage every day for ' +
      cfg.days +
      " days, and applies the rounding in <a href=\"#billing-terms\">Billing terms</a>. Prices exclude VAT. This is a guide, not a quote.</p>" +
      "</div>"
    );
  }

  // Without billing there is no cost column to show — usage above the allowance
  // is blocked, so the honest last column is what happens, not what it costs.
  function rows(result, plan) {
    var billed = plan === "paid";

    // Five columns do not fit a phone. The table keeps its shape and scrolls
    // inside the card rather than squeezing numbers into two lines each.
    return (
      '<div class="cc-scroll"><table class="cc-table">' +
      "<thead><tr><th>Usage</th><th>You</th><th>Allowance</th><th>Billable</th><th>" +
      (billed ? "Cost" : "Status") +
      "</th></tr></thead>" +
      "<tbody>" +
      result.lines
        .map(function (line) {
          var last = billed
            ? '<td class="cc-cost">' + fmtMoney(line.cost) + "</td>"
            : '<td class="' +
              (line.over ? "cc-blocked" : "cc-under") +
              '">' +
              (line.over ? "Blocked" : "Within allowance") +
              "</td>";

          return (
            '<tr><th scope="row">' +
            line.label +
            "</th><td>" +
            line.usage +
            "</td><td>" +
            line.allowance +
            '</td><td class="' +
            (line.over ? "cc-over" : "cc-under") +
            '">' +
            line.chargeable +
            "</td>" +
            last +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function render(root, cfg, plan, usage) {
    var out = root.querySelector(".cc-out");
    var result = estimate(cfg, plan, usage);

    // Without billing there is nothing to pay: usage simply stops at the
    // allowance. The paid figure is shown alongside because it is the question
    // anyone hitting the limit is actually asking.
    if (plan === "free") {
      var paid = estimate(cfg, "paid", usage);
      var ifBilled =
        paid.total > 0
          ? "With billing set up it would cost " +
            fmtTotal(paid.total) +
            " a month."
          : "With billing set up, the larger allowance would cover it at no charge.";
      var verdict = result.over.length
        ? '<div class="cc-verdict cc-verdict--blocked">' +
          '<div class="cc-verdict-line">Blocked, not billed</div>' +
          "<p>" +
          sentence(
            list(
              result.over.map(function (line) {
                return line.label.toLowerCase();
              }),
            ),
          ) +
          " " +
          (result.over.length > 1 ? "go" : "goes") +
          " over the allowance, so this usage would be cut off until the allowance resets the next day. " +
          ifBilled +
          "</p>" +
          "</div>"
        : '<div class="cc-verdict"><div class="cc-verdict-line">Nothing to pay</div>' +
          "<p>This usage fits inside the free allowance, so it costs nothing and nothing is blocked.</p></div>";

      out.innerHTML = rows(result, "free") + verdict;
      return;
    }

    var headline = result.total > 0
      ? '<div class="cc-verdict">' +
        '<div class="cc-verdict-line"><strong>' +
        fmtTotal(result.total) +
        "</strong> a month <span>·</span> about " +
        fmtTotal(result.total / cfg.days) +
        " a day</div>" +
        "<p>Charged on top of the free allowance, which is applied to each day's usage first.</p>" +
        "</div>"
      : '<div class="cc-verdict"><div class="cc-verdict-line">Nothing to pay</div>' +
        "<p>This usage fits inside the free allowance, so there is nothing to pay.</p></div>";

    out.innerHTML = rows(result, "paid") + headline;
  }

  /* --- wiring --------------------------------------------------------- */

  function hydrate(root) {
    var id = ++seq;
    var cfg = readConfig(root);

    root.innerHTML = markup(id, cfg);

    function read() {
      var usage = {};

      root.querySelectorAll(".cc-num").forEach(function (input) {
        var key = input.dataset.usage;
        var value = parseFloat(input.value);
        if (!isFinite(value) || value < 0) value = 0;

        var unit = root.querySelector('.cc-unit[data-unit="' + key + '"]');
        usage[key] = unit ? value * (UNITS[unit.value] || 1) : value;
      });

      return usage;
    }

    function plan() {
      var checked = root.querySelector('input[type="radio"]:checked');
      return checked && checked.value === "free" ? "free" : "paid";
    }

    function update() {
      var usage = read();
      var days = cfg.days;

      // The inputs are daily because billing is daily, but almost everyone
      // thinks in months — so both are on screen at once.
      root.querySelector('.cc-sub[data-sub="queries"]').textContent =
        "About " + fmtCount(usage.queries * days) + " a month.";
      root.querySelector('.cc-sub[data-sub="data"]').textContent =
        "About " + fmtSize(usage.data * days) + " a month.";

      render(root, cfg, plan(), usage);
    }

    root.addEventListener("input", update);
    root.addEventListener("change", update);
    update();
  }

  // The placeholder sits inside the article React hydrates from a single
  // dangerouslySetInnerHTML string. Touching that subtree before React reaches
  // it — even to set an attribute — makes React compare its markup against a DOM
  // it never rendered and log a hydration mismatch, so nothing is written until
  // hydration has happened.
  //
  // React tags every node it hydrates with a `__reactFiber$…` key, which is the
  // signal waited on here. It is a React internal, so there is a frame budget
  // behind it: if the key never appears the widget renders anyway, which is no
  // worse than not gating at all.
  function hydratedByReact(el) {
    return Object.keys(el).some(function (key) {
      return key.indexOf("__reactFiber$") === 0;
    });
  }

  function whenReady(root, fn) {
    var host = root.closest(".docs-article") || document.body;
    var tries = 0;

    // A timer rather than requestAnimationFrame: rAF is parked in a background
    // tab, and a calculator that stays blank until the tab is looked at is worse
    // than one that renders a beat early.
    (function check() {
      if (hydratedByReact(host) || ++tries > 60) {
        fn();
        return;
      }
      setTimeout(check, 30);
    })();
  }

  var scheduled = new WeakSet();

  function init() {
    document.querySelectorAll(".cost-calc").forEach(function (root) {
      if (scheduled.has(root)) return;
      scheduled.add(root);
      whenReady(root, function () {
        hydrate(root);
      });
    });
  }

  // Arriving from another docs page is a client-side route change: the article
  // is swapped in with no second load event, so the placeholder has to be watched
  // for rather than waited for. The WeakSet keeps this idempotent, and a repeat
  // call costs one query that matches nothing new.
  function watch() {
    init();
    new MutationObserver(init).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
})();
