// Minimal declarative renderer retained from the prototype.

(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g,
    WHOLE = /^\s*\{\{\s*([\w.$]+)\s*\}\}\s*$/;
  function lookup(path, scope) {
    if (path === "true") return true;
    if (path === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split("."),
      v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? "" : String(v);
    });
  }
  function evt(el, name) {
    var n = name.slice("data-on-".length);
    if (n === "change") {
      var t = el.localName;
      if (t === "input" || t === "textarea") return "input";
      return "change";
    }
    return n;
  }
  function renderNodes(nodes, scope, out) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.nodeType === 3) {
        out.appendChild(
          document.createTextNode(
            node.nodeValue.indexOf("{{") > -1
              ? interp(node.nodeValue, scope)
              : node.nodeValue,
          ),
        );
        continue;
      }
      if (node.nodeType === 8) {
        continue;
      }
      if (node.nodeType !== 1) continue;
      var tag = node.localName;
      if (tag === "sc-for") {
        var list =
          lookup(
            (node.getAttribute("list") || "").replace(/[{}\s]/g, ""),
            scope,
          ) || [];
        var as = node.getAttribute("as") || "item";
        for (var j = 0; j < list.length; j++) {
          var sc = Object.create(scope);
          sc[as] = list[j];
          sc.$index = j;
          renderNodes(node.childNodes, sc, out);
        }
        continue;
      }
      if (tag === "sc-if") {
        if (
          lookup(
            (node.getAttribute("value") || "").replace(/[{}\s]/g, ""),
            scope,
          )
        )
          renderNodes(node.childNodes, scope, out);
        continue;
      }
      var el = node.cloneNode(false),
        deferredValue;
      for (var a = node.attributes.length - 1; a >= 0; a--) {
        var at = node.attributes[a],
          nm = at.name,
          val = at.value;
        if (nm.indexOf("hint-") === 0) {
          el.removeAttribute(nm);
          continue;
        }
        if (val.indexOf("{{") === -1) continue;
        var m = val.match(WHOLE);
        if (nm.indexOf("data-on-") === 0) {
          el.removeAttribute(nm);
          var fn = m ? lookup(m[1], scope) : null;
          if (typeof fn === "function") el.addEventListener(evt(el, nm), fn);
          continue;
        }
        if (
          nm === "value" &&
          (tag === "input" || tag === "select" || tag === "textarea")
        ) {
          deferredValue = m ? lookup(m[1], scope) : interp(val, scope);
          el.removeAttribute(nm);
          continue;
        }
        el.setAttribute(nm, interp(val, scope));
      }
      if (el.hasAttribute("data-progress")) {
        const width = Math.max(
          0,
          Math.min(100, parseFloat(el.getAttribute("data-progress")) || 0),
        );
        el.style.setProperty("--progress-width", width + "%");
      }
      renderNodes(node.childNodes, scope, el);
      if (deferredValue !== undefined) {
        el.value = deferredValue == null ? "" : String(deferredValue);
        if (tag === "input") el.setAttribute("value", el.value);
      }
      out.appendChild(el);
    }
  }
  window.renderNodes = renderNodes;
  window.DCLogic = function () {};
  DCLogic = class {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    setState(p) {
      var n = typeof p === "function" ? p(this.state) : p;
      Object.assign(this.state, n);
      schedule();
    }
    forceUpdate() {
      schedule();
    }
  };
})();
