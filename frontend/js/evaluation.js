/* Evaluation page: everything shown comes from POST /api/evaluate (recomputed from saved masks). */
(() => {
  const $ = (id) => document.getElementById(id);
  const rid = ML.getResultId();
  const NAMES = { canny: "Canny", sobel: "Sobel", prewitt: "Prewitt", laplacian: "Laplacian", log: "LoG" };
  const td = (text, cls) => ML.el("td", { class: cls || "", text });
  const delta = (v) => ML.el("td", { class: `num ${v === null ? "" : v > 0 ? "delta-pos" : v < 0 ? "delta-neg" : ""}`, text: v === null ? "n/a" : (v > 0 ? "+" : "") + v.toFixed(3) });

  function showEmpty(nodes) { const e = $("empty"); e.hidden = false; e.replaceChildren(...nodes); $("content").hidden = true; }

  (async () => {
    if (!rid) return showEmpty(["No image loaded yet. ", ML.el("a", { href: "upload.html", text: "Upload an image" }), " first."]);
    try {
      const meta = await ML.api(`/api/results/${rid}`);
      if (!meta.processed) return showEmpty(["This image has not been processed yet. ", ML.el("a", { href: "workspace.html", text: "Open the workspace" }), " and press Process."]);
      const ev = await ML.postJSON("/api/evaluate", { result_id: rid });
      $("content").hidden = false;
      if (!ev.available) { $("no-ref").hidden = false; return; }
      $("has-ref").hidden = false;

      $("cmp-body").replaceChildren(...ev.comparison.map((c) => ML.el("tr", {}, [
        td(NAMES[c.detector]),
        td(ML.fmt(c.dice_conventional), "num"), td(ML.fmt(c.dice_enhanced), "num"), delta(c.dice_delta),
        td(ML.fmt(c.iou_conventional), "num"), td(ML.fmt(c.iou_enhanced), "num"), delta(c.iou_delta),
        td(ML.fmt(c.edge_map_boundary_f1_conventional), "num"), td(ML.fmt(c.edge_map_boundary_f1_enhanced), "num"), delta(c.edge_map_boundary_f1_delta),
      ])));
      $("rows-body").replaceChildren(...ev.rows.map((r) => ML.el("tr", {}, [
        td(NAMES[r.detector]), td(r.mode), td(r.mask_found ? "yes" : "no"),
        ...["dice", "iou", "precision", "recall", "f1", "boundary_f1", "edge_map_boundary_f1"].map((k) => td(ML.fmt(r[k]), "num")),
      ])));
      $("chart").src = `/api/evaluate/${rid}/chart.png?t=${Date.now()}`;
      $("export-csv").href = `/api/evaluate/${rid}/export?format=csv`;
      $("export-json").href = `/api/evaluate/${rid}/export?format=json`;
      $("m-ref").src = meta.image_urls.reference_mask;
      if (meta.image_urls.mask) { $("m-pred").src = meta.image_urls.mask; $("m-diff").src = meta.image_urls.difference; }
      else { $("m-pred").alt = "No candidate mask was found"; $("m-diff").alt = "No difference image"; }
    } catch (e) {
      if (e.status === 404) { ML.clearResultId(); showEmpty(["That result no longer exists. ", ML.el("a", { href: "upload.html", text: "Upload an image" }), "."]); }
      else showEmpty([e.message]);
    }
  })();
})();
