(function () {
  const NS = "http://www.w3.org/2000/svg";
  const TONE = {
    idle: { fill: "#ffffff", stroke: "#e7e5e4", text: "#1c1917", sw: 1.25 },
    hot: { fill: "#e1f3fe", stroke: "#1f6c9f", text: "#1f6c9f", sw: 1.75 },
    good: { fill: "#edf3ec", stroke: "#346538", text: "#346538", sw: 1.75 },
    bad: { fill: "#fdebec", stroke: "#9f2f2d", text: "#9f2f2d", sw: 1.75 },
    warn: { fill: "#fbf3db", stroke: "#956400", text: "#956400", sw: 1.75 },
    mute: { fill: "#f7f6f3", stroke: "#e7e5e4", text: "#a8a29e", sw: 1.25 },
    ink: { fill: "#1c1917", stroke: "#1c1917", text: "#ffffff", sw: 1.25 },
  };

  function node(parent, name, attrs) {
    const el = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null) return;
      if (k === "text") el.textContent = String(v);
      else el.setAttribute(k, String(v));
    });
    parent.appendChild(el);
    return el;
  }

  window.Draw = function (svg) {
    svg.setAttribute("viewBox", "0 0 880 520");
    svg.replaceChildren();
    const defs = node(svg, "defs");
    const marker = node(defs, "marker", {
      id: "arrow",
      viewBox: "0 0 10 10",
      refX: "8",
      refY: "5",
      markerWidth: "7",
      markerHeight: "7",
      orient: "auto-start-reverse",
    });
    node(marker, "path", { d: "M 0 1.2 L 9 5 L 0 8.8 Z", fill: "#1c1917" });
    const root = node(svg, "g");
    const api = { svg, root };

    api.el = (name, attrs) => node(root, name, attrs);

    api.tone = (name) => TONE[name] || TONE.idle;

    api.rect = (x, y, w, h, o = {}) => {
      const t = api.tone(o.tone || "idle");
      return api.el("rect", {
        x, y, width: w, height: h,
        rx: o.rx ?? 8,
        fill: o.fill || t.fill,
        stroke: o.stroke || t.stroke,
        "stroke-width": o.sw || t.sw,
        "stroke-dasharray": o.dash || null,
      });
    };

    api.circle = (cx, cy, r, o = {}) => {
      const t = api.tone(o.tone || "idle");
      return api.el("circle", {
        cx, cy, r,
        fill: o.fill || t.fill,
        stroke: o.stroke || t.stroke,
        "stroke-width": o.sw || t.sw,
      });
    };

    api.text = (x, y, text, o = {}) => api.el("text", {
      x, y, text,
      fill: o.fill || "#1c1917",
      "font-size": o.size || 16,
      "font-family": o.mono
        ? "JetBrains Mono, ui-monospace, monospace"
        : "Outfit, sans-serif",
      "font-weight": o.weight || 500,
      "text-anchor": o.anchor || "start",
      "dominant-baseline": o.base || "middle",
    });

    api.label = (x, y, text, o = {}) => {
      api.text(x, y, text, o);
    };

    api.card = (x, y, w, h, title, lines, tone) => {
      const t = api.tone(tone || "idle");
      api.rect(x, y, w, h, { tone: tone || "idle", rx: 10 });
      api.text(x + 14, y + 22, title, { size: 13, fill: t.text, weight: 600 });
      (lines || []).forEach((line, i) => {
        api.text(x + 14, y + 48 + i * 22, line, {
          size: 15,
          fill: "#1c1917",
          mono: true,
          weight: 500,
        });
      });
    };

    api.chip = (x, y, text, tone) => {
      const t = api.tone(tone || "idle");
      const w = Math.max(54, 12 + text.length * 8.4);
      api.rect(x, y, w, 28, { tone, rx: 6 });
      api.text(x + w / 2, y + 14, text, {
        anchor: "middle", size: 13, fill: t.text, mono: true,
      });
      return w;
    };

    api.vnode = (x, y, label, tone, sub) => {
      const t = api.tone(tone || "idle");
      api.circle(x, y, 26, { tone });
      api.text(x, sub ? y - 4 : y, label, {
        anchor: "middle", size: 16, fill: t.text, weight: 600,
      });
      if (sub) {
        api.text(x, y + 12, sub, {
          anchor: "middle", size: 10, fill: t.text, mono: true,
        });
      }
    };

    api.edge = (x1, y1, x2, y2, o = {}) => {
      const t = api.tone(o.tone || "idle");
      const color = o.color || (o.tone && o.tone !== "idle" ? t.stroke : "#44403c");
      const r = o.r ?? 28;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const sx = x1 + (dx / len) * r;
      const sy = y1 + (dy / len) * r;
      const ex = x2 - (dx / len) * (o.directed === false ? r : r + 2);
      const ey = y2 - (dy / len) * (o.directed === false ? r : r + 2);
      const bend = o.bend || 0;
      const mx = (sx + ex) / 2 + (-dy / len) * bend;
      const my = (sy + ey) / 2 + (dx / len) * bend;
      const d = bend
        ? `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`
        : `M ${sx} ${sy} L ${ex} ${ey}`;
      api.el("path", {
        d,
        fill: "none",
        stroke: color,
        "stroke-width": o.sw || 1.6,
        "stroke-dasharray": o.dash || null,
        "marker-end": o.directed === false ? null : "url(#arrow)",
      });
      if (o.label) {
        api.el("rect", {
          x: mx - o.label.length * 4.2 - 6,
          y: my - 11,
          width: o.label.length * 8.4 + 12,
          height: 20,
          rx: 4,
          fill: "#ffffff",
          stroke: "none",
        });
        api.text(mx, my, o.label, {
          anchor: "middle", size: 13, mono: true, fill: color, weight: 600,
        });
      }
    };

    api.graph = (nodes, edges) => {
      const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
      edges.forEach((e) => {
        const a = by[e.a];
        const b = by[e.b];
        if (!a || !b) return;
        api.edge(a.x, a.y, b.x, b.y, e);
      });
      nodes.forEach((n) => api.vnode(n.x, n.y, n.label, n.tone, n.sub));
    };

    api.bits = (x, y, width, bitString, hotIndex, caption) => {
      const bits = bitString.split("");
      const gap = 8;
      const size = Math.min(46, (width - gap * (bits.length - 1)) / bits.length);
      api.text(x, y - 16, caption, { size: 13, fill: "#787774" });
      bits.forEach((bit, i) => {
        const tone = i === hotIndex ? "warn" : bit === "1" ? "ink" : "idle";
        const t = api.tone(tone);
        const bx = x + i * (size + gap);
        api.rect(bx, y, size, size, { tone, rx: 6 });
        api.text(bx + size / 2, y + size / 2, bit, {
          anchor: "middle", size: 18, mono: true, fill: t.text, weight: 600,
        });
      });
    };

    return api;
  };
})();
