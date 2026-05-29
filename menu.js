/* =========================================================
   Menu z Google Sheet (live, edytowalne przez klienta).
   Config per strona:  window.AKITA_MENU = { sheetId, tab, slug }
   Jeśli arkusz niedostępny → zostaje statyczne menu (fallback).
========================================================= */
(function () {
  var cfg = window.AKITA_MENU;
  if (!cfg || !cfg.sheetId || !cfg.tab) return;

  var TAGMAP = { vegan: "tag-veg", spicy: "tag-spicy", nongluten: "tag-ng", limited: "tag-limited" };

  function esc(s) { var d = document.createElement("div"); d.textContent = (s == null ? "" : String(s)); return d.innerHTML; }

  function gvizUrl() {
    return "https://docs.google.com/spreadsheets/d/" + cfg.sheetId +
           "/gviz/tq?tqx=out:json&sheet=" + encodeURIComponent(cfg.tab) + "&headers=1&_=" + Date.now();
  }

  function parseGviz(text) {
    var s = text.indexOf("{"), e = text.lastIndexOf("}");
    if (s < 0 || e < 0) throw new Error("zła odpowiedź gviz");
    var json = JSON.parse(text.slice(s, e + 1));
    var cols = (json.table.cols || []).map(function (c) { return (c.label || "").trim(); });
    return (json.table.rows || []).map(function (r) {
      var o = {};
      (r.c || []).forEach(function (cell, i) {
        o[cols[i]] = cell ? (cell.f != null ? cell.f : (cell.v != null ? cell.v : "")) : "";
      });
      return o;
    });
  }

  function driveImg(val) {
    val = (val || "").toString().trim();
    if (!val) return "";
    if (val.indexOf("drive.google") > -1) {
      var m = val.match(/\/d\/([A-Za-z0-9_-]+)/) || val.match(/[?&]id=([A-Za-z0-9_-]+)/);
      if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1000";
    }
    return val; // pełny URL albo ścieżka repo (/img/...)
  }

  function tagSpans(t) {
    if (!t) return "";
    return String(t).split(",").map(function (x) {
      x = x.trim(); if (!x) return "";
      return '<span class="mtag ' + (TAGMAP[x.toLowerCase()] || "tag-veg") + '">' + esc(x) + "</span>";
    }).join("");
  }

  function price(p) { p = String(p == null ? "" : p).trim(); return p ? esc(p) + " zł" : ""; }

  function card(row) {
    var img = driveImg(row["Zdjęcie"]);
    var media = img
      ? '<img src="' + esc(img) + '" class="menu-card-img" alt="' + esc(row["Nazwa"]) + '" loading="lazy" referrerpolicy="no-referrer">'
      : '<div class="img-ph">zdjęcie wkrótce</div>';
    var tags = tagSpans(row["Tagi"]);
    return '<div class="menu-card"><div class="menu-card-img-wrap">' + media + "</div>"
      + '<div class="menu-card-body">' + (tags ? '<div class="menu-card-tags">' + tags + "</div>" : "")
      + '<div class="menu-card-name">' + esc(row["Nazwa"]) + "</div>"
      + '<p class="menu-card-desc">' + esc(row["Opis"]) + "</p>"
      + '<div class="menu-card-footer"><span class="menu-card-price">' + price(row["Cena"]) + "</span></div></div></div>";
  }

  function listRows(rows) {
    return rows.map(function (r) {
      var sub = r["Opis"] ? "<small>" + esc(r["Opis"]) + "</small>" : "";
      return '<div class="menu-list-row"><span class="menu-list-name">' + esc(r["Nazwa"]) + sub
           + '</span><span class="menu-list-price">' + price(r["Cena"]) + "</span></div>";
    }).join("");
  }

  function tsukemonoBlock(rows) {
    if (!rows.length) return "";
    var items = rows.map(function (r) {
      var tags = tagSpans(r["Tagi"]);
      return '<div class="tsk-item"><span class="tsk-name">' + esc(r["Nazwa"]) + "</span>" + tags
           + '<p class="tsk-desc">' + esc(r["Opis"]) + "</p></div>";
    }).join("");
    var p = rows[0]["Cena"] ? esc(rows[0]["Cena"]) + " zł / poz." : "";
    return '<div class="tsukemono-block"><div class="tsukemono-head">'
      + '<h3>Tsukemono <span>pikle, fermenty i przysmaki — każda pozycja osobno</span></h3>'
      + '<span class="menu-card-price">' + p + "</span></div>"
      + '<div class="tsukemono-list">' + items + "</div></div>";
  }

  function isVisible(r) {
    var v = String(r["Widoczne"] == null ? "" : r["Widoczne"]).trim().toLowerCase();
    return v === "" || v === "tak" || v === "true" || v === "yes" || v === "1";
  }
  function section(rows, name) {
    return rows.filter(function (r) {
      return (r["Sekcja"] || "").trim().toLowerCase() === name && isVisible(r);
    }).sort(function (a, b) {
      return (parseFloat(a["Kolejność"]) || 0) - (parseFloat(b["Kolejność"]) || 0);
    });
  }

  function setPanel(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
  function setGrid(panelId, html) {
    var el = document.getElementById(panelId);
    if (!el) return;
    var grid = el.querySelector(".menu-cards-grid");
    if (grid) grid.innerHTML = html;
  }
  function setList(panelId, html) {
    var el = document.getElementById(panelId);
    if (!el) return;
    var list = el.querySelector(".menu-list");
    if (list) list.innerHTML = html;
  }

  function render(rows) {
    var slug = cfg.slug;
    var ramen = section(rows, "ramen");
    var startery = section(rows, "startery");
    var tsk = section(rows, "tsukemono");
    var napoje = section(rows, "napoje");
    var alkohol = section(rows, "alkohol");

    if (ramen.length) setGrid("p-ramen-" + slug, ramen.map(card).join(""));
    if (tsk.length || startery.length) {
      setPanel("p-startery-" + slug, tsukemonoBlock(tsk) + '<div class="menu-cards-grid">' + startery.map(card).join("") + "</div>");
    }
    if (napoje.length) setList("p-napoje-" + slug, listRows(napoje));
    if (alkohol.length) setList("p-alkohol-" + slug, listRows(alkohol));
  }

  fetch(gvizUrl())
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(function (t) {
      var rows = parseGviz(t);
      if (rows && rows.length) { render(rows); document.documentElement.setAttribute("data-menu-source", "sheet"); }
    })
    .catch(function (err) {
      // cicho — zostaje statyczne menu (fallback)
      if (window.console) console.warn("Menu z arkusza niedostępne, zostaje statyczne:", err && err.message);
    });
})();
