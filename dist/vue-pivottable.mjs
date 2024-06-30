const wn = function(e, n, r) {
  const t = String(e).split(".");
  let i = t[0];
  const o = t.length > 1 ? r + t[1] : "", a = /(\d+)(\d{3})/;
  for (; a.test(i); )
    i = i.replace(a, `$1${n}$2`);
  return i + o;
}, Oe = function(e) {
  const r = Object.assign({}, {
    digitsAfterDecimal: 2,
    scaler: 1,
    thousandsSep: ",",
    decimalSep: ".",
    prefix: "",
    suffix: ""
  }, e);
  return function(t) {
    if (isNaN(t) || !isFinite(t))
      return "";
    const i = wn(
      (r.scaler * t).toFixed(r.digitsAfterDecimal),
      r.thousandsSep,
      r.decimalSep
    );
    return `${r.prefix}${i}${r.suffix}`;
  };
}, Je = /(\d+)|(\D+)/g, oe = /\d/, Qe = /^0/, Rt = (e, n) => {
  if (n !== null && e === null)
    return -1;
  if (e !== null && n === null)
    return 1;
  if (typeof e == "number" && isNaN(e))
    return -1;
  if (typeof n == "number" && isNaN(n))
    return 1;
  const r = Number(e), t = Number(n);
  if (r < t)
    return -1;
  if (r > t)
    return 1;
  if (typeof e == "number" && typeof n != "number")
    return -1;
  if (typeof n == "number" && typeof e != "number")
    return 1;
  if (typeof e == "number" && typeof n == "number")
    return 0;
  if (isNaN(t) && !isNaN(r))
    return -1;
  if (isNaN(r) && !isNaN(t))
    return 1;
  let i = String(e), o = String(n);
  if (i === o)
    return 0;
  if (!oe.test(i) || !oe.test(o))
    return i > o ? 1 : -1;
  for (i = i.match(Je), o = o.match(Je); i.length && o.length; ) {
    const a = i.shift(), s = o.shift();
    if (a !== s)
      return oe.test(a) && oe.test(s) ? a.replace(Qe, ".0") - s.replace(Qe, ".0") : a > s ? 1 : -1;
  }
  return i.length - o.length;
}, un = function(e) {
  const n = {}, r = {};
  for (const t in e) {
    const i = e[t];
    n[i] = t, typeof i == "string" && (r[i.toLowerCase()] = t);
  }
  return function(t, i) {
    return t in n && i in n ? n[t] - n[i] : t in n ? -1 : i in n ? 1 : t in r && i in r ? r[t] - r[i] : t in r ? -1 : i in r ? 1 : Rt(t, i);
  };
}, De = function(e, n) {
  if (e) {
    if (typeof e == "function") {
      const r = e(n);
      if (typeof r == "function")
        return r;
    } else if (n in e)
      return e[n];
  }
  return Rt;
}, K = Oe(), Ft = Oe({ digitsAfterDecimal: 0 }), vt = Oe({
  digitsAfterDecimal: 1,
  scaler: 100,
  suffix: "%"
}), Z = {
  count(e = Ft) {
    return () => function() {
      return {
        count: 0,
        push() {
          this.count++;
        },
        value() {
          return this.count;
        },
        format: e
      };
    };
  },
  uniques(e, n = Ft) {
    return function([r]) {
      return function() {
        return {
          uniq: [],
          push(t) {
            Array.from(this.uniq).includes(t[r]) || this.uniq.push(t[r]);
          },
          value() {
            return e(this.uniq);
          },
          format: n,
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  sum(e = K) {
    return function([n]) {
      return function() {
        return {
          sum: 0,
          push(r) {
            isNaN(parseFloat(r[n])) || (this.sum += parseFloat(r[n]));
          },
          value() {
            return this.sum;
          },
          format: e,
          numInputs: typeof n < "u" ? 0 : 1
        };
      };
    };
  },
  extremes(e, n = K) {
    return function([r]) {
      return function(t) {
        return {
          val: null,
          sorter: De(
            typeof t < "u" ? t.sorters : null,
            r
          ),
          push(i) {
            let o = i[r];
            ["min", "max"].includes(e) && (o = parseFloat(o), isNaN(o) || (this.val = Math[e](o, this.val !== null ? this.val : o))), e === "first" && this.sorter(o, this.val !== null ? this.val : o) <= 0 && (this.val = o), e === "last" && this.sorter(o, this.val !== null ? this.val : o) >= 0 && (this.val = o);
          },
          value() {
            return this.val;
          },
          format(i) {
            return isNaN(i) ? i : n(i);
          },
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  quantile(e, n = K) {
    return function([r]) {
      return function() {
        return {
          vals: [],
          push(t) {
            const i = parseFloat(t[r]);
            isNaN(i) || this.vals.push(i);
          },
          value() {
            if (this.vals.length === 0)
              return null;
            this.vals.sort((i, o) => i - o);
            const t = (this.vals.length - 1) * e;
            return (this.vals[Math.floor(t)] + this.vals[Math.ceil(t)]) / 2;
          },
          format: n,
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  runningStat(e = "mean", n = 1, r = K) {
    return function([t]) {
      return function() {
        return {
          n: 0,
          m: 0,
          s: 0,
          push(i) {
            const o = parseFloat(i[t]);
            if (isNaN(o))
              return;
            this.n += 1, this.n === 1 && (this.m = o);
            const a = this.m + (o - this.m) / this.n;
            this.s = this.s + (o - this.m) * (o - a), this.m = a;
          },
          value() {
            if (e === "mean")
              return this.n === 0 ? NaN : this.m;
            if (this.n <= n)
              return 0;
            switch (e) {
              case "var":
                return this.s / (this.n - n);
              case "stdev":
                return Math.sqrt(this.s / (this.n - n));
              default:
                throw new Error("unknown mode for runningStat");
            }
          },
          format: r,
          numInputs: typeof t < "u" ? 0 : 1
        };
      };
    };
  },
  sumOverSum(e = K) {
    return function([n, r]) {
      return function() {
        return {
          sumNum: 0,
          sumDenom: 0,
          push(t) {
            isNaN(parseFloat(t[n])) || (this.sumNum += parseFloat(t[n])), isNaN(parseFloat(t[r])) || (this.sumDenom += parseFloat(t[r]));
          },
          value() {
            return this.sumNum / this.sumDenom;
          },
          format: e,
          numInputs: typeof n < "u" && typeof r < "u" ? 0 : 2
        };
      };
    };
  },
  fractionOf(e, n = "total", r = vt) {
    return (...t) => function(i, o, a) {
      return {
        selector: { total: [[], []], row: [o, []], col: [[], a] }[n],
        inner: e(...Array.from(t || []))(i, o, a),
        push(s) {
          this.inner.push(s);
        },
        format: r,
        value() {
          return this.inner.value() / i.getAggregator(...Array.from(this.selector || [])).inner.value();
        },
        numInputs: e(...Array.from(t || []))().numInputs
      };
    };
  }
};
Z.countUnique = (e) => Z.uniques((n) => n.length, e);
Z.listUnique = (e) => Z.uniques((n) => n.join(e), (n) => n);
Z.max = (e) => Z.extremes("max", e);
Z.min = (e) => Z.extremes("min", e);
Z.first = (e) => Z.extremes("first", e);
Z.last = (e) => Z.extremes("last", e);
Z.median = (e) => Z.quantile(0.5, e);
Z.average = (e) => Z.runningStat("mean", 1, e);
Z.var = (e, n) => Z.runningStat("var", e, n);
Z.stdev = (e, n) => Z.runningStat("stdev", e, n);
const te = ((e) => ({
  Count: e.count(Ft),
  "Count Unique Values": e.countUnique(Ft),
  "List Unique Values": e.listUnique(", "),
  Sum: e.sum(K),
  "Integer Sum": e.sum(Ft),
  Average: e.average(K),
  Median: e.median(K),
  "Sample Variance": e.var(1, K),
  "Sample Standard Deviation": e.stdev(1, K),
  Minimum: e.min(K),
  Maximum: e.max(K),
  First: e.first(K),
  Last: e.last(K),
  "Sum over Sum": e.sumOverSum(K),
  "Sum as Fraction of Total": e.fractionOf(e.sum(), "total", vt),
  "Sum as Fraction of Rows": e.fractionOf(e.sum(), "row", vt),
  "Sum as Fraction of Columns": e.fractionOf(e.sum(), "col", vt),
  "Count as Fraction of Total": e.fractionOf(e.count(), "total", vt),
  "Count as Fraction of Rows": e.fractionOf(e.count(), "row", vt),
  "Count as Fraction of Columns": e.fractionOf(e.count(), "col", vt)
}))(Z), En = ((e) => ({
  Compte: e.count(Ft),
  "Compter les valeurs uniques": e.countUnique(Ft),
  "Liste des valeurs uniques": e.listUnique(", "),
  Somme: e.sum(K),
  "Somme de nombres entiers": e.sum(Ft),
  Moyenne: e.average(K),
  Médiane: e.median(K),
  "Variance de l'échantillon": e.var(1, K),
  "Écart-type de l'échantillon": e.stdev(1, K),
  Minimum: e.min(K),
  Maximum: e.max(K),
  Premier: e.first(K),
  Dernier: e.last(K),
  "Somme Total": e.sumOverSum(K),
  "Somme en fraction du total": e.fractionOf(e.sum(), "total", vt),
  "Somme en tant que fraction de lignes": e.fractionOf(e.sum(), "row", vt),
  "Somme en tant que fraction de colonnes": e.fractionOf(e.sum(), "col", vt),
  "Comptage en tant que fraction du total": e.fractionOf(e.count(), "total", vt),
  "Comptage en tant que fraction de lignes": e.fractionOf(e.count(), "row", vt),
  "Comptage en tant que fraction de colonnes": e.fractionOf(e.count(), "col", vt)
}))(Z), cn = {
  en: {
    aggregators: te,
    localeStrings: {
      renderError: "An error occurred rendering the PivotTable results.",
      computeError: "An error occurred computing the PivotTable results.",
      uiRenderError: "An error occurred rendering the PivotTable UI.",
      selectAll: "Select All",
      selectNone: "Select None",
      tooMany: "(too many to list)",
      filterResults: "Filter values",
      totals: "Totals",
      vs: "vs",
      by: "by",
      cancel: "Cancel",
      only: "only"
    }
  },
  fr: {
    frAggregators: En,
    localeStrings: {
      renderError: "Une erreur est survenue en dessinant le tableau croisé.",
      computeError: "Une erreur est survenue en calculant le tableau croisé.",
      uiRenderError: "Une erreur est survenue en dessinant l'interface du tableau croisé dynamique.",
      selectAll: "Sélectionner tout",
      selectNone: "Ne rien sélectionner",
      tooMany: "(trop de valeurs à afficher)",
      filterResults: "Filtrer les valeurs",
      totals: "Totaux",
      vs: "sur",
      by: "par",
      apply: "Appliquer",
      cancel: "Annuler",
      only: "seul"
    }
  }
}, Cn = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
], Tn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], zt = (e) => `0${e}`.substr(-2, 2), An = {
  bin(e, n) {
    return (r) => r[e] - r[e] % n;
  },
  dateFormat(e, n, r = !1, t = Cn, i = Tn) {
    const o = r ? "UTC" : "";
    return function(a) {
      const s = new Date(Date.parse(a[e]));
      return isNaN(s) ? "" : n.replace(/%(.)/g, function(l, u) {
        switch (u) {
          case "y":
            return s[`get${o}FullYear`]();
          case "m":
            return zt(s[`get${o}Month`]() + 1);
          case "n":
            return t[s[`get${o}Month`]()];
          case "d":
            return zt(s[`get${o}Date`]());
          case "w":
            return i[s[`get${o}Day`]()];
          case "x":
            return s[`get${o}Day`]();
          case "H":
            return zt(s[`get${o}Hours`]());
          case "M":
            return zt(s[`get${o}Minutes`]());
          case "S":
            return zt(s[`get${o}Seconds`]());
          default:
            return `%${u}`;
        }
      });
    };
  }
};
class Ot {
  constructor(n = {}) {
    this.props = Object.assign({}, Ot.defaultProps, n), this.aggregator = this.props.aggregators[this.props.aggregatorName](
      this.props.vals
    ), this.tree = {}, this.rowKeys = [], this.colKeys = [], this.rowTotals = {}, this.colTotals = {}, this.allTotal = this.aggregator(this, [], []), this.sorted = !1, this.filteredData = [], Ot.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (r) => {
        this.filter(r) && (this.filteredData.push(r), this.processRecord(r));
      }
    );
  }
  filter(n) {
    const r = "*";
    for (const t in this.props.valueFilter)
      if (t !== r) {
        const i = this.props.valueFilter && this.props.valueFilter[t];
        if (n[t] in i) {
          if (i[n[t]] === !0)
            return !1;
        } else if (i[r] === !0)
          return !1;
      }
    return !0;
  }
  forEachMatchingRecord(n, r) {
    return Ot.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (t) => {
        if (this.filter(t)) {
          for (const i in n)
            if (n[i] !== (i in t ? t[i] : "null"))
              return;
          r(t);
        }
      }
    );
  }
  arrSort(n) {
    let r;
    const t = (() => {
      const i = [];
      for (r of Array.from(n))
        i.push(De(this.props.sorters, r));
      return i;
    })();
    return function(i, o) {
      for (const a of Object.keys(t || {})) {
        const s = t[a], l = s(i[a], o[a]);
        if (l !== 0)
          return l;
      }
      return 0;
    };
  }
  sortKeys() {
    if (!this.sorted) {
      this.sorted = !0;
      const n = (r, t) => this.getAggregator(r, t).value();
      switch (this.props.rowOrder) {
        case "value_a_to_z":
          this.rowKeys.sort((r, t) => Rt(n(r, []), n(t, [])));
          break;
        case "value_z_to_a":
          this.rowKeys.sort((r, t) => -Rt(n(r, []), n(t, [])));
          break;
        default:
          this.rowKeys.sort(this.arrSort(this.props.rows));
      }
      switch (this.props.colOrder) {
        case "value_a_to_z":
          this.colKeys.sort((r, t) => Rt(n([], r), n([], t)));
          break;
        case "value_z_to_a":
          this.colKeys.sort((r, t) => -Rt(n([], r), n([], t)));
          break;
        default:
          this.colKeys.sort(this.arrSort(this.props.cols));
      }
    }
  }
  getFilteredData() {
    return this.filteredData;
  }
  getColKeys() {
    return this.sortKeys(), this.colKeys;
  }
  getRowKeys() {
    return this.sortKeys(), this.rowKeys;
  }
  processRecord(n) {
    const r = [], t = [];
    for (const a of Array.from(this.props.cols))
      r.push(a in n ? n[a] : "null");
    for (const a of Array.from(this.props.rows))
      t.push(a in n ? n[a] : "null");
    const i = t.join("\0"), o = r.join("\0");
    this.allTotal.push(n), t.length !== 0 && (this.rowTotals[i] || (this.rowKeys.push(t), this.rowTotals[i] = this.aggregator(this, t, [])), this.rowTotals[i].push(n)), r.length !== 0 && (this.colTotals[o] || (this.colKeys.push(r), this.colTotals[o] = this.aggregator(this, [], r)), this.colTotals[o].push(n)), r.length !== 0 && t.length !== 0 && (this.tree[i] || (this.tree[i] = {}), this.tree[i][o] || (this.tree[i][o] = this.aggregator(
      this,
      t,
      r
    )), this.tree[i][o].push(n));
  }
  getAggregator(n, r) {
    let t;
    const i = n.join("\0"), o = r.join("\0");
    return n.length === 0 && r.length === 0 ? t = this.allTotal : n.length === 0 ? t = this.colTotals[o] : r.length === 0 ? t = this.rowTotals[i] : t = this.tree[i][o], t || {
      value() {
        return null;
      },
      format() {
        return "";
      }
    };
  }
}
Ot.forEachRecord = function(e, n, r) {
  let t, i;
  if (Object.getOwnPropertyNames(n).length === 0 ? t = r : t = function(o) {
    for (const a in n) {
      const s = n[a](o);
      s !== null && (o[a] = s);
    }
    return r(o);
  }, typeof e == "function")
    return e(t);
  if (Array.isArray(e))
    return Array.isArray(e[0]) ? (() => {
      const o = [];
      for (const a of Object.keys(e || {})) {
        const s = e[a];
        if (a > 0) {
          i = {};
          for (const l of Object.keys(e[0] || {})) {
            const u = e[0][l];
            i[u] = s[l];
          }
          o.push(t(i));
        }
      }
      return o;
    })() : (() => {
      const o = [];
      for (i of Array.from(e))
        o.push(t(i));
      return o;
    })();
  throw new Error("unknown input format");
};
Ot.defaultProps = {
  aggregators: te,
  cols: [],
  rows: [],
  vals: [],
  aggregatorName: "Count",
  sorters: {},
  valueFilter: {},
  rowOrder: "key_a_to_z",
  colOrder: "key_a_to_z",
  derivedAttributes: {}
};
const we = {
  props: {
    data: {
      type: [Array, Object, Function],
      required: !0
    },
    aggregators: {
      type: Object,
      default: function() {
        return te;
      }
    },
    aggregatorName: {
      type: String,
      default: "Count"
    },
    heatmapMode: String,
    tableColorScaleGenerator: {
      type: Function
    },
    tableOptions: {
      type: Object,
      default: function() {
        return {};
      }
    },
    renderers: Object,
    rendererName: {
      type: String,
      default: "Table"
    },
    locale: {
      type: String,
      default: "en"
    },
    locales: {
      type: Object,
      default: function() {
        return cn;
      }
    },
    rowTotal: {
      type: Boolean,
      default: !0
    },
    colTotal: {
      type: Boolean,
      default: !0
    },
    cols: {
      type: Array,
      default: function() {
        return [];
      }
    },
    rows: {
      type: Array,
      default: function() {
        return [];
      }
    },
    vals: {
      type: Array,
      default: function() {
        return [];
      }
    },
    attributes: {
      type: Array,
      default: function() {
        return [];
      }
    },
    valueFilter: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sorters: {
      type: [Function, Object],
      default: function() {
        return {};
      }
    },
    derivedAttributes: {
      type: [Function, Object],
      default: function() {
        return {};
      }
    },
    rowOrder: {
      type: String,
      default: "key_a_to_z",
      validator: function(e) {
        return ["key_a_to_z", "value_a_to_z", "value_z_to_a"].indexOf(e) !== -1;
      }
    },
    colOrder: {
      type: String,
      default: "key_a_to_z",
      validator: function(e) {
        return ["key_a_to_z", "value_a_to_z", "value_z_to_a"].indexOf(e) !== -1;
      }
    },
    tableMaxWidth: {
      type: Number,
      default: 0,
      validator: function(e) {
        return e >= 0;
      }
    },
    colLimit: {
      type: Number,
      default: 100
    },
    rowLimit: {
      type: Number,
      default: 100
    }
  },
  methods: {
    renderError(e) {
      return e("span", this.locales[this.locale].localeStrings.renderError || "An error occurred rendering the PivotTable results.");
    },
    computeError(e) {
      return e("span", this.locales[this.locale].localeStrings.computeError || "An error occurred computing the PivotTable results.");
    },
    uiRenderError(e) {
      return e("span", this.locales[this.locale].localeStrings.uiRenderError || "An error occurred rendering the PivotTable UI.");
    }
  }
};
function In(e) {
  const n = Math.min.apply(Math, e), r = Math.max.apply(Math, e);
  return (t) => {
    const i = 255 - Math.round(255 * (t - n) / (r - n));
    return { backgroundColor: `rgb(255,${i},${i})` };
  };
}
function ie(e = {}) {
  return {
    name: e.name,
    mixins: [
      we
    ],
    props: {
      heatmapMode: String,
      tableColorScaleGenerator: {
        type: Function,
        default: In
      },
      tableOptions: {
        type: Object,
        default: function() {
          return {
            clickCallback: null
          };
        }
      },
      localeStrings: {
        type: Object,
        default: function() {
          return {
            totals: "Totals"
          };
        }
      }
    },
    methods: {
      spanSize(r, t, i) {
        let o;
        if (t !== 0) {
          let s, l, u = !0;
          for (o = 0, l = i, s = l >= 0; s ? o <= l : o >= l; s ? o++ : o--)
            r[t - 1][o] !== r[t][o] && (u = !1);
          if (u)
            return -1;
        }
        let a = 0;
        for (; t + a < r.length; ) {
          let s, l, u = !1;
          for (o = 0, l = i, s = l >= 0; s ? o <= l : o >= l; s ? o++ : o--)
            r[t][o] !== r[t + a][o] && (u = !0);
          if (u)
            break;
          a++;
        }
        return a;
      }
    },
    render(r) {
      let t = null;
      try {
        const g = Object.assign(
          {},
          this.$props,
          this.$attrs.props
        );
        t = new Ot(g);
      } catch (g) {
        if (console && console.error(g.stack))
          return this.computeError(r);
      }
      const i = t.props.cols, o = t.props.rows, a = t.getRowKeys(), s = t.getColKeys(), l = t.getAggregator([], []);
      let u = () => {
      }, c = () => {
      }, f = () => {
      };
      if (e.heatmapMode) {
        const g = this.tableColorScaleGenerator, d = s.map(
          (v) => t.getAggregator([], v).value()
        );
        c = g(d);
        const h = a.map(
          (v) => t.getAggregator(v, []).value()
        );
        if (f = g(h), e.heatmapMode === "full") {
          const v = [];
          a.map(
            (D) => s.map(
              (O) => v.push(t.getAggregator(D, O).value())
            )
          );
          const x = g(v);
          u = (D, O, C) => x(C);
        } else if (e.heatmapMode === "row") {
          const v = {};
          a.map((x) => {
            const D = s.map(
              (O) => t.getAggregator(x, O).value()
            );
            v[x] = g(D);
          }), u = (x, D, O) => v[x](O);
        } else if (e.heatmapMode === "col") {
          const v = {};
          s.map((x) => {
            const D = a.map(
              (O) => t.getAggregator(O, x).value()
            );
            v[x] = g(D);
          }), u = (x, D, O) => v[D](O);
        }
      }
      const p = (g, d, h) => {
        const v = this.tableOptions;
        if (v && v.clickCallback) {
          const x = {};
          let D = {};
          for (let O in i)
            h.hasOwnProperty(O) && (D = i[O], h[O] !== null && (x[D] = h[O]));
          for (let O in o)
            d.hasOwnProperty(O) && (D = o[O], d[O] !== null && (x[D] = d[O]));
          return (O) => v.clickCallback(O, g, x, t);
        }
      };
      return r("table", {
        staticClass: ["pvtTable"]
      }, [
        r(
          "thead",
          [
            i.map((g, d) => r(
              "tr",
              {
                attrs: {
                  key: `colAttrs${d}`
                }
              },
              [
                d === 0 && o.length !== 0 ? r("th", {
                  attrs: {
                    colSpan: o.length,
                    rowSpan: i.length
                  }
                }) : void 0,
                r("th", {
                  staticClass: ["pvtAxisLabel"]
                }, g),
                s.map((h, v) => {
                  const x = this.spanSize(s, v, d);
                  return x === -1 ? null : r("th", {
                    staticClass: ["pvtColLabel"],
                    attrs: {
                      key: `colKey${v}`,
                      colSpan: x,
                      rowSpan: d === i.length - 1 && o.length !== 0 ? 2 : 1
                    }
                  }, h[d]);
                }),
                d === 0 && this.rowTotal ? r("th", {
                  staticClass: ["pvtTotalLabel"],
                  attrs: {
                    rowSpan: i.length + (o.length === 0 ? 0 : 1)
                  }
                }, this.localeStrings.totals) : void 0
              ]
            )),
            o.length !== 0 ? r(
              "tr",
              [
                o.map((g, d) => r("th", {
                  staticClass: ["pvtAxisLabel"],
                  attrs: {
                    key: `rowAttr${d}`
                  }
                }, g)),
                this.rowTotal ? r("th", { staticClass: ["pvtTotalLabel"] }, i.length === 0 ? this.localeStrings.totals : null) : i.length === 0 ? void 0 : r("th", { staticClass: ["pvtTotalLabel"] }, null)
              ]
            ) : void 0
          ]
        ),
        r(
          "tbody",
          [
            a.map((g, d) => {
              const h = t.getAggregator(g, []);
              return r(
                "tr",
                {
                  attrs: {
                    key: `rowKeyRow${d}`
                  }
                },
                [
                  g.map((v, x) => {
                    const D = this.spanSize(a, d, x);
                    return D === -1 ? null : r("th", {
                      staticClass: ["pvtRowLabel"],
                      attrs: {
                        key: `rowKeyLabel${d}-${x}`,
                        rowSpan: D,
                        colSpan: x === o.length - 1 && i.length !== 0 ? 2 : 1
                      }
                    }, v);
                  }),
                  s.map((v, x) => {
                    const D = t.getAggregator(g, v);
                    return r("td", {
                      staticClass: ["pvVal"],
                      style: u(g, v, D.value()),
                      attrs: {
                        key: `pvtVal${d}-${x}`
                      },
                      on: this.tableOptions.clickCallback ? {
                        click: p(D.value(), g, v)
                      } : {}
                    }, D.format(D.value()));
                  }),
                  this.rowTotal ? r("td", {
                    staticClass: ["pvtTotal"],
                    style: f(h.value()),
                    on: this.tableOptions.clickCallback ? {
                      click: p(h.value(), g, [])
                    } : {}
                  }, h.format(h.value())) : void 0
                ]
              );
            }),
            r(
              "tr",
              [
                this.colTotal ? r("th", {
                  staticClass: ["pvtTotalLabel"],
                  attrs: {
                    colSpan: o.length + (i.length === 0 ? 0 : 1)
                  }
                }, this.localeStrings.totals) : void 0,
                this.colTotal ? s.map((g, d) => {
                  const h = t.getAggregator([], g);
                  return r("td", {
                    staticClass: ["pvtTotal"],
                    style: c(h.value()),
                    attrs: {
                      key: `total${d}`
                    },
                    on: this.tableOptions.clickCallback ? {
                      click: p(h.value(), [], g)
                    } : {}
                  }, h.format(h.value()));
                }) : void 0,
                this.colTotal && this.rowTotal ? r("td", {
                  staticClass: ["pvtGrandTotal"],
                  on: this.tableOptions.clickCallback ? {
                    click: p(l.value(), [], [])
                  } : {}
                }, l.format(l.value())) : void 0
              ]
            )
          ]
        )
      ]);
    },
    renderError(r, t) {
      return this.renderError(r);
    }
  };
}
const Fn = {
  name: "tsv-export-renderers",
  mixins: [we],
  render(e) {
    let n = null;
    try {
      const a = Object.assign(
        {},
        this.$props,
        this.$attrs.props
      );
      n = new Ot(a);
    } catch (a) {
      if (console && console.error(a.stack))
        return this.computeError(e);
    }
    const r = n.getRowKeys(), t = n.getColKeys();
    r.length === 0 && r.push([]), t.length === 0 && t.push([]);
    const i = n.props.rows.map((a) => a);
    t.length === 1 && t[0].length === 0 ? i.push(this.aggregatorName) : t.map((a) => i.push(a.join("-")));
    const o = r.map((a) => {
      const s = a.map((l) => l);
      return t.map((l) => {
        const u = n.getAggregator(a, l).value();
        s.push(u || "");
      }), s;
    });
    return o.unshift(i), e("textarea", {
      style: {
        width: "100%",
        height: `${window.innerHeight / 2}px`
      },
      attrs: {
        readOnly: !0
      },
      domProps: {
        value: o.map((a) => a.join("	")).join(`
`)
      }
    });
  },
  renderError(e, n) {
    return this.renderError(e);
  }
}, We = {
  Table: ie({ name: "vue-table" }),
  "Table Heatmap": ie({ heatmapMode: "full", name: "vue-table-heatmap" }),
  "Table Col Heatmap": ie({ heatmapMode: "col", name: "vue-table-col-heatmap" }),
  "Table Row Heatmap": ie({ heatmapMode: "row", name: "vue-table-col-heatmap" }),
  "Export Table TSV": Fn
}, Ke = {
  name: "vue-pivottable",
  mixins: [
    we
  ],
  computed: {
    rendererItems() {
      return this.renderers || Object.assign({}, We);
    }
  },
  methods: {
    createPivottable(e) {
      const n = this.$props;
      return e(this.rendererItems[this.rendererName], {
        props: Object.assign(
          n,
          { localeStrings: n.locales[n.locale].localeStrings }
        )
      });
    },
    createWrapperContainer(e) {
      return e("div", {
        style: {
          display: "block",
          width: "100%",
          "overflow-x": "auto",
          "max-width": this.tableMaxWidth ? `${this.tableMaxWidth}px` : void 0
        }
      }, [
        this.createPivottable(e)
      ]);
    }
  },
  render(e) {
    return this.createWrapperContainer(e);
  },
  renderError(e, n) {
    return this.renderError(e);
  }
}, Nn = {
  name: "draggable-attribute",
  props: {
    open: {
      type: Boolean,
      default: !1
    },
    sortable: {
      type: Boolean,
      default: !0
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    name: {
      type: String,
      required: !0
    },
    attrValues: {
      type: Object,
      required: !1
    },
    valueFilter: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sorter: {
      type: Function,
      required: !0
    },
    localeStrings: {
      type: Object,
      default: function() {
        return {
          selectAll: "Select All",
          selectNone: "Select None",
          tooMany: "(too many to list)",
          // too many values to show
          filterResults: "Filter values",
          only: "only"
        };
      }
    },
    menuLimit: Number,
    zIndex: Number,
    async: Boolean,
    unused: Boolean
  },
  data() {
    return {
      // open: false,
      filterText: "",
      attribute: "",
      values: [],
      filter: {}
    };
  },
  computed: {
    disabled() {
      return !this.sortable && !this.draggable;
    },
    sortonly() {
      return this.sortable && !this.draggable;
    }
  },
  methods: {
    setValuesInFilter(e, n) {
      const r = n.reduce((t, i) => (t[i] = !0, t), {});
      this.$emit("update:filter", { attribute: e, valueFilter: r });
    },
    addValuesToFilter(e, n) {
      const r = n.reduce((t, i) => (t[i] = !0, t), Object.assign({}, this.valueFilter));
      this.$emit("update:filter", { attribute: e, valueFilter: r });
    },
    removeValuesFromFilter(e, n) {
      const r = n.reduce((t, i) => (t[i] && delete t[i], t), Object.assign({}, this.valueFilter));
      this.$emit("update:filter", { attribute: e, valueFilter: r });
    },
    moveFilterBoxToTop(e) {
      this.$emit("moveToTop:filterbox", { attribute: e });
    },
    toggleValue(e) {
      e in this.valueFilter ? this.removeValuesFromFilter(this.name, [e]) : this.addValuesToFilter(this.name, [e]);
    },
    matchesFilter(e) {
      return e.toLowerCase().trim().includes(this.filterText.toLowerCase().trim());
    },
    selectOnly(e, n) {
      e.stopPropagation(), this.value = n, this.setValuesInFilter(this.name, Object.keys(this.attrValues).filter((r) => r !== n));
    },
    getFilterBox(e) {
      const n = Object.keys(this.attrValues).length < this.menuLimit, t = Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)).sort(this.sorter);
      return e(
        "div",
        {
          staticClass: ["pvtFilterBox"],
          style: {
            display: "block",
            cursor: "initial",
            zIndex: this.zIndex
          },
          on: {
            click: (i) => {
              i.stopPropagation(), this.moveFilterBoxToTop(this.name);
            }
          }
        },
        [
          e(
            "div",
            {
              staticClass: "pvtSearchContainer"
            },
            [
              n || e("p", this.localeStrings.tooMany),
              n && e("input", {
                staticClass: ["pvtSearch"],
                attrs: {
                  type: "text",
                  placeholder: this.localeStrings.filterResults
                },
                domProps: {
                  value: this.filterText
                },
                on: {
                  input: (i) => {
                    this.filterText = i.target.value, this.$emit("input", i.target.value);
                  }
                }
              }),
              e("a", {
                staticClass: ["pvtFilterTextClear"],
                on: {
                  click: () => {
                    this.filterText = "";
                  }
                }
              }),
              e("a", {
                staticClass: ["pvtButton"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => this.removeValuesFromFilter(this.name, Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)))
                }
              }, this.localeStrings.selectAll),
              e("a", {
                staticClass: ["pvtButton"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => this.addValuesToFilter(this.name, Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)))
                }
              }, this.localeStrings.selectNone)
            ]
          ),
          n && e(
            "div",
            {
              staticClass: ["pvtCheckContainer"]
            },
            t.map((i) => {
              const o = !(i in this.valueFilter);
              return e(
                "p",
                {
                  class: {
                    selected: o
                  },
                  attrs: {
                    key: i
                  },
                  on: {
                    click: () => this.toggleValue(i)
                  }
                },
                [
                  e("input", {
                    attrs: {
                      type: "checkbox"
                    },
                    domProps: {
                      checked: o
                    }
                  }),
                  i,
                  e("a", {
                    staticClass: ["pvtOnly"],
                    on: {
                      click: (a) => this.selectOnly(a, i)
                    }
                  }, this.localeStrings.only),
                  e("a", {
                    staticClass: ["pvtOnlySpacer"]
                  })
                ]
              );
            })
          )
        ]
      );
    },
    toggleFilterBox(e) {
      if (e.stopPropagation(), !this.attrValues) {
        this.$listeners["no:filterbox"] && this.$emit("no:filterbox");
        return;
      }
      this.openFilterBox(this.name, !this.open), this.moveFilterBoxToTop(this.name);
    },
    openFilterBox(e, n) {
      this.$emit("open:filterbox", { attribute: e, open: n });
    }
  },
  render(e) {
    const n = Object.keys(this.valueFilter).length !== 0 ? "pvtFilteredAttribute" : "", r = this.$scopedSlots.pvtAttr;
    return e(
      "li",
      {
        attrs: {
          "data-id": this.disabled ? void 0 : this.name
        }
      },
      [
        e(
          "span",
          {
            staticClass: ["pvtAttr " + n],
            class: {
              sortonly: this.sortonly,
              disabled: this.disabled
            }
          },
          [
            r ? r({ name: this.name }) : this.name,
            !this.disabled && (!this.async || !this.unused && this.async) ? e("span", {
              staticClass: ["pvtTriangle"],
              on: {
                click: this.toggleFilterBox.bind(this)
              }
            }, "  ▾") : void 0,
            this.open ? this.getFilterBox(e) : void 0
          ]
        )
      ]
    );
  }
}, Ce = {
  props: ["values", "value"],
  model: {
    prop: "value",
    event: "input"
  },
  created() {
    this.$emit("input", this.value || this.values[0]);
  },
  methods: {
    handleChange(e) {
      this.$emit("input", e.target.value);
    }
  },
  render(e) {
    return e(
      "select",
      {
        staticClass: ["pvtDropdown"],
        domProps: {
          value: this.value
        },
        on: {
          change: this.handleChange
        }
      },
      [
        this.values.map((n) => {
          const r = n;
          return e("option", {
            attrs: {
              value: n,
              selected: n === this.value ? "selected" : void 0
            }
          }, r);
        })
      ]
    );
  }
};
var Mn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Pn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function jn(e) {
  if (e.__esModule) return e;
  var n = e.default;
  if (typeof n == "function") {
    var r = function t() {
      return this instanceof t ? Reflect.construct(n, arguments, this.constructor) : n.apply(this, arguments);
    };
    r.prototype = n.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(t) {
    var i = Object.getOwnPropertyDescriptor(e, t);
    Object.defineProperty(r, t, i.get ? i : {
      enumerable: !0,
      get: function() {
        return e[t];
      }
    });
  }), r;
}
var fn = { exports: {} };
/**!
 * Sortable 1.10.2
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function fe(e) {
  return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? fe = function(n) {
    return typeof n;
  } : fe = function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, fe(e);
}
function Rn(e, n, r) {
  return n in e ? Object.defineProperty(e, n, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[n] = r, e;
}
function bt() {
  return bt = Object.assign || function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var r = arguments[n];
      for (var t in r)
        Object.prototype.hasOwnProperty.call(r, t) && (e[t] = r[t]);
    }
    return e;
  }, bt.apply(this, arguments);
}
function Nt(e) {
  for (var n = 1; n < arguments.length; n++) {
    var r = arguments[n] != null ? arguments[n] : {}, t = Object.keys(r);
    typeof Object.getOwnPropertySymbols == "function" && (t = t.concat(Object.getOwnPropertySymbols(r).filter(function(i) {
      return Object.getOwnPropertyDescriptor(r, i).enumerable;
    }))), t.forEach(function(i) {
      Rn(e, i, r[i]);
    });
  }
  return e;
}
function Ln(e, n) {
  if (e == null) return {};
  var r = {}, t = Object.keys(e), i, o;
  for (o = 0; o < t.length; o++)
    i = t[o], !(n.indexOf(i) >= 0) && (r[i] = e[i]);
  return r;
}
function $n(e, n) {
  if (e == null) return {};
  var r = Ln(e, n), t, i;
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    for (i = 0; i < o.length; i++)
      t = o[i], !(n.indexOf(t) >= 0) && Object.prototype.propertyIsEnumerable.call(e, t) && (r[t] = e[t]);
  }
  return r;
}
function Bn(e) {
  return Vn(e) || Un(e) || zn();
}
function Vn(e) {
  if (Array.isArray(e)) {
    for (var n = 0, r = new Array(e.length); n < e.length; n++) r[n] = e[n];
    return r;
  }
}
function Un(e) {
  if (Symbol.iterator in Object(e) || Object.prototype.toString.call(e) === "[object Arguments]") return Array.from(e);
}
function zn() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
var Gn = "1.10.2";
function Et(e) {
  if (typeof window < "u" && window.navigator)
    return !!/* @__PURE__ */ navigator.userAgent.match(e);
}
var Ct = Et(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), ee = Et(/Edge/i), qe = Et(/firefox/i), Ve = Et(/safari/i) && !Et(/chrome/i) && !Et(/android/i), dn = Et(/iP(ad|od|hone)/i), Hn = Et(/chrome/i) && Et(/android/i), hn = {
  capture: !1,
  passive: !1
};
function $(e, n, r) {
  e.addEventListener(n, r, !Ct && hn);
}
function R(e, n, r) {
  e.removeEventListener(n, r, !Ct && hn);
}
function ve(e, n) {
  if (n) {
    if (n[0] === ">" && (n = n.substring(1)), e)
      try {
        if (e.matches)
          return e.matches(n);
        if (e.msMatchesSelector)
          return e.msMatchesSelector(n);
        if (e.webkitMatchesSelector)
          return e.webkitMatchesSelector(n);
      } catch {
        return !1;
      }
    return !1;
  }
}
function Wn(e) {
  return e.host && e !== document && e.host.nodeType ? e.host : e.parentNode;
}
function St(e, n, r, t) {
  if (e) {
    r = r || document;
    do {
      if (n != null && (n[0] === ">" ? e.parentNode === r && ve(e, n) : ve(e, n)) || t && e === r)
        return e;
      if (e === r) break;
    } while (e = Wn(e));
  }
  return null;
}
var _e = /\s+/g;
function k(e, n, r) {
  if (e && n)
    if (e.classList)
      e.classList[r ? "add" : "remove"](n);
    else {
      var t = (" " + e.className + " ").replace(_e, " ").replace(" " + n + " ", " ");
      e.className = (t + (r ? " " + n : "")).replace(_e, " ");
    }
}
function w(e, n, r) {
  var t = e && e.style;
  if (t) {
    if (r === void 0)
      return document.defaultView && document.defaultView.getComputedStyle ? r = document.defaultView.getComputedStyle(e, "") : e.currentStyle && (r = e.currentStyle), n === void 0 ? r : r[n];
    !(n in t) && n.indexOf("webkit") === -1 && (n = "-webkit-" + n), t[n] = r + (typeof r == "string" ? "" : "px");
  }
}
function Lt(e, n) {
  var r = "";
  if (typeof e == "string")
    r = e;
  else
    do {
      var t = w(e, "transform");
      t && t !== "none" && (r = t + " " + r);
    } while (!n && (e = e.parentNode));
  var i = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return i && new i(r);
}
function pn(e, n, r) {
  if (e) {
    var t = e.getElementsByTagName(n), i = 0, o = t.length;
    if (r)
      for (; i < o; i++)
        r(t[i], i);
    return t;
  }
  return [];
}
function wt() {
  var e = document.scrollingElement;
  return e || document.documentElement;
}
function _(e, n, r, t, i) {
  if (!(!e.getBoundingClientRect && e !== window)) {
    var o, a, s, l, u, c, f;
    if (e !== window && e !== wt() ? (o = e.getBoundingClientRect(), a = o.top, s = o.left, l = o.bottom, u = o.right, c = o.height, f = o.width) : (a = 0, s = 0, l = window.innerHeight, u = window.innerWidth, c = window.innerHeight, f = window.innerWidth), (n || r) && e !== window && (i = i || e.parentNode, !Ct))
      do
        if (i && i.getBoundingClientRect && (w(i, "transform") !== "none" || r && w(i, "position") !== "static")) {
          var p = i.getBoundingClientRect();
          a -= p.top + parseInt(w(i, "border-top-width")), s -= p.left + parseInt(w(i, "border-left-width")), l = a + o.height, u = s + o.width;
          break;
        }
      while (i = i.parentNode);
    if (t && e !== window) {
      var g = Lt(i || e), d = g && g.a, h = g && g.d;
      g && (a /= h, s /= d, f /= d, c /= h, l = a + c, u = s + f);
    }
    return {
      top: a,
      left: s,
      bottom: l,
      right: u,
      width: f,
      height: c
    };
  }
}
function tn(e, n, r) {
  for (var t = It(e, !0), i = _(e)[n]; t; ) {
    var o = _(t)[r], a = void 0;
    if (a = i >= o, !a) return t;
    if (t === wt()) break;
    t = It(t, !1);
  }
  return !1;
}
function me(e, n, r) {
  for (var t = 0, i = 0, o = e.children; i < o.length; ) {
    if (o[i].style.display !== "none" && o[i] !== T.ghost && o[i] !== T.dragged && St(o[i], r.draggable, e, !1)) {
      if (t === n)
        return o[i];
      t++;
    }
    i++;
  }
  return null;
}
function Xe(e, n) {
  for (var r = e.lastElementChild; r && (r === T.ghost || w(r, "display") === "none" || n && !ve(r, n)); )
    r = r.previousElementSibling;
  return r || null;
}
function q(e, n) {
  var r = 0;
  if (!e || !e.parentNode)
    return -1;
  for (; e = e.previousElementSibling; )
    e.nodeName.toUpperCase() !== "TEMPLATE" && e !== T.clone && (!n || ve(e, n)) && r++;
  return r;
}
function en(e) {
  var n = 0, r = 0, t = wt();
  if (e)
    do {
      var i = Lt(e), o = i.a, a = i.d;
      n += e.scrollLeft * o, r += e.scrollTop * a;
    } while (e !== t && (e = e.parentNode));
  return [n, r];
}
function Kn(e, n) {
  for (var r in e)
    if (e.hasOwnProperty(r)) {
      for (var t in n)
        if (n.hasOwnProperty(t) && n[t] === e[r][t]) return Number(r);
    }
  return -1;
}
function It(e, n) {
  if (!e || !e.getBoundingClientRect) return wt();
  var r = e, t = !1;
  do
    if (r.clientWidth < r.scrollWidth || r.clientHeight < r.scrollHeight) {
      var i = w(r);
      if (r.clientWidth < r.scrollWidth && (i.overflowX == "auto" || i.overflowX == "scroll") || r.clientHeight < r.scrollHeight && (i.overflowY == "auto" || i.overflowY == "scroll")) {
        if (!r.getBoundingClientRect || r === document.body) return wt();
        if (t || n) return r;
        t = !0;
      }
    }
  while (r = r.parentNode);
  return wt();
}
function Xn(e, n) {
  if (e && n)
    for (var r in n)
      n.hasOwnProperty(r) && (e[r] = n[r]);
  return e;
}
function Te(e, n) {
  return Math.round(e.top) === Math.round(n.top) && Math.round(e.left) === Math.round(n.left) && Math.round(e.height) === Math.round(n.height) && Math.round(e.width) === Math.round(n.width);
}
var Jt;
function gn(e, n) {
  return function() {
    if (!Jt) {
      var r = arguments, t = this;
      r.length === 1 ? e.call(t, r[0]) : e.apply(t, r), Jt = setTimeout(function() {
        Jt = void 0;
      }, n);
    }
  };
}
function Yn() {
  clearTimeout(Jt), Jt = void 0;
}
function vn(e, n, r) {
  e.scrollLeft += n, e.scrollTop += r;
}
function Ye(e) {
  var n = window.Polymer, r = window.jQuery || window.Zepto;
  return n && n.dom ? n.dom(e).cloneNode(!0) : r ? r(e).clone(!0)[0] : e.cloneNode(!0);
}
function nn(e, n) {
  w(e, "position", "absolute"), w(e, "top", n.top), w(e, "left", n.left), w(e, "width", n.width), w(e, "height", n.height);
}
function Ae(e) {
  w(e, "position", ""), w(e, "top", ""), w(e, "left", ""), w(e, "width", ""), w(e, "height", "");
}
var ut = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function kn() {
  var e = [], n;
  return {
    captureAnimationState: function() {
      if (e = [], !!this.options.animation) {
        var t = [].slice.call(this.el.children);
        t.forEach(function(i) {
          if (!(w(i, "display") === "none" || i === T.ghost)) {
            e.push({
              target: i,
              rect: _(i)
            });
            var o = Nt({}, e[e.length - 1].rect);
            if (i.thisAnimationDuration) {
              var a = Lt(i, !0);
              a && (o.top -= a.f, o.left -= a.e);
            }
            i.fromRect = o;
          }
        });
      }
    },
    addAnimationState: function(t) {
      e.push(t);
    },
    removeAnimationState: function(t) {
      e.splice(Kn(e, {
        target: t
      }), 1);
    },
    animateAll: function(t) {
      var i = this;
      if (!this.options.animation) {
        clearTimeout(n), typeof t == "function" && t();
        return;
      }
      var o = !1, a = 0;
      e.forEach(function(s) {
        var l = 0, u = s.target, c = u.fromRect, f = _(u), p = u.prevFromRect, g = u.prevToRect, d = s.rect, h = Lt(u, !0);
        h && (f.top -= h.f, f.left -= h.e), u.toRect = f, u.thisAnimationDuration && Te(p, f) && !Te(c, f) && // Make sure animatingRect is on line between toRect & fromRect
        (d.top - f.top) / (d.left - f.left) === (c.top - f.top) / (c.left - f.left) && (l = Jn(d, p, g, i.options)), Te(f, c) || (u.prevFromRect = c, u.prevToRect = f, l || (l = i.options.animation), i.animate(u, d, f, l)), l && (o = !0, a = Math.max(a, l), clearTimeout(u.animationResetTimer), u.animationResetTimer = setTimeout(function() {
          u.animationTime = 0, u.prevFromRect = null, u.fromRect = null, u.prevToRect = null, u.thisAnimationDuration = null;
        }, l), u.thisAnimationDuration = l);
      }), clearTimeout(n), o ? n = setTimeout(function() {
        typeof t == "function" && t();
      }, a) : typeof t == "function" && t(), e = [];
    },
    animate: function(t, i, o, a) {
      if (a) {
        w(t, "transition", ""), w(t, "transform", "");
        var s = Lt(this.el), l = s && s.a, u = s && s.d, c = (i.left - o.left) / (l || 1), f = (i.top - o.top) / (u || 1);
        t.animatingX = !!c, t.animatingY = !!f, w(t, "transform", "translate3d(" + c + "px," + f + "px,0)"), Zn(t), w(t, "transition", "transform " + a + "ms" + (this.options.easing ? " " + this.options.easing : "")), w(t, "transform", "translate3d(0,0,0)"), typeof t.animated == "number" && clearTimeout(t.animated), t.animated = setTimeout(function() {
          w(t, "transition", ""), w(t, "transform", ""), t.animated = !1, t.animatingX = !1, t.animatingY = !1;
        }, a);
      }
    }
  };
}
function Zn(e) {
  return e.offsetWidth;
}
function Jn(e, n, r, t) {
  return Math.sqrt(Math.pow(n.top - e.top, 2) + Math.pow(n.left - e.left, 2)) / Math.sqrt(Math.pow(n.top - r.top, 2) + Math.pow(n.left - r.left, 2)) * t.animation;
}
var Gt = [], Ie = {
  initializeByDefault: !0
}, ne = {
  mount: function(n) {
    for (var r in Ie)
      Ie.hasOwnProperty(r) && !(r in n) && (n[r] = Ie[r]);
    Gt.push(n);
  },
  pluginEvent: function(n, r, t) {
    var i = this;
    this.eventCanceled = !1, t.cancel = function() {
      i.eventCanceled = !0;
    };
    var o = n + "Global";
    Gt.forEach(function(a) {
      r[a.pluginName] && (r[a.pluginName][o] && r[a.pluginName][o](Nt({
        sortable: r
      }, t)), r.options[a.pluginName] && r[a.pluginName][n] && r[a.pluginName][n](Nt({
        sortable: r
      }, t)));
    });
  },
  initializePlugins: function(n, r, t, i) {
    Gt.forEach(function(s) {
      var l = s.pluginName;
      if (!(!n.options[l] && !s.initializeByDefault)) {
        var u = new s(n, r, n.options);
        u.sortable = n, u.options = n.options, n[l] = u, bt(t, u.defaults);
      }
    });
    for (var o in n.options)
      if (n.options.hasOwnProperty(o)) {
        var a = this.modifyOption(n, o, n.options[o]);
        typeof a < "u" && (n.options[o] = a);
      }
  },
  getEventProperties: function(n, r) {
    var t = {};
    return Gt.forEach(function(i) {
      typeof i.eventProperties == "function" && bt(t, i.eventProperties.call(r[i.pluginName], n));
    }), t;
  },
  modifyOption: function(n, r, t) {
    var i;
    return Gt.forEach(function(o) {
      n[o.pluginName] && o.optionListeners && typeof o.optionListeners[r] == "function" && (i = o.optionListeners[r].call(n[o.pluginName], t));
    }), i;
  }
};
function Xt(e) {
  var n = e.sortable, r = e.rootEl, t = e.name, i = e.targetEl, o = e.cloneEl, a = e.toEl, s = e.fromEl, l = e.oldIndex, u = e.newIndex, c = e.oldDraggableIndex, f = e.newDraggableIndex, p = e.originalEvent, g = e.putSortable, d = e.extraEventProperties;
  if (n = n || r && r[ut], !!n) {
    var h, v = n.options, x = "on" + t.charAt(0).toUpperCase() + t.substr(1);
    window.CustomEvent && !Ct && !ee ? h = new CustomEvent(t, {
      bubbles: !0,
      cancelable: !0
    }) : (h = document.createEvent("Event"), h.initEvent(t, !0, !0)), h.to = a || r, h.from = s || r, h.item = i || r, h.clone = o, h.oldIndex = l, h.newIndex = u, h.oldDraggableIndex = c, h.newDraggableIndex = f, h.originalEvent = p, h.pullMode = g ? g.lastPutMode : void 0;
    var D = Nt({}, d, ne.getEventProperties(t, n));
    for (var O in D)
      h[O] = D[O];
    r && r.dispatchEvent(h), v[x] && v[x].call(n, h);
  }
}
var ft = function(n, r) {
  var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = t.evt, o = $n(t, ["evt"]);
  ne.pluginEvent.bind(T)(n, r, Nt({
    dragEl: S,
    parentEl: rt,
    ghostEl: M,
    rootEl: Y,
    nextEl: jt,
    lastDownEl: de,
    cloneEl: Q,
    cloneHidden: At,
    dragStarted: Yt,
    putSortable: at,
    activeSortable: T.active,
    originalEvent: i,
    oldIndex: Ut,
    oldDraggableIndex: Qt,
    newIndex: gt,
    newDraggableIndex: Tt,
    hideGhostForTarget: xn,
    unhideGhostForTarget: Sn,
    cloneNowHidden: function() {
      At = !0;
    },
    cloneNowShown: function() {
      At = !1;
    },
    dispatchSortableEvent: function(s) {
      ct({
        sortable: r,
        name: s,
        originalEvent: i
      });
    }
  }, o));
};
function ct(e) {
  Xt(Nt({
    putSortable: at,
    cloneEl: Q,
    targetEl: S,
    rootEl: Y,
    oldIndex: Ut,
    oldDraggableIndex: Qt,
    newIndex: gt,
    newDraggableIndex: Tt
  }, e));
}
var S, rt, M, Y, jt, de, Q, At, Ut, gt, Qt, Tt, ae, at, Vt = !1, be = !1, ye = [], Mt, yt, Fe, Ne, rn, on, Yt, $t, qt, _t = !1, se = !1, he, lt, Me = [], Ue = !1, xe = [], Ee = typeof document < "u", le = dn, an = ee || Ct ? "cssFloat" : "float", Qn = Ee && !Hn && !dn && "draggable" in document.createElement("div"), mn = function() {
  if (Ee) {
    if (Ct)
      return !1;
    var e = document.createElement("x");
    return e.style.cssText = "pointer-events:auto", e.style.pointerEvents === "auto";
  }
}(), bn = function(n, r) {
  var t = w(n), i = parseInt(t.width) - parseInt(t.paddingLeft) - parseInt(t.paddingRight) - parseInt(t.borderLeftWidth) - parseInt(t.borderRightWidth), o = me(n, 0, r), a = me(n, 1, r), s = o && w(o), l = a && w(a), u = s && parseInt(s.marginLeft) + parseInt(s.marginRight) + _(o).width, c = l && parseInt(l.marginLeft) + parseInt(l.marginRight) + _(a).width;
  if (t.display === "flex")
    return t.flexDirection === "column" || t.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  if (t.display === "grid")
    return t.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  if (o && s.float && s.float !== "none") {
    var f = s.float === "left" ? "left" : "right";
    return a && (l.clear === "both" || l.clear === f) ? "vertical" : "horizontal";
  }
  return o && (s.display === "block" || s.display === "flex" || s.display === "table" || s.display === "grid" || u >= i && t[an] === "none" || a && t[an] === "none" && u + c > i) ? "vertical" : "horizontal";
}, qn = function(n, r, t) {
  var i = t ? n.left : n.top, o = t ? n.right : n.bottom, a = t ? n.width : n.height, s = t ? r.left : r.top, l = t ? r.right : r.bottom, u = t ? r.width : r.height;
  return i === s || o === l || i + a / 2 === s + u / 2;
}, _n = function(n, r) {
  var t;
  return ye.some(function(i) {
    if (!Xe(i)) {
      var o = _(i), a = i[ut].options.emptyInsertThreshold, s = n >= o.left - a && n <= o.right + a, l = r >= o.top - a && r <= o.bottom + a;
      if (a && s && l)
        return t = i;
    }
  }), t;
}, yn = function(n) {
  function r(o, a) {
    return function(s, l, u, c) {
      var f = s.options.group.name && l.options.group.name && s.options.group.name === l.options.group.name;
      if (o == null && (a || f))
        return !0;
      if (o == null || o === !1)
        return !1;
      if (a && o === "clone")
        return o;
      if (typeof o == "function")
        return r(o(s, l, u, c), a)(s, l, u, c);
      var p = (a ? s : l).options.group.name;
      return o === !0 || typeof o == "string" && o === p || o.join && o.indexOf(p) > -1;
    };
  }
  var t = {}, i = n.group;
  (!i || fe(i) != "object") && (i = {
    name: i
  }), t.name = i.name, t.checkPull = r(i.pull, !0), t.checkPut = r(i.put), t.revertClone = i.revertClone, n.group = t;
}, xn = function() {
  !mn && M && w(M, "display", "none");
}, Sn = function() {
  !mn && M && w(M, "display", "");
};
Ee && document.addEventListener("click", function(e) {
  if (be)
    return e.preventDefault(), e.stopPropagation && e.stopPropagation(), e.stopImmediatePropagation && e.stopImmediatePropagation(), be = !1, !1;
}, !0);
var Pt = function(n) {
  if (S) {
    n = n.touches ? n.touches[0] : n;
    var r = _n(n.clientX, n.clientY);
    if (r) {
      var t = {};
      for (var i in n)
        n.hasOwnProperty(i) && (t[i] = n[i]);
      t.target = t.rootEl = r, t.preventDefault = void 0, t.stopPropagation = void 0, r[ut]._onDragOver(t);
    }
  }
}, tr = function(n) {
  S && S.parentNode[ut]._isOutsideThisEl(n.target);
};
function T(e, n) {
  if (!(e && e.nodeType && e.nodeType === 1))
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(e));
  this.el = e, this.options = n = bt({}, n), e[ut] = this;
  var r = {
    group: null,
    sort: !0,
    disabled: !1,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(e.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    // percentage; 0 <= x <= 1
    invertSwap: !1,
    // invert always
    invertedSwapThreshold: null,
    // will be set to same as swapThreshold if default
    removeCloneOnHide: !0,
    direction: function() {
      return bn(e, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: !0,
    animation: 0,
    easing: null,
    setData: function(a, s) {
      a.setData("Text", s.textContent);
    },
    dropBubble: !1,
    dragoverBubble: !1,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: !1,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: !1,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: !1,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: T.supportPointer !== !1 && "PointerEvent" in window,
    emptyInsertThreshold: 5
  };
  ne.initializePlugins(this, e, r);
  for (var t in r)
    !(t in n) && (n[t] = r[t]);
  yn(n);
  for (var i in this)
    i.charAt(0) === "_" && typeof this[i] == "function" && (this[i] = this[i].bind(this));
  this.nativeDraggable = n.forceFallback ? !1 : Qn, this.nativeDraggable && (this.options.touchStartThreshold = 1), n.supportPointer ? $(e, "pointerdown", this._onTapStart) : ($(e, "mousedown", this._onTapStart), $(e, "touchstart", this._onTapStart)), this.nativeDraggable && ($(e, "dragover", this), $(e, "dragenter", this)), ye.push(this.el), n.store && n.store.get && this.sort(n.store.get(this) || []), bt(this, kn());
}
T.prototype = /** @lends Sortable.prototype */
{
  constructor: T,
  _isOutsideThisEl: function(n) {
    !this.el.contains(n) && n !== this.el && ($t = null);
  },
  _getDirection: function(n, r) {
    return typeof this.options.direction == "function" ? this.options.direction.call(this, n, r, S) : this.options.direction;
  },
  _onTapStart: function(n) {
    if (n.cancelable) {
      var r = this, t = this.el, i = this.options, o = i.preventOnFilter, a = n.type, s = n.touches && n.touches[0] || n.pointerType && n.pointerType === "touch" && n, l = (s || n).target, u = n.target.shadowRoot && (n.path && n.path[0] || n.composedPath && n.composedPath()[0]) || l, c = i.filter;
      if (sr(t), !S && !(/mousedown|pointerdown/.test(a) && n.button !== 0 || i.disabled) && !u.isContentEditable && (l = St(l, i.draggable, t, !1), !(l && l.animated) && de !== l)) {
        if (Ut = q(l), Qt = q(l, i.draggable), typeof c == "function") {
          if (c.call(this, n, l, this)) {
            ct({
              sortable: r,
              rootEl: u,
              name: "filter",
              targetEl: l,
              toEl: t,
              fromEl: t
            }), ft("filter", r, {
              evt: n
            }), o && n.cancelable && n.preventDefault();
            return;
          }
        } else if (c && (c = c.split(",").some(function(f) {
          if (f = St(u, f.trim(), t, !1), f)
            return ct({
              sortable: r,
              rootEl: f,
              name: "filter",
              targetEl: l,
              fromEl: t,
              toEl: t
            }), ft("filter", r, {
              evt: n
            }), !0;
        }), c)) {
          o && n.cancelable && n.preventDefault();
          return;
        }
        i.handle && !St(u, i.handle, t, !1) || this._prepareDragStart(n, s, l);
      }
    }
  },
  _prepareDragStart: function(n, r, t) {
    var i = this, o = i.el, a = i.options, s = o.ownerDocument, l;
    if (t && !S && t.parentNode === o) {
      var u = _(t);
      if (Y = o, S = t, rt = S.parentNode, jt = S.nextSibling, de = t, ae = a.group, T.dragged = S, Mt = {
        target: S,
        clientX: (r || n).clientX,
        clientY: (r || n).clientY
      }, rn = Mt.clientX - u.left, on = Mt.clientY - u.top, this._lastX = (r || n).clientX, this._lastY = (r || n).clientY, S.style["will-change"] = "all", l = function() {
        if (ft("delayEnded", i, {
          evt: n
        }), T.eventCanceled) {
          i._onDrop();
          return;
        }
        i._disableDelayedDragEvents(), !qe && i.nativeDraggable && (S.draggable = !0), i._triggerDragStart(n, r), ct({
          sortable: i,
          name: "choose",
          originalEvent: n
        }), k(S, a.chosenClass, !0);
      }, a.ignore.split(",").forEach(function(c) {
        pn(S, c.trim(), je);
      }), $(s, "dragover", Pt), $(s, "mousemove", Pt), $(s, "touchmove", Pt), $(s, "mouseup", i._onDrop), $(s, "touchend", i._onDrop), $(s, "touchcancel", i._onDrop), qe && this.nativeDraggable && (this.options.touchStartThreshold = 4, S.draggable = !0), ft("delayStart", this, {
        evt: n
      }), a.delay && (!a.delayOnTouchOnly || r) && (!this.nativeDraggable || !(ee || Ct))) {
        if (T.eventCanceled) {
          this._onDrop();
          return;
        }
        $(s, "mouseup", i._disableDelayedDrag), $(s, "touchend", i._disableDelayedDrag), $(s, "touchcancel", i._disableDelayedDrag), $(s, "mousemove", i._delayedDragTouchMoveHandler), $(s, "touchmove", i._delayedDragTouchMoveHandler), a.supportPointer && $(s, "pointermove", i._delayedDragTouchMoveHandler), i._dragStartTimer = setTimeout(l, a.delay);
      } else
        l();
    }
  },
  _delayedDragTouchMoveHandler: function(n) {
    var r = n.touches ? n.touches[0] : n;
    Math.max(Math.abs(r.clientX - this._lastX), Math.abs(r.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
  },
  _disableDelayedDrag: function() {
    S && je(S), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function() {
    var n = this.el.ownerDocument;
    R(n, "mouseup", this._disableDelayedDrag), R(n, "touchend", this._disableDelayedDrag), R(n, "touchcancel", this._disableDelayedDrag), R(n, "mousemove", this._delayedDragTouchMoveHandler), R(n, "touchmove", this._delayedDragTouchMoveHandler), R(n, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function(n, r) {
    r = r || n.pointerType == "touch" && n, !this.nativeDraggable || r ? this.options.supportPointer ? $(document, "pointermove", this._onTouchMove) : r ? $(document, "touchmove", this._onTouchMove) : $(document, "mousemove", this._onTouchMove) : ($(S, "dragend", this), $(Y, "dragstart", this._onDragStart));
    try {
      document.selection ? pe(function() {
        document.selection.empty();
      }) : window.getSelection().removeAllRanges();
    } catch {
    }
  },
  _dragStarted: function(n, r) {
    if (Vt = !1, Y && S) {
      ft("dragStarted", this, {
        evt: r
      }), this.nativeDraggable && $(document, "dragover", tr);
      var t = this.options;
      !n && k(S, t.dragClass, !1), k(S, t.ghostClass, !0), T.active = this, n && this._appendGhost(), ct({
        sortable: this,
        name: "start",
        originalEvent: r
      });
    } else
      this._nulling();
  },
  _emulateDragOver: function() {
    if (yt) {
      this._lastX = yt.clientX, this._lastY = yt.clientY, xn();
      for (var n = document.elementFromPoint(yt.clientX, yt.clientY), r = n; n && n.shadowRoot && (n = n.shadowRoot.elementFromPoint(yt.clientX, yt.clientY), n !== r); )
        r = n;
      if (S.parentNode[ut]._isOutsideThisEl(n), r)
        do {
          if (r[ut]) {
            var t = void 0;
            if (t = r[ut]._onDragOver({
              clientX: yt.clientX,
              clientY: yt.clientY,
              target: n,
              rootEl: r
            }), t && !this.options.dragoverBubble)
              break;
          }
          n = r;
        } while (r = r.parentNode);
      Sn();
    }
  },
  _onTouchMove: function(n) {
    if (Mt) {
      var r = this.options, t = r.fallbackTolerance, i = r.fallbackOffset, o = n.touches ? n.touches[0] : n, a = M && Lt(M, !0), s = M && a && a.a, l = M && a && a.d, u = le && lt && en(lt), c = (o.clientX - Mt.clientX + i.x) / (s || 1) + (u ? u[0] - Me[0] : 0) / (s || 1), f = (o.clientY - Mt.clientY + i.y) / (l || 1) + (u ? u[1] - Me[1] : 0) / (l || 1);
      if (!T.active && !Vt) {
        if (t && Math.max(Math.abs(o.clientX - this._lastX), Math.abs(o.clientY - this._lastY)) < t)
          return;
        this._onDragStart(n, !0);
      }
      if (M) {
        a ? (a.e += c - (Fe || 0), a.f += f - (Ne || 0)) : a = {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: c,
          f
        };
        var p = "matrix(".concat(a.a, ",").concat(a.b, ",").concat(a.c, ",").concat(a.d, ",").concat(a.e, ",").concat(a.f, ")");
        w(M, "webkitTransform", p), w(M, "mozTransform", p), w(M, "msTransform", p), w(M, "transform", p), Fe = c, Ne = f, yt = o;
      }
      n.cancelable && n.preventDefault();
    }
  },
  _appendGhost: function() {
    if (!M) {
      var n = this.options.fallbackOnBody ? document.body : Y, r = _(S, !0, le, !0, n), t = this.options;
      if (le) {
        for (lt = n; w(lt, "position") === "static" && w(lt, "transform") === "none" && lt !== document; )
          lt = lt.parentNode;
        lt !== document.body && lt !== document.documentElement ? (lt === document && (lt = wt()), r.top += lt.scrollTop, r.left += lt.scrollLeft) : lt = wt(), Me = en(lt);
      }
      M = S.cloneNode(!0), k(M, t.ghostClass, !1), k(M, t.fallbackClass, !0), k(M, t.dragClass, !0), w(M, "transition", ""), w(M, "transform", ""), w(M, "box-sizing", "border-box"), w(M, "margin", 0), w(M, "top", r.top), w(M, "left", r.left), w(M, "width", r.width), w(M, "height", r.height), w(M, "opacity", "0.8"), w(M, "position", le ? "absolute" : "fixed"), w(M, "zIndex", "100000"), w(M, "pointerEvents", "none"), T.ghost = M, n.appendChild(M), w(M, "transform-origin", rn / parseInt(M.style.width) * 100 + "% " + on / parseInt(M.style.height) * 100 + "%");
    }
  },
  _onDragStart: function(n, r) {
    var t = this, i = n.dataTransfer, o = t.options;
    if (ft("dragStart", this, {
      evt: n
    }), T.eventCanceled) {
      this._onDrop();
      return;
    }
    ft("setupClone", this), T.eventCanceled || (Q = Ye(S), Q.draggable = !1, Q.style["will-change"] = "", this._hideClone(), k(Q, this.options.chosenClass, !1), T.clone = Q), t.cloneId = pe(function() {
      ft("clone", t), !T.eventCanceled && (t.options.removeCloneOnHide || Y.insertBefore(Q, S), t._hideClone(), ct({
        sortable: t,
        name: "clone"
      }));
    }), !r && k(S, o.dragClass, !0), r ? (be = !0, t._loopId = setInterval(t._emulateDragOver, 50)) : (R(document, "mouseup", t._onDrop), R(document, "touchend", t._onDrop), R(document, "touchcancel", t._onDrop), i && (i.effectAllowed = "move", o.setData && o.setData.call(t, i, S)), $(document, "drop", t), w(S, "transform", "translateZ(0)")), Vt = !0, t._dragStartId = pe(t._dragStarted.bind(t, r, n)), $(document, "selectstart", t), Yt = !0, Ve && w(document.body, "user-select", "none");
  },
  // Returns true - if no further action is needed (either inserted or another condition)
  _onDragOver: function(n) {
    var r = this.el, t = n.target, i, o, a, s = this.options, l = s.group, u = T.active, c = ae === l, f = s.sort, p = at || u, g, d = this, h = !1;
    if (Ue) return;
    function v(X, dt) {
      ft(X, d, Nt({
        evt: n,
        isOwner: c,
        axis: g ? "vertical" : "horizontal",
        revert: a,
        dragRect: i,
        targetRect: o,
        canSort: f,
        fromSortable: p,
        target: t,
        completed: D,
        onMove: function(it, y) {
          return Pe(Y, r, S, i, it, _(it), n, y);
        },
        changed: O
      }, dt));
    }
    function x() {
      v("dragOverAnimationCapture"), d.captureAnimationState(), d !== p && p.captureAnimationState();
    }
    function D(X) {
      return v("dragOverCompleted", {
        insertion: X
      }), X && (c ? u._hideClone() : u._showClone(d), d !== p && (k(S, at ? at.options.ghostClass : u.options.ghostClass, !1), k(S, s.ghostClass, !0)), at !== d && d !== T.active ? at = d : d === T.active && at && (at = null), p === d && (d._ignoreWhileAnimating = t), d.animateAll(function() {
        v("dragOverAnimationComplete"), d._ignoreWhileAnimating = null;
      }), d !== p && (p.animateAll(), p._ignoreWhileAnimating = null)), (t === S && !S.animated || t === r && !t.animated) && ($t = null), !s.dragoverBubble && !n.rootEl && t !== document && (S.parentNode[ut]._isOutsideThisEl(n.target), !X && Pt(n)), !s.dragoverBubble && n.stopPropagation && n.stopPropagation(), h = !0;
    }
    function O() {
      gt = q(S), Tt = q(S, s.draggable), ct({
        sortable: d,
        name: "change",
        toEl: r,
        newIndex: gt,
        newDraggableIndex: Tt,
        originalEvent: n
      });
    }
    if (n.preventDefault !== void 0 && n.cancelable && n.preventDefault(), t = St(t, s.draggable, r, !0), v("dragOver"), T.eventCanceled) return h;
    if (S.contains(n.target) || t.animated && t.animatingX && t.animatingY || d._ignoreWhileAnimating === t)
      return D(!1);
    if (be = !1, u && !s.disabled && (c ? f || (a = !Y.contains(S)) : at === this || (this.lastPutMode = ae.checkPull(this, u, S, n)) && l.checkPut(this, u, S, n))) {
      if (g = this._getDirection(n, t) === "vertical", i = _(S), v("dragOverValid"), T.eventCanceled) return h;
      if (a)
        return rt = Y, x(), this._hideClone(), v("revert"), T.eventCanceled || (jt ? Y.insertBefore(S, jt) : Y.appendChild(S)), D(!0);
      var C = Xe(r, s.draggable);
      if (!C || rr(n, g, this) && !C.animated) {
        if (C === S)
          return D(!1);
        if (C && r === n.target && (t = C), t && (o = _(t)), Pe(Y, r, S, i, t, o, n, !!t) !== !1)
          return x(), r.appendChild(S), rt = r, O(), D(!0);
      } else if (t.parentNode === r) {
        o = _(t);
        var L = 0, V, U = S.parentNode !== r, I = !qn(S.animated && S.toRect || i, t.animated && t.toRect || o, g), N = g ? "top" : "left", A = tn(t, "top", "top") || tn(S, "top", "top"), B = A ? A.scrollTop : void 0;
        $t !== t && (V = o[N], _t = !1, se = !I && s.invertSwap || U), L = or(n, t, o, g, I ? 1 : s.swapThreshold, s.invertedSwapThreshold == null ? s.swapThreshold : s.invertedSwapThreshold, se, $t === t);
        var J;
        if (L !== 0) {
          var nt = q(S);
          do
            nt -= L, J = rt.children[nt];
          while (J && (w(J, "display") === "none" || J === M));
        }
        if (L === 0 || J === t)
          return D(!1);
        $t = t, qt = L;
        var tt = t.nextElementSibling, H = !1;
        H = L === 1;
        var z = Pe(Y, r, S, i, t, o, n, H);
        if (z !== !1)
          return (z === 1 || z === -1) && (H = z === 1), Ue = !0, setTimeout(nr, 30), x(), H && !tt ? r.appendChild(S) : t.parentNode.insertBefore(S, H ? tt : t), A && vn(A, 0, B - A.scrollTop), rt = S.parentNode, V !== void 0 && !se && (he = Math.abs(V - _(t)[N])), O(), D(!0);
      }
      if (r.contains(S))
        return D(!1);
    }
    return !1;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function() {
    R(document, "mousemove", this._onTouchMove), R(document, "touchmove", this._onTouchMove), R(document, "pointermove", this._onTouchMove), R(document, "dragover", Pt), R(document, "mousemove", Pt), R(document, "touchmove", Pt);
  },
  _offUpEvents: function() {
    var n = this.el.ownerDocument;
    R(n, "mouseup", this._onDrop), R(n, "touchend", this._onDrop), R(n, "pointerup", this._onDrop), R(n, "touchcancel", this._onDrop), R(document, "selectstart", this);
  },
  _onDrop: function(n) {
    var r = this.el, t = this.options;
    if (gt = q(S), Tt = q(S, t.draggable), ft("drop", this, {
      evt: n
    }), rt = S && S.parentNode, gt = q(S), Tt = q(S, t.draggable), T.eventCanceled) {
      this._nulling();
      return;
    }
    Vt = !1, se = !1, _t = !1, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), ze(this.cloneId), ze(this._dragStartId), this.nativeDraggable && (R(document, "drop", this), R(r, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), Ve && w(document.body, "user-select", ""), w(S, "transform", ""), n && (Yt && (n.cancelable && n.preventDefault(), !t.dropBubble && n.stopPropagation()), M && M.parentNode && M.parentNode.removeChild(M), (Y === rt || at && at.lastPutMode !== "clone") && Q && Q.parentNode && Q.parentNode.removeChild(Q), S && (this.nativeDraggable && R(S, "dragend", this), je(S), S.style["will-change"] = "", Yt && !Vt && k(S, at ? at.options.ghostClass : this.options.ghostClass, !1), k(S, this.options.chosenClass, !1), ct({
      sortable: this,
      name: "unchoose",
      toEl: rt,
      newIndex: null,
      newDraggableIndex: null,
      originalEvent: n
    }), Y !== rt ? (gt >= 0 && (ct({
      rootEl: rt,
      name: "add",
      toEl: rt,
      fromEl: Y,
      originalEvent: n
    }), ct({
      sortable: this,
      name: "remove",
      toEl: rt,
      originalEvent: n
    }), ct({
      rootEl: rt,
      name: "sort",
      toEl: rt,
      fromEl: Y,
      originalEvent: n
    }), ct({
      sortable: this,
      name: "sort",
      toEl: rt,
      originalEvent: n
    })), at && at.save()) : gt !== Ut && gt >= 0 && (ct({
      sortable: this,
      name: "update",
      toEl: rt,
      originalEvent: n
    }), ct({
      sortable: this,
      name: "sort",
      toEl: rt,
      originalEvent: n
    })), T.active && ((gt == null || gt === -1) && (gt = Ut, Tt = Qt), ct({
      sortable: this,
      name: "end",
      toEl: rt,
      originalEvent: n
    }), this.save()))), this._nulling();
  },
  _nulling: function() {
    ft("nulling", this), Y = S = rt = M = jt = Q = de = At = Mt = yt = Yt = gt = Tt = Ut = Qt = $t = qt = at = ae = T.dragged = T.ghost = T.clone = T.active = null, xe.forEach(function(n) {
      n.checked = !0;
    }), xe.length = Fe = Ne = 0;
  },
  handleEvent: function(n) {
    switch (n.type) {
      case "drop":
      case "dragend":
        this._onDrop(n);
        break;
      case "dragenter":
      case "dragover":
        S && (this._onDragOver(n), er(n));
        break;
      case "selectstart":
        n.preventDefault();
        break;
    }
  },
  /**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
  toArray: function() {
    for (var n = [], r, t = this.el.children, i = 0, o = t.length, a = this.options; i < o; i++)
      r = t[i], St(r, a.draggable, this.el, !1) && n.push(r.getAttribute(a.dataIdAttr) || ar(r));
    return n;
  },
  /**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
  sort: function(n) {
    var r = {}, t = this.el;
    this.toArray().forEach(function(i, o) {
      var a = t.children[o];
      St(a, this.options.draggable, t, !1) && (r[i] = a);
    }, this), n.forEach(function(i) {
      r[i] && (t.removeChild(r[i]), t.appendChild(r[i]));
    });
  },
  /**
   * Save the current sorting
   */
  save: function() {
    var n = this.options.store;
    n && n.set && n.set(this);
  },
  /**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
  closest: function(n, r) {
    return St(n, r || this.options.draggable, this.el, !1);
  },
  /**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
  option: function(n, r) {
    var t = this.options;
    if (r === void 0)
      return t[n];
    var i = ne.modifyOption(this, n, r);
    typeof i < "u" ? t[n] = i : t[n] = r, n === "group" && yn(t);
  },
  /**
   * Destroy
   */
  destroy: function() {
    ft("destroy", this);
    var n = this.el;
    n[ut] = null, R(n, "mousedown", this._onTapStart), R(n, "touchstart", this._onTapStart), R(n, "pointerdown", this._onTapStart), this.nativeDraggable && (R(n, "dragover", this), R(n, "dragenter", this)), Array.prototype.forEach.call(n.querySelectorAll("[draggable]"), function(r) {
      r.removeAttribute("draggable");
    }), this._onDrop(), this._disableDelayedDragEvents(), ye.splice(ye.indexOf(this.el), 1), this.el = n = null;
  },
  _hideClone: function() {
    if (!At) {
      if (ft("hideClone", this), T.eventCanceled) return;
      w(Q, "display", "none"), this.options.removeCloneOnHide && Q.parentNode && Q.parentNode.removeChild(Q), At = !0;
    }
  },
  _showClone: function(n) {
    if (n.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (At) {
      if (ft("showClone", this), T.eventCanceled) return;
      Y.contains(S) && !this.options.group.revertClone ? Y.insertBefore(Q, S) : jt ? Y.insertBefore(Q, jt) : Y.appendChild(Q), this.options.group.revertClone && this.animate(S, Q), w(Q, "display", ""), At = !1;
    }
  }
};
function er(e) {
  e.dataTransfer && (e.dataTransfer.dropEffect = "move"), e.cancelable && e.preventDefault();
}
function Pe(e, n, r, t, i, o, a, s) {
  var l, u = e[ut], c = u.options.onMove, f;
  return window.CustomEvent && !Ct && !ee ? l = new CustomEvent("move", {
    bubbles: !0,
    cancelable: !0
  }) : (l = document.createEvent("Event"), l.initEvent("move", !0, !0)), l.to = n, l.from = e, l.dragged = r, l.draggedRect = t, l.related = i || n, l.relatedRect = o || _(n), l.willInsertAfter = s, l.originalEvent = a, e.dispatchEvent(l), c && (f = c.call(u, l, a)), f;
}
function je(e) {
  e.draggable = !1;
}
function nr() {
  Ue = !1;
}
function rr(e, n, r) {
  var t = _(Xe(r.el, r.options.draggable)), i = 10;
  return n ? e.clientX > t.right + i || e.clientX <= t.right && e.clientY > t.bottom && e.clientX >= t.left : e.clientX > t.right && e.clientY > t.top || e.clientX <= t.right && e.clientY > t.bottom + i;
}
function or(e, n, r, t, i, o, a, s) {
  var l = t ? e.clientY : e.clientX, u = t ? r.height : r.width, c = t ? r.top : r.left, f = t ? r.bottom : r.right, p = !1;
  if (!a) {
    if (s && he < u * i) {
      if (!_t && (qt === 1 ? l > c + u * o / 2 : l < f - u * o / 2) && (_t = !0), _t)
        p = !0;
      else if (qt === 1 ? l < c + he : l > f - he)
        return -qt;
    } else if (l > c + u * (1 - i) / 2 && l < f - u * (1 - i) / 2)
      return ir(n);
  }
  return p = p || a, p && (l < c + u * o / 2 || l > f - u * o / 2) ? l > c + u / 2 ? 1 : -1 : 0;
}
function ir(e) {
  return q(S) < q(e) ? 1 : -1;
}
function ar(e) {
  for (var n = e.tagName + e.className + e.src + e.href + e.textContent, r = n.length, t = 0; r--; )
    t += n.charCodeAt(r);
  return t.toString(36);
}
function sr(e) {
  xe.length = 0;
  for (var n = e.getElementsByTagName("input"), r = n.length; r--; ) {
    var t = n[r];
    t.checked && xe.push(t);
  }
}
function pe(e) {
  return setTimeout(e, 0);
}
function ze(e) {
  return clearTimeout(e);
}
Ee && $(document, "touchmove", function(e) {
  (T.active || Vt) && e.cancelable && e.preventDefault();
});
T.utils = {
  on: $,
  off: R,
  css: w,
  find: pn,
  is: function(n, r) {
    return !!St(n, r, n, !1);
  },
  extend: Xn,
  throttle: gn,
  closest: St,
  toggleClass: k,
  clone: Ye,
  index: q,
  nextTick: pe,
  cancelNextTick: ze,
  detectDirection: bn,
  getChild: me
};
T.get = function(e) {
  return e[ut];
};
T.mount = function() {
  for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
    n[r] = arguments[r];
  n[0].constructor === Array && (n = n[0]), n.forEach(function(t) {
    if (!t.prototype || !t.prototype.constructor)
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t));
    t.utils && (T.utils = Nt({}, T.utils, t.utils)), ne.mount(t);
  });
};
T.create = function(e, n) {
  return new T(e, n);
};
T.version = Gn;
var ot = [], kt, Ge, He = !1, Re, Le, Se, Zt;
function lr() {
  function e() {
    this.defaults = {
      scroll: !0,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: !0
    };
    for (var n in this)
      n.charAt(0) === "_" && typeof this[n] == "function" && (this[n] = this[n].bind(this));
  }
  return e.prototype = {
    dragStarted: function(r) {
      var t = r.originalEvent;
      this.sortable.nativeDraggable ? $(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? $(document, "pointermove", this._handleFallbackAutoScroll) : t.touches ? $(document, "touchmove", this._handleFallbackAutoScroll) : $(document, "mousemove", this._handleFallbackAutoScroll);
    },
    dragOverCompleted: function(r) {
      var t = r.originalEvent;
      !this.options.dragOverBubble && !t.rootEl && this._handleAutoScroll(t);
    },
    drop: function() {
      this.sortable.nativeDraggable ? R(document, "dragover", this._handleAutoScroll) : (R(document, "pointermove", this._handleFallbackAutoScroll), R(document, "touchmove", this._handleFallbackAutoScroll), R(document, "mousemove", this._handleFallbackAutoScroll)), sn(), ge(), Yn();
    },
    nulling: function() {
      Se = Ge = kt = He = Zt = Re = Le = null, ot.length = 0;
    },
    _handleFallbackAutoScroll: function(r) {
      this._handleAutoScroll(r, !0);
    },
    _handleAutoScroll: function(r, t) {
      var i = this, o = (r.touches ? r.touches[0] : r).clientX, a = (r.touches ? r.touches[0] : r).clientY, s = document.elementFromPoint(o, a);
      if (Se = r, t || ee || Ct || Ve) {
        $e(r, this.options, s, t);
        var l = It(s, !0);
        He && (!Zt || o !== Re || a !== Le) && (Zt && sn(), Zt = setInterval(function() {
          var u = It(document.elementFromPoint(o, a), !0);
          u !== l && (l = u, ge()), $e(r, i.options, u, t);
        }, 10), Re = o, Le = a);
      } else {
        if (!this.options.bubbleScroll || It(s, !0) === wt()) {
          ge();
          return;
        }
        $e(r, this.options, It(s, !1), !1);
      }
    }
  }, bt(e, {
    pluginName: "scroll",
    initializeByDefault: !0
  });
}
function ge() {
  ot.forEach(function(e) {
    clearInterval(e.pid);
  }), ot = [];
}
function sn() {
  clearInterval(Zt);
}
var $e = gn(function(e, n, r, t) {
  if (n.scroll) {
    var i = (e.touches ? e.touches[0] : e).clientX, o = (e.touches ? e.touches[0] : e).clientY, a = n.scrollSensitivity, s = n.scrollSpeed, l = wt(), u = !1, c;
    Ge !== r && (Ge = r, ge(), kt = n.scroll, c = n.scrollFn, kt === !0 && (kt = It(r, !0)));
    var f = 0, p = kt;
    do {
      var g = p, d = _(g), h = d.top, v = d.bottom, x = d.left, D = d.right, O = d.width, C = d.height, L = void 0, V = void 0, U = g.scrollWidth, I = g.scrollHeight, N = w(g), A = g.scrollLeft, B = g.scrollTop;
      g === l ? (L = O < U && (N.overflowX === "auto" || N.overflowX === "scroll" || N.overflowX === "visible"), V = C < I && (N.overflowY === "auto" || N.overflowY === "scroll" || N.overflowY === "visible")) : (L = O < U && (N.overflowX === "auto" || N.overflowX === "scroll"), V = C < I && (N.overflowY === "auto" || N.overflowY === "scroll"));
      var J = L && (Math.abs(D - i) <= a && A + O < U) - (Math.abs(x - i) <= a && !!A), nt = V && (Math.abs(v - o) <= a && B + C < I) - (Math.abs(h - o) <= a && !!B);
      if (!ot[f])
        for (var tt = 0; tt <= f; tt++)
          ot[tt] || (ot[tt] = {});
      (ot[f].vx != J || ot[f].vy != nt || ot[f].el !== g) && (ot[f].el = g, ot[f].vx = J, ot[f].vy = nt, clearInterval(ot[f].pid), (J != 0 || nt != 0) && (u = !0, ot[f].pid = setInterval((function() {
        t && this.layer === 0 && T.active._onTouchMove(Se);
        var H = ot[this.layer].vy ? ot[this.layer].vy * s : 0, z = ot[this.layer].vx ? ot[this.layer].vx * s : 0;
        typeof c == "function" && c.call(T.dragged.parentNode[ut], z, H, e, Se, ot[this.layer].el) !== "continue" || vn(ot[this.layer].el, z, H);
      }).bind({
        layer: f
      }), 24))), f++;
    } while (n.bubbleScroll && p !== l && (p = It(p, !1)));
    He = u;
  }
}, 30), On = function(n) {
  var r = n.originalEvent, t = n.putSortable, i = n.dragEl, o = n.activeSortable, a = n.dispatchSortableEvent, s = n.hideGhostForTarget, l = n.unhideGhostForTarget;
  if (r) {
    var u = t || o;
    s();
    var c = r.changedTouches && r.changedTouches.length ? r.changedTouches[0] : r, f = document.elementFromPoint(c.clientX, c.clientY);
    l(), u && !u.el.contains(f) && (a("spill"), this.onSpill({
      dragEl: i,
      putSortable: t
    }));
  }
};
function ke() {
}
ke.prototype = {
  startIndex: null,
  dragStart: function(n) {
    var r = n.oldDraggableIndex;
    this.startIndex = r;
  },
  onSpill: function(n) {
    var r = n.dragEl, t = n.putSortable;
    this.sortable.captureAnimationState(), t && t.captureAnimationState();
    var i = me(this.sortable.el, this.startIndex, this.options);
    i ? this.sortable.el.insertBefore(r, i) : this.sortable.el.appendChild(r), this.sortable.animateAll(), t && t.animateAll();
  },
  drop: On
};
bt(ke, {
  pluginName: "revertOnSpill"
});
function Ze() {
}
Ze.prototype = {
  onSpill: function(n) {
    var r = n.dragEl, t = n.putSortable, i = t || this.sortable;
    i.captureAnimationState(), r.parentNode && r.parentNode.removeChild(r), i.animateAll();
  },
  drop: On
};
bt(Ze, {
  pluginName: "removeOnSpill"
});
var mt;
function ur() {
  function e() {
    this.defaults = {
      swapClass: "sortable-swap-highlight"
    };
  }
  return e.prototype = {
    dragStart: function(r) {
      var t = r.dragEl;
      mt = t;
    },
    dragOverValid: function(r) {
      var t = r.completed, i = r.target, o = r.onMove, a = r.activeSortable, s = r.changed, l = r.cancel;
      if (a.options.swap) {
        var u = this.sortable.el, c = this.options;
        if (i && i !== u) {
          var f = mt;
          o(i) !== !1 ? (k(i, c.swapClass, !0), mt = i) : mt = null, f && f !== mt && k(f, c.swapClass, !1);
        }
        s(), t(!0), l();
      }
    },
    drop: function(r) {
      var t = r.activeSortable, i = r.putSortable, o = r.dragEl, a = i || this.sortable, s = this.options;
      mt && k(mt, s.swapClass, !1), mt && (s.swap || i && i.options.swap) && o !== mt && (a.captureAnimationState(), a !== t && t.captureAnimationState(), cr(o, mt), a.animateAll(), a !== t && t.animateAll());
    },
    nulling: function() {
      mt = null;
    }
  }, bt(e, {
    pluginName: "swap",
    eventProperties: function() {
      return {
        swapItem: mt
      };
    }
  });
}
function cr(e, n) {
  var r = e.parentNode, t = n.parentNode, i, o;
  !r || !t || r.isEqualNode(n) || t.isEqualNode(e) || (i = q(e), o = q(n), r.isEqualNode(t) && i < o && o++, r.insertBefore(n, r.children[i]), t.insertBefore(e, t.children[o]));
}
var F = [], pt = [], Ht, xt, Wt = !1, ht = !1, Bt = !1, W, Kt, ue;
function fr() {
  function e(n) {
    for (var r in this)
      r.charAt(0) === "_" && typeof this[r] == "function" && (this[r] = this[r].bind(this));
    n.options.supportPointer ? $(document, "pointerup", this._deselectMultiDrag) : ($(document, "mouseup", this._deselectMultiDrag), $(document, "touchend", this._deselectMultiDrag)), $(document, "keydown", this._checkKeyDown), $(document, "keyup", this._checkKeyUp), this.defaults = {
      selectedClass: "sortable-selected",
      multiDragKey: null,
      setData: function(i, o) {
        var a = "";
        F.length && xt === n ? F.forEach(function(s, l) {
          a += (l ? ", " : "") + s.textContent;
        }) : a = o.textContent, i.setData("Text", a);
      }
    };
  }
  return e.prototype = {
    multiDragKeyDown: !1,
    isMultiDrag: !1,
    delayStartGlobal: function(r) {
      var t = r.dragEl;
      W = t;
    },
    delayEnded: function() {
      this.isMultiDrag = ~F.indexOf(W);
    },
    setupClone: function(r) {
      var t = r.sortable, i = r.cancel;
      if (this.isMultiDrag) {
        for (var o = 0; o < F.length; o++)
          pt.push(Ye(F[o])), pt[o].sortableIndex = F[o].sortableIndex, pt[o].draggable = !1, pt[o].style["will-change"] = "", k(pt[o], this.options.selectedClass, !1), F[o] === W && k(pt[o], this.options.chosenClass, !1);
        t._hideClone(), i();
      }
    },
    clone: function(r) {
      var t = r.sortable, i = r.rootEl, o = r.dispatchSortableEvent, a = r.cancel;
      this.isMultiDrag && (this.options.removeCloneOnHide || F.length && xt === t && (ln(!0, i), o("clone"), a()));
    },
    showClone: function(r) {
      var t = r.cloneNowShown, i = r.rootEl, o = r.cancel;
      this.isMultiDrag && (ln(!1, i), pt.forEach(function(a) {
        w(a, "display", "");
      }), t(), ue = !1, o());
    },
    hideClone: function(r) {
      var t = this;
      r.sortable;
      var i = r.cloneNowHidden, o = r.cancel;
      this.isMultiDrag && (pt.forEach(function(a) {
        w(a, "display", "none"), t.options.removeCloneOnHide && a.parentNode && a.parentNode.removeChild(a);
      }), i(), ue = !0, o());
    },
    dragStartGlobal: function(r) {
      r.sortable, !this.isMultiDrag && xt && xt.multiDrag._deselectMultiDrag(), F.forEach(function(t) {
        t.sortableIndex = q(t);
      }), F = F.sort(function(t, i) {
        return t.sortableIndex - i.sortableIndex;
      }), Bt = !0;
    },
    dragStarted: function(r) {
      var t = this, i = r.sortable;
      if (this.isMultiDrag) {
        if (this.options.sort && (i.captureAnimationState(), this.options.animation)) {
          F.forEach(function(a) {
            a !== W && w(a, "position", "absolute");
          });
          var o = _(W, !1, !0, !0);
          F.forEach(function(a) {
            a !== W && nn(a, o);
          }), ht = !0, Wt = !0;
        }
        i.animateAll(function() {
          ht = !1, Wt = !1, t.options.animation && F.forEach(function(a) {
            Ae(a);
          }), t.options.sort && ce();
        });
      }
    },
    dragOver: function(r) {
      var t = r.target, i = r.completed, o = r.cancel;
      ht && ~F.indexOf(t) && (i(!1), o());
    },
    revert: function(r) {
      var t = r.fromSortable, i = r.rootEl, o = r.sortable, a = r.dragRect;
      F.length > 1 && (F.forEach(function(s) {
        o.addAnimationState({
          target: s,
          rect: ht ? _(s) : a
        }), Ae(s), s.fromRect = a, t.removeAnimationState(s);
      }), ht = !1, dr(!this.options.removeCloneOnHide, i));
    },
    dragOverCompleted: function(r) {
      var t = r.sortable, i = r.isOwner, o = r.insertion, a = r.activeSortable, s = r.parentEl, l = r.putSortable, u = this.options;
      if (o) {
        if (i && a._hideClone(), Wt = !1, u.animation && F.length > 1 && (ht || !i && !a.options.sort && !l)) {
          var c = _(W, !1, !0, !0);
          F.forEach(function(p) {
            p !== W && (nn(p, c), s.appendChild(p));
          }), ht = !0;
        }
        if (!i)
          if (ht || ce(), F.length > 1) {
            var f = ue;
            a._showClone(t), a.options.animation && !ue && f && pt.forEach(function(p) {
              a.addAnimationState({
                target: p,
                rect: Kt
              }), p.fromRect = Kt, p.thisAnimationDuration = null;
            });
          } else
            a._showClone(t);
      }
    },
    dragOverAnimationCapture: function(r) {
      var t = r.dragRect, i = r.isOwner, o = r.activeSortable;
      if (F.forEach(function(s) {
        s.thisAnimationDuration = null;
      }), o.options.animation && !i && o.multiDrag.isMultiDrag) {
        Kt = bt({}, t);
        var a = Lt(W, !0);
        Kt.top -= a.f, Kt.left -= a.e;
      }
    },
    dragOverAnimationComplete: function() {
      ht && (ht = !1, ce());
    },
    drop: function(r) {
      var t = r.originalEvent, i = r.rootEl, o = r.parentEl, a = r.sortable, s = r.dispatchSortableEvent, l = r.oldIndex, u = r.putSortable, c = u || this.sortable;
      if (t) {
        var f = this.options, p = o.children;
        if (!Bt)
          if (f.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(), k(W, f.selectedClass, !~F.indexOf(W)), ~F.indexOf(W))
            F.splice(F.indexOf(W), 1), Ht = null, Xt({
              sortable: a,
              rootEl: i,
              name: "deselect",
              targetEl: W,
              originalEvt: t
            });
          else {
            if (F.push(W), Xt({
              sortable: a,
              rootEl: i,
              name: "select",
              targetEl: W,
              originalEvt: t
            }), t.shiftKey && Ht && a.el.contains(Ht)) {
              var g = q(Ht), d = q(W);
              if (~g && ~d && g !== d) {
                var h, v;
                for (d > g ? (v = g, h = d) : (v = d, h = g + 1); v < h; v++)
                  ~F.indexOf(p[v]) || (k(p[v], f.selectedClass, !0), F.push(p[v]), Xt({
                    sortable: a,
                    rootEl: i,
                    name: "select",
                    targetEl: p[v],
                    originalEvt: t
                  }));
              }
            } else
              Ht = W;
            xt = c;
          }
        if (Bt && this.isMultiDrag) {
          if ((o[ut].options.sort || o !== i) && F.length > 1) {
            var x = _(W), D = q(W, ":not(." + this.options.selectedClass + ")");
            if (!Wt && f.animation && (W.thisAnimationDuration = null), c.captureAnimationState(), !Wt && (f.animation && (W.fromRect = x, F.forEach(function(C) {
              if (C.thisAnimationDuration = null, C !== W) {
                var L = ht ? _(C) : x;
                C.fromRect = L, c.addAnimationState({
                  target: C,
                  rect: L
                });
              }
            })), ce(), F.forEach(function(C) {
              p[D] ? o.insertBefore(C, p[D]) : o.appendChild(C), D++;
            }), l === q(W))) {
              var O = !1;
              F.forEach(function(C) {
                if (C.sortableIndex !== q(C)) {
                  O = !0;
                  return;
                }
              }), O && s("update");
            }
            F.forEach(function(C) {
              Ae(C);
            }), c.animateAll();
          }
          xt = c;
        }
        (i === o || u && u.lastPutMode !== "clone") && pt.forEach(function(C) {
          C.parentNode && C.parentNode.removeChild(C);
        });
      }
    },
    nullingGlobal: function() {
      this.isMultiDrag = Bt = !1, pt.length = 0;
    },
    destroyGlobal: function() {
      this._deselectMultiDrag(), R(document, "pointerup", this._deselectMultiDrag), R(document, "mouseup", this._deselectMultiDrag), R(document, "touchend", this._deselectMultiDrag), R(document, "keydown", this._checkKeyDown), R(document, "keyup", this._checkKeyUp);
    },
    _deselectMultiDrag: function(r) {
      if (!(typeof Bt < "u" && Bt) && xt === this.sortable && !(r && St(r.target, this.options.draggable, this.sortable.el, !1)) && !(r && r.button !== 0))
        for (; F.length; ) {
          var t = F[0];
          k(t, this.options.selectedClass, !1), F.shift(), Xt({
            sortable: this.sortable,
            rootEl: this.sortable.el,
            name: "deselect",
            targetEl: t,
            originalEvt: r
          });
        }
    },
    _checkKeyDown: function(r) {
      r.key === this.options.multiDragKey && (this.multiDragKeyDown = !0);
    },
    _checkKeyUp: function(r) {
      r.key === this.options.multiDragKey && (this.multiDragKeyDown = !1);
    }
  }, bt(e, {
    // Static methods & properties
    pluginName: "multiDrag",
    utils: {
      /**
       * Selects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be selected
       */
      select: function(r) {
        var t = r.parentNode[ut];
        !t || !t.options.multiDrag || ~F.indexOf(r) || (xt && xt !== t && (xt.multiDrag._deselectMultiDrag(), xt = t), k(r, t.options.selectedClass, !0), F.push(r));
      },
      /**
       * Deselects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be deselected
       */
      deselect: function(r) {
        var t = r.parentNode[ut], i = F.indexOf(r);
        !t || !t.options.multiDrag || !~i || (k(r, t.options.selectedClass, !1), F.splice(i, 1));
      }
    },
    eventProperties: function() {
      var r = this, t = [], i = [];
      return F.forEach(function(o) {
        t.push({
          multiDragElement: o,
          index: o.sortableIndex
        });
        var a;
        ht && o !== W ? a = -1 : ht ? a = q(o, ":not(." + r.options.selectedClass + ")") : a = q(o), i.push({
          multiDragElement: o,
          index: a
        });
      }), {
        items: Bn(F),
        clones: [].concat(pt),
        oldIndicies: t,
        newIndicies: i
      };
    },
    optionListeners: {
      multiDragKey: function(r) {
        return r = r.toLowerCase(), r === "ctrl" ? r = "Control" : r.length > 1 && (r = r.charAt(0).toUpperCase() + r.substr(1)), r;
      }
    }
  });
}
function dr(e, n) {
  F.forEach(function(r, t) {
    var i = n.children[r.sortableIndex + (e ? Number(t) : 0)];
    i ? n.insertBefore(r, i) : n.appendChild(r);
  });
}
function ln(e, n) {
  pt.forEach(function(r, t) {
    var i = n.children[r.sortableIndex + (e ? Number(t) : 0)];
    i ? n.insertBefore(r, i) : n.appendChild(r);
  });
}
function ce() {
  F.forEach(function(e) {
    e !== W && e.parentNode && e.parentNode.removeChild(e);
  });
}
T.mount(new lr());
T.mount(Ze, ke);
const hr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MultiDrag: fr,
  Sortable: T,
  Swap: ur,
  default: T
}, Symbol.toStringTag, { value: "Module" })), pr = /* @__PURE__ */ jn(hr);
(function(e, n) {
  (function(t, i) {
    e.exports = i(pr);
  })(typeof self < "u" ? self : Mn, function(r) {
    return (
      /******/
      function(t) {
        var i = {};
        function o(a) {
          if (i[a])
            return i[a].exports;
          var s = i[a] = {
            /******/
            i: a,
            /******/
            l: !1,
            /******/
            exports: {}
            /******/
          };
          return t[a].call(s.exports, s, s.exports, o), s.l = !0, s.exports;
        }
        return o.m = t, o.c = i, o.d = function(a, s, l) {
          o.o(a, s) || Object.defineProperty(a, s, { enumerable: !0, get: l });
        }, o.r = function(a) {
          typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a, "__esModule", { value: !0 });
        }, o.t = function(a, s) {
          if (s & 1 && (a = o(a)), s & 8 || s & 4 && typeof a == "object" && a && a.__esModule) return a;
          var l = /* @__PURE__ */ Object.create(null);
          if (o.r(l), Object.defineProperty(l, "default", { enumerable: !0, value: a }), s & 2 && typeof a != "string") for (var u in a) o.d(l, u, (function(c) {
            return a[c];
          }).bind(null, u));
          return l;
        }, o.n = function(a) {
          var s = a && a.__esModule ? (
            /******/
            function() {
              return a.default;
            }
          ) : (
            /******/
            function() {
              return a;
            }
          );
          return o.d(s, "a", s), s;
        }, o.o = function(a, s) {
          return Object.prototype.hasOwnProperty.call(a, s);
        }, o.p = "", o(o.s = "fb15");
      }({
        /***/
        "01f9": (
          /***/
          function(t, i, o) {
            var a = o("2d00"), s = o("5ca1"), l = o("2aba"), u = o("32e9"), c = o("84f2"), f = o("41a0"), p = o("7f20"), g = o("38fd"), d = o("2b4c")("iterator"), h = !([].keys && "next" in [].keys()), v = "@@iterator", x = "keys", D = "values", O = function() {
              return this;
            };
            t.exports = function(C, L, V, U, I, N, A) {
              f(V, L, U);
              var B = function(b) {
                if (!h && b in H) return H[b];
                switch (b) {
                  case x:
                    return function() {
                      return new V(this, b);
                    };
                  case D:
                    return function() {
                      return new V(this, b);
                    };
                }
                return function() {
                  return new V(this, b);
                };
              }, J = L + " Iterator", nt = I == D, tt = !1, H = C.prototype, z = H[d] || H[v] || I && H[I], X = z || B(I), dt = I ? nt ? B("entries") : X : void 0, st = L == "Array" && H.entries || z, it, y, m;
              if (st && (m = g(st.call(new C())), m !== Object.prototype && m.next && (p(m, J, !0), !a && typeof m[d] != "function" && u(m, d, O))), nt && z && z.name !== D && (tt = !0, X = function() {
                return z.call(this);
              }), (!a || A) && (h || tt || !H[d]) && u(H, d, X), c[L] = X, c[J] = O, I)
                if (it = {
                  values: nt ? X : B(D),
                  keys: N ? X : B(x),
                  entries: dt
                }, A) for (y in it)
                  y in H || l(H, y, it[y]);
                else s(s.P + s.F * (h || tt), L, it);
              return it;
            };
          }
        ),
        /***/
        "02f4": (
          /***/
          function(t, i, o) {
            var a = o("4588"), s = o("be13");
            t.exports = function(l) {
              return function(u, c) {
                var f = String(s(u)), p = a(c), g = f.length, d, h;
                return p < 0 || p >= g ? l ? "" : void 0 : (d = f.charCodeAt(p), d < 55296 || d > 56319 || p + 1 === g || (h = f.charCodeAt(p + 1)) < 56320 || h > 57343 ? l ? f.charAt(p) : d : l ? f.slice(p, p + 2) : (d - 55296 << 10) + (h - 56320) + 65536);
              };
            };
          }
        ),
        /***/
        "0390": (
          /***/
          function(t, i, o) {
            var a = o("02f4")(!0);
            t.exports = function(s, l, u) {
              return l + (u ? a(s, l).length : 1);
            };
          }
        ),
        /***/
        "0bfb": (
          /***/
          function(t, i, o) {
            var a = o("cb7c");
            t.exports = function() {
              var s = a(this), l = "";
              return s.global && (l += "g"), s.ignoreCase && (l += "i"), s.multiline && (l += "m"), s.unicode && (l += "u"), s.sticky && (l += "y"), l;
            };
          }
        ),
        /***/
        "0d58": (
          /***/
          function(t, i, o) {
            var a = o("ce10"), s = o("e11e");
            t.exports = Object.keys || function(u) {
              return a(u, s);
            };
          }
        ),
        /***/
        1495: (
          /***/
          function(t, i, o) {
            var a = o("86cc"), s = o("cb7c"), l = o("0d58");
            t.exports = o("9e1e") ? Object.defineProperties : function(c, f) {
              s(c);
              for (var p = l(f), g = p.length, d = 0, h; g > d; ) a.f(c, h = p[d++], f[h]);
              return c;
            };
          }
        ),
        /***/
        "214f": (
          /***/
          function(t, i, o) {
            o("b0c5");
            var a = o("2aba"), s = o("32e9"), l = o("79e5"), u = o("be13"), c = o("2b4c"), f = o("520a"), p = c("species"), g = !l(function() {
              var h = /./;
              return h.exec = function() {
                var v = [];
                return v.groups = { a: "7" }, v;
              }, "".replace(h, "$<a>") !== "7";
            }), d = function() {
              var h = /(?:)/, v = h.exec;
              h.exec = function() {
                return v.apply(this, arguments);
              };
              var x = "ab".split(h);
              return x.length === 2 && x[0] === "a" && x[1] === "b";
            }();
            t.exports = function(h, v, x) {
              var D = c(h), O = !l(function() {
                var N = {};
                return N[D] = function() {
                  return 7;
                }, ""[h](N) != 7;
              }), C = O ? !l(function() {
                var N = !1, A = /a/;
                return A.exec = function() {
                  return N = !0, null;
                }, h === "split" && (A.constructor = {}, A.constructor[p] = function() {
                  return A;
                }), A[D](""), !N;
              }) : void 0;
              if (!O || !C || h === "replace" && !g || h === "split" && !d) {
                var L = /./[D], V = x(
                  u,
                  D,
                  ""[h],
                  function(A, B, J, nt, tt) {
                    return B.exec === f ? O && !tt ? { done: !0, value: L.call(B, J, nt) } : { done: !0, value: A.call(J, B, nt) } : { done: !1 };
                  }
                ), U = V[0], I = V[1];
                a(String.prototype, h, U), s(
                  RegExp.prototype,
                  D,
                  v == 2 ? function(N, A) {
                    return I.call(N, this, A);
                  } : function(N) {
                    return I.call(N, this);
                  }
                );
              }
            };
          }
        ),
        /***/
        "230e": (
          /***/
          function(t, i, o) {
            var a = o("d3f4"), s = o("7726").document, l = a(s) && a(s.createElement);
            t.exports = function(u) {
              return l ? s.createElement(u) : {};
            };
          }
        ),
        /***/
        "23c6": (
          /***/
          function(t, i, o) {
            var a = o("2d95"), s = o("2b4c")("toStringTag"), l = a(/* @__PURE__ */ function() {
              return arguments;
            }()) == "Arguments", u = function(c, f) {
              try {
                return c[f];
              } catch {
              }
            };
            t.exports = function(c) {
              var f, p, g;
              return c === void 0 ? "Undefined" : c === null ? "Null" : typeof (p = u(f = Object(c), s)) == "string" ? p : l ? a(f) : (g = a(f)) == "Object" && typeof f.callee == "function" ? "Arguments" : g;
            };
          }
        ),
        /***/
        2621: (
          /***/
          function(t, i) {
            i.f = Object.getOwnPropertySymbols;
          }
        ),
        /***/
        "2aba": (
          /***/
          function(t, i, o) {
            var a = o("7726"), s = o("32e9"), l = o("69a8"), u = o("ca5a")("src"), c = o("fa5b"), f = "toString", p = ("" + c).split(f);
            o("8378").inspectSource = function(g) {
              return c.call(g);
            }, (t.exports = function(g, d, h, v) {
              var x = typeof h == "function";
              x && (l(h, "name") || s(h, "name", d)), g[d] !== h && (x && (l(h, u) || s(h, u, g[d] ? "" + g[d] : p.join(String(d)))), g === a ? g[d] = h : v ? g[d] ? g[d] = h : s(g, d, h) : (delete g[d], s(g, d, h)));
            })(Function.prototype, f, function() {
              return typeof this == "function" && this[u] || c.call(this);
            });
          }
        ),
        /***/
        "2aeb": (
          /***/
          function(t, i, o) {
            var a = o("cb7c"), s = o("1495"), l = o("e11e"), u = o("613b")("IE_PROTO"), c = function() {
            }, f = "prototype", p = function() {
              var g = o("230e")("iframe"), d = l.length, h = "<", v = ">", x;
              for (g.style.display = "none", o("fab2").appendChild(g), g.src = "javascript:", x = g.contentWindow.document, x.open(), x.write(h + "script" + v + "document.F=Object" + h + "/script" + v), x.close(), p = x.F; d--; ) delete p[f][l[d]];
              return p();
            };
            t.exports = Object.create || function(d, h) {
              var v;
              return d !== null ? (c[f] = a(d), v = new c(), c[f] = null, v[u] = d) : v = p(), h === void 0 ? v : s(v, h);
            };
          }
        ),
        /***/
        "2b4c": (
          /***/
          function(t, i, o) {
            var a = o("5537")("wks"), s = o("ca5a"), l = o("7726").Symbol, u = typeof l == "function", c = t.exports = function(f) {
              return a[f] || (a[f] = u && l[f] || (u ? l : s)("Symbol." + f));
            };
            c.store = a;
          }
        ),
        /***/
        "2d00": (
          /***/
          function(t, i) {
            t.exports = !1;
          }
        ),
        /***/
        "2d95": (
          /***/
          function(t, i) {
            var o = {}.toString;
            t.exports = function(a) {
              return o.call(a).slice(8, -1);
            };
          }
        ),
        /***/
        "2fdb": (
          /***/
          function(t, i, o) {
            var a = o("5ca1"), s = o("d2c8"), l = "includes";
            a(a.P + a.F * o("5147")(l), "String", {
              includes: function(c) {
                return !!~s(this, c, l).indexOf(c, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
          }
        ),
        /***/
        "32e9": (
          /***/
          function(t, i, o) {
            var a = o("86cc"), s = o("4630");
            t.exports = o("9e1e") ? function(l, u, c) {
              return a.f(l, u, s(1, c));
            } : function(l, u, c) {
              return l[u] = c, l;
            };
          }
        ),
        /***/
        "38fd": (
          /***/
          function(t, i, o) {
            var a = o("69a8"), s = o("4bf8"), l = o("613b")("IE_PROTO"), u = Object.prototype;
            t.exports = Object.getPrototypeOf || function(c) {
              return c = s(c), a(c, l) ? c[l] : typeof c.constructor == "function" && c instanceof c.constructor ? c.constructor.prototype : c instanceof Object ? u : null;
            };
          }
        ),
        /***/
        "41a0": (
          /***/
          function(t, i, o) {
            var a = o("2aeb"), s = o("4630"), l = o("7f20"), u = {};
            o("32e9")(u, o("2b4c")("iterator"), function() {
              return this;
            }), t.exports = function(c, f, p) {
              c.prototype = a(u, { next: s(1, p) }), l(c, f + " Iterator");
            };
          }
        ),
        /***/
        "456d": (
          /***/
          function(t, i, o) {
            var a = o("4bf8"), s = o("0d58");
            o("5eda")("keys", function() {
              return function(u) {
                return s(a(u));
              };
            });
          }
        ),
        /***/
        4588: (
          /***/
          function(t, i) {
            var o = Math.ceil, a = Math.floor;
            t.exports = function(s) {
              return isNaN(s = +s) ? 0 : (s > 0 ? a : o)(s);
            };
          }
        ),
        /***/
        4630: (
          /***/
          function(t, i) {
            t.exports = function(o, a) {
              return {
                enumerable: !(o & 1),
                configurable: !(o & 2),
                writable: !(o & 4),
                value: a
              };
            };
          }
        ),
        /***/
        "4bf8": (
          /***/
          function(t, i, o) {
            var a = o("be13");
            t.exports = function(s) {
              return Object(a(s));
            };
          }
        ),
        /***/
        5147: (
          /***/
          function(t, i, o) {
            var a = o("2b4c")("match");
            t.exports = function(s) {
              var l = /./;
              try {
                "/./"[s](l);
              } catch {
                try {
                  return l[a] = !1, !"/./"[s](l);
                } catch {
                }
              }
              return !0;
            };
          }
        ),
        /***/
        "520a": (
          /***/
          function(t, i, o) {
            var a = o("0bfb"), s = RegExp.prototype.exec, l = String.prototype.replace, u = s, c = "lastIndex", f = function() {
              var d = /a/, h = /b*/g;
              return s.call(d, "a"), s.call(h, "a"), d[c] !== 0 || h[c] !== 0;
            }(), p = /()??/.exec("")[1] !== void 0, g = f || p;
            g && (u = function(h) {
              var v = this, x, D, O, C;
              return p && (D = new RegExp("^" + v.source + "$(?!\\s)", a.call(v))), f && (x = v[c]), O = s.call(v, h), f && O && (v[c] = v.global ? O.index + O[0].length : x), p && O && O.length > 1 && l.call(O[0], D, function() {
                for (C = 1; C < arguments.length - 2; C++)
                  arguments[C] === void 0 && (O[C] = void 0);
              }), O;
            }), t.exports = u;
          }
        ),
        /***/
        "52a7": (
          /***/
          function(t, i) {
            i.f = {}.propertyIsEnumerable;
          }
        ),
        /***/
        5537: (
          /***/
          function(t, i, o) {
            var a = o("8378"), s = o("7726"), l = "__core-js_shared__", u = s[l] || (s[l] = {});
            (t.exports = function(c, f) {
              return u[c] || (u[c] = f !== void 0 ? f : {});
            })("versions", []).push({
              version: a.version,
              mode: o("2d00") ? "pure" : "global",
              copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
            });
          }
        ),
        /***/
        "5ca1": (
          /***/
          function(t, i, o) {
            var a = o("7726"), s = o("8378"), l = o("32e9"), u = o("2aba"), c = o("9b43"), f = "prototype", p = function(g, d, h) {
              var v = g & p.F, x = g & p.G, D = g & p.S, O = g & p.P, C = g & p.B, L = x ? a : D ? a[d] || (a[d] = {}) : (a[d] || {})[f], V = x ? s : s[d] || (s[d] = {}), U = V[f] || (V[f] = {}), I, N, A, B;
              x && (h = d);
              for (I in h)
                N = !v && L && L[I] !== void 0, A = (N ? L : h)[I], B = C && N ? c(A, a) : O && typeof A == "function" ? c(Function.call, A) : A, L && u(L, I, A, g & p.U), V[I] != A && l(V, I, B), O && U[I] != A && (U[I] = A);
            };
            a.core = s, p.F = 1, p.G = 2, p.S = 4, p.P = 8, p.B = 16, p.W = 32, p.U = 64, p.R = 128, t.exports = p;
          }
        ),
        /***/
        "5eda": (
          /***/
          function(t, i, o) {
            var a = o("5ca1"), s = o("8378"), l = o("79e5");
            t.exports = function(u, c) {
              var f = (s.Object || {})[u] || Object[u], p = {};
              p[u] = c(f), a(a.S + a.F * l(function() {
                f(1);
              }), "Object", p);
            };
          }
        ),
        /***/
        "5f1b": (
          /***/
          function(t, i, o) {
            var a = o("23c6"), s = RegExp.prototype.exec;
            t.exports = function(l, u) {
              var c = l.exec;
              if (typeof c == "function") {
                var f = c.call(l, u);
                if (typeof f != "object")
                  throw new TypeError("RegExp exec method returned something other than an Object or null");
                return f;
              }
              if (a(l) !== "RegExp")
                throw new TypeError("RegExp#exec called on incompatible receiver");
              return s.call(l, u);
            };
          }
        ),
        /***/
        "613b": (
          /***/
          function(t, i, o) {
            var a = o("5537")("keys"), s = o("ca5a");
            t.exports = function(l) {
              return a[l] || (a[l] = s(l));
            };
          }
        ),
        /***/
        "626a": (
          /***/
          function(t, i, o) {
            var a = o("2d95");
            t.exports = Object("z").propertyIsEnumerable(0) ? Object : function(s) {
              return a(s) == "String" ? s.split("") : Object(s);
            };
          }
        ),
        /***/
        6762: (
          /***/
          function(t, i, o) {
            var a = o("5ca1"), s = o("c366")(!0);
            a(a.P, "Array", {
              includes: function(u) {
                return s(this, u, arguments.length > 1 ? arguments[1] : void 0);
              }
            }), o("9c6c")("includes");
          }
        ),
        /***/
        6821: (
          /***/
          function(t, i, o) {
            var a = o("626a"), s = o("be13");
            t.exports = function(l) {
              return a(s(l));
            };
          }
        ),
        /***/
        "69a8": (
          /***/
          function(t, i) {
            var o = {}.hasOwnProperty;
            t.exports = function(a, s) {
              return o.call(a, s);
            };
          }
        ),
        /***/
        "6a99": (
          /***/
          function(t, i, o) {
            var a = o("d3f4");
            t.exports = function(s, l) {
              if (!a(s)) return s;
              var u, c;
              if (l && typeof (u = s.toString) == "function" && !a(c = u.call(s)) || typeof (u = s.valueOf) == "function" && !a(c = u.call(s)) || !l && typeof (u = s.toString) == "function" && !a(c = u.call(s))) return c;
              throw TypeError("Can't convert object to primitive value");
            };
          }
        ),
        /***/
        7333: (
          /***/
          function(t, i, o) {
            var a = o("0d58"), s = o("2621"), l = o("52a7"), u = o("4bf8"), c = o("626a"), f = Object.assign;
            t.exports = !f || o("79e5")(function() {
              var p = {}, g = {}, d = Symbol(), h = "abcdefghijklmnopqrst";
              return p[d] = 7, h.split("").forEach(function(v) {
                g[v] = v;
              }), f({}, p)[d] != 7 || Object.keys(f({}, g)).join("") != h;
            }) ? function(g, d) {
              for (var h = u(g), v = arguments.length, x = 1, D = s.f, O = l.f; v > x; )
                for (var C = c(arguments[x++]), L = D ? a(C).concat(D(C)) : a(C), V = L.length, U = 0, I; V > U; ) O.call(C, I = L[U++]) && (h[I] = C[I]);
              return h;
            } : f;
          }
        ),
        /***/
        7726: (
          /***/
          function(t, i) {
            var o = t.exports = typeof window < "u" && window.Math == Math ? window : typeof self < "u" && self.Math == Math ? self : Function("return this")();
            typeof __g == "number" && (__g = o);
          }
        ),
        /***/
        "77f1": (
          /***/
          function(t, i, o) {
            var a = o("4588"), s = Math.max, l = Math.min;
            t.exports = function(u, c) {
              return u = a(u), u < 0 ? s(u + c, 0) : l(u, c);
            };
          }
        ),
        /***/
        "79e5": (
          /***/
          function(t, i) {
            t.exports = function(o) {
              try {
                return !!o();
              } catch {
                return !0;
              }
            };
          }
        ),
        /***/
        "7f20": (
          /***/
          function(t, i, o) {
            var a = o("86cc").f, s = o("69a8"), l = o("2b4c")("toStringTag");
            t.exports = function(u, c, f) {
              u && !s(u = f ? u : u.prototype, l) && a(u, l, { configurable: !0, value: c });
            };
          }
        ),
        /***/
        8378: (
          /***/
          function(t, i) {
            var o = t.exports = { version: "2.6.5" };
            typeof __e == "number" && (__e = o);
          }
        ),
        /***/
        "84f2": (
          /***/
          function(t, i) {
            t.exports = {};
          }
        ),
        /***/
        "86cc": (
          /***/
          function(t, i, o) {
            var a = o("cb7c"), s = o("c69a"), l = o("6a99"), u = Object.defineProperty;
            i.f = o("9e1e") ? Object.defineProperty : function(f, p, g) {
              if (a(f), p = l(p, !0), a(g), s) try {
                return u(f, p, g);
              } catch {
              }
              if ("get" in g || "set" in g) throw TypeError("Accessors not supported!");
              return "value" in g && (f[p] = g.value), f;
            };
          }
        ),
        /***/
        "9b43": (
          /***/
          function(t, i, o) {
            var a = o("d8e8");
            t.exports = function(s, l, u) {
              if (a(s), l === void 0) return s;
              switch (u) {
                case 1:
                  return function(c) {
                    return s.call(l, c);
                  };
                case 2:
                  return function(c, f) {
                    return s.call(l, c, f);
                  };
                case 3:
                  return function(c, f, p) {
                    return s.call(l, c, f, p);
                  };
              }
              return function() {
                return s.apply(l, arguments);
              };
            };
          }
        ),
        /***/
        "9c6c": (
          /***/
          function(t, i, o) {
            var a = o("2b4c")("unscopables"), s = Array.prototype;
            s[a] == null && o("32e9")(s, a, {}), t.exports = function(l) {
              s[a][l] = !0;
            };
          }
        ),
        /***/
        "9def": (
          /***/
          function(t, i, o) {
            var a = o("4588"), s = Math.min;
            t.exports = function(l) {
              return l > 0 ? s(a(l), 9007199254740991) : 0;
            };
          }
        ),
        /***/
        "9e1e": (
          /***/
          function(t, i, o) {
            t.exports = !o("79e5")(function() {
              return Object.defineProperty({}, "a", { get: function() {
                return 7;
              } }).a != 7;
            });
          }
        ),
        /***/
        a352: (
          /***/
          function(t, i) {
            t.exports = r;
          }
        ),
        /***/
        a481: (
          /***/
          function(t, i, o) {
            var a = o("cb7c"), s = o("4bf8"), l = o("9def"), u = o("4588"), c = o("0390"), f = o("5f1b"), p = Math.max, g = Math.min, d = Math.floor, h = /\$([$&`']|\d\d?|<[^>]*>)/g, v = /\$([$&`']|\d\d?)/g, x = function(D) {
              return D === void 0 ? D : String(D);
            };
            o("214f")("replace", 2, function(D, O, C, L) {
              return [
                // `String.prototype.replace` method
                // https://tc39.github.io/ecma262/#sec-string.prototype.replace
                function(I, N) {
                  var A = D(this), B = I == null ? void 0 : I[O];
                  return B !== void 0 ? B.call(I, A, N) : C.call(String(A), I, N);
                },
                // `RegExp.prototype[@@replace]` method
                // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
                function(U, I) {
                  var N = L(C, U, this, I);
                  if (N.done) return N.value;
                  var A = a(U), B = String(this), J = typeof I == "function";
                  J || (I = String(I));
                  var nt = A.global;
                  if (nt) {
                    var tt = A.unicode;
                    A.lastIndex = 0;
                  }
                  for (var H = []; ; ) {
                    var z = f(A, B);
                    if (z === null || (H.push(z), !nt)) break;
                    var X = String(z[0]);
                    X === "" && (A.lastIndex = c(B, l(A.lastIndex), tt));
                  }
                  for (var dt = "", st = 0, it = 0; it < H.length; it++) {
                    z = H[it];
                    for (var y = String(z[0]), m = p(g(u(z.index), B.length), 0), b = [], E = 1; E < z.length; E++) b.push(x(z[E]));
                    var P = z.groups;
                    if (J) {
                      var j = [y].concat(b, m, B);
                      P !== void 0 && j.push(P);
                      var G = String(I.apply(void 0, j));
                    } else
                      G = V(y, B, m, b, P, I);
                    m >= st && (dt += B.slice(st, m) + G, st = m + y.length);
                  }
                  return dt + B.slice(st);
                }
              ];
              function V(U, I, N, A, B, J) {
                var nt = N + U.length, tt = A.length, H = v;
                return B !== void 0 && (B = s(B), H = h), C.call(J, H, function(z, X) {
                  var dt;
                  switch (X.charAt(0)) {
                    case "$":
                      return "$";
                    case "&":
                      return U;
                    case "`":
                      return I.slice(0, N);
                    case "'":
                      return I.slice(nt);
                    case "<":
                      dt = B[X.slice(1, -1)];
                      break;
                    default:
                      var st = +X;
                      if (st === 0) return z;
                      if (st > tt) {
                        var it = d(st / 10);
                        return it === 0 ? z : it <= tt ? A[it - 1] === void 0 ? X.charAt(1) : A[it - 1] + X.charAt(1) : z;
                      }
                      dt = A[st - 1];
                  }
                  return dt === void 0 ? "" : dt;
                });
              }
            });
          }
        ),
        /***/
        aae3: (
          /***/
          function(t, i, o) {
            var a = o("d3f4"), s = o("2d95"), l = o("2b4c")("match");
            t.exports = function(u) {
              var c;
              return a(u) && ((c = u[l]) !== void 0 ? !!c : s(u) == "RegExp");
            };
          }
        ),
        /***/
        ac6a: (
          /***/
          function(t, i, o) {
            for (var a = o("cadf"), s = o("0d58"), l = o("2aba"), u = o("7726"), c = o("32e9"), f = o("84f2"), p = o("2b4c"), g = p("iterator"), d = p("toStringTag"), h = f.Array, v = {
              CSSRuleList: !0,
              // TODO: Not spec compliant, should be false.
              CSSStyleDeclaration: !1,
              CSSValueList: !1,
              ClientRectList: !1,
              DOMRectList: !1,
              DOMStringList: !1,
              DOMTokenList: !0,
              DataTransferItemList: !1,
              FileList: !1,
              HTMLAllCollection: !1,
              HTMLCollection: !1,
              HTMLFormElement: !1,
              HTMLSelectElement: !1,
              MediaList: !0,
              // TODO: Not spec compliant, should be false.
              MimeTypeArray: !1,
              NamedNodeMap: !1,
              NodeList: !0,
              PaintRequestList: !1,
              Plugin: !1,
              PluginArray: !1,
              SVGLengthList: !1,
              SVGNumberList: !1,
              SVGPathSegList: !1,
              SVGPointList: !1,
              SVGStringList: !1,
              SVGTransformList: !1,
              SourceBufferList: !1,
              StyleSheetList: !0,
              // TODO: Not spec compliant, should be false.
              TextTrackCueList: !1,
              TextTrackList: !1,
              TouchList: !1
            }, x = s(v), D = 0; D < x.length; D++) {
              var O = x[D], C = v[O], L = u[O], V = L && L.prototype, U;
              if (V && (V[g] || c(V, g, h), V[d] || c(V, d, O), f[O] = h, C))
                for (U in a) V[U] || l(V, U, a[U], !0);
            }
          }
        ),
        /***/
        b0c5: (
          /***/
          function(t, i, o) {
            var a = o("520a");
            o("5ca1")({
              target: "RegExp",
              proto: !0,
              forced: a !== /./.exec
            }, {
              exec: a
            });
          }
        ),
        /***/
        be13: (
          /***/
          function(t, i) {
            t.exports = function(o) {
              if (o == null) throw TypeError("Can't call method on  " + o);
              return o;
            };
          }
        ),
        /***/
        c366: (
          /***/
          function(t, i, o) {
            var a = o("6821"), s = o("9def"), l = o("77f1");
            t.exports = function(u) {
              return function(c, f, p) {
                var g = a(c), d = s(g.length), h = l(p, d), v;
                if (u && f != f) {
                  for (; d > h; )
                    if (v = g[h++], v != v) return !0;
                } else for (; d > h; h++) if ((u || h in g) && g[h] === f)
                  return u || h || 0;
                return !u && -1;
              };
            };
          }
        ),
        /***/
        c649: (
          /***/
          function(t, i, o) {
            (function(a) {
              o.d(i, "c", function() {
                return g;
              }), o.d(i, "a", function() {
                return f;
              }), o.d(i, "b", function() {
                return l;
              }), o.d(i, "d", function() {
                return p;
              }), o("a481");
              function s() {
                return typeof window < "u" ? window.console : a.console;
              }
              var l = s();
              function u(d) {
                var h = /* @__PURE__ */ Object.create(null);
                return function(x) {
                  var D = h[x];
                  return D || (h[x] = d(x));
                };
              }
              var c = /-(\w)/g, f = u(function(d) {
                return d.replace(c, function(h, v) {
                  return v ? v.toUpperCase() : "";
                });
              });
              function p(d) {
                d.parentElement !== null && d.parentElement.removeChild(d);
              }
              function g(d, h, v) {
                var x = v === 0 ? d.children[0] : d.children[v - 1].nextSibling;
                d.insertBefore(h, x);
              }
            }).call(this, o("c8ba"));
          }
        ),
        /***/
        c69a: (
          /***/
          function(t, i, o) {
            t.exports = !o("9e1e") && !o("79e5")(function() {
              return Object.defineProperty(o("230e")("div"), "a", { get: function() {
                return 7;
              } }).a != 7;
            });
          }
        ),
        /***/
        c8ba: (
          /***/
          function(t, i) {
            var o;
            o = /* @__PURE__ */ function() {
              return this;
            }();
            try {
              o = o || new Function("return this")();
            } catch {
              typeof window == "object" && (o = window);
            }
            t.exports = o;
          }
        ),
        /***/
        ca5a: (
          /***/
          function(t, i) {
            var o = 0, a = Math.random();
            t.exports = function(s) {
              return "Symbol(".concat(s === void 0 ? "" : s, ")_", (++o + a).toString(36));
            };
          }
        ),
        /***/
        cadf: (
          /***/
          function(t, i, o) {
            var a = o("9c6c"), s = o("d53b"), l = o("84f2"), u = o("6821");
            t.exports = o("01f9")(Array, "Array", function(c, f) {
              this._t = u(c), this._i = 0, this._k = f;
            }, function() {
              var c = this._t, f = this._k, p = this._i++;
              return !c || p >= c.length ? (this._t = void 0, s(1)) : f == "keys" ? s(0, p) : f == "values" ? s(0, c[p]) : s(0, [p, c[p]]);
            }, "values"), l.Arguments = l.Array, a("keys"), a("values"), a("entries");
          }
        ),
        /***/
        cb7c: (
          /***/
          function(t, i, o) {
            var a = o("d3f4");
            t.exports = function(s) {
              if (!a(s)) throw TypeError(s + " is not an object!");
              return s;
            };
          }
        ),
        /***/
        ce10: (
          /***/
          function(t, i, o) {
            var a = o("69a8"), s = o("6821"), l = o("c366")(!1), u = o("613b")("IE_PROTO");
            t.exports = function(c, f) {
              var p = s(c), g = 0, d = [], h;
              for (h in p) h != u && a(p, h) && d.push(h);
              for (; f.length > g; ) a(p, h = f[g++]) && (~l(d, h) || d.push(h));
              return d;
            };
          }
        ),
        /***/
        d2c8: (
          /***/
          function(t, i, o) {
            var a = o("aae3"), s = o("be13");
            t.exports = function(l, u, c) {
              if (a(u)) throw TypeError("String#" + c + " doesn't accept regex!");
              return String(s(l));
            };
          }
        ),
        /***/
        d3f4: (
          /***/
          function(t, i) {
            t.exports = function(o) {
              return typeof o == "object" ? o !== null : typeof o == "function";
            };
          }
        ),
        /***/
        d53b: (
          /***/
          function(t, i) {
            t.exports = function(o, a) {
              return { value: a, done: !!o };
            };
          }
        ),
        /***/
        d8e8: (
          /***/
          function(t, i) {
            t.exports = function(o) {
              if (typeof o != "function") throw TypeError(o + " is not a function!");
              return o;
            };
          }
        ),
        /***/
        e11e: (
          /***/
          function(t, i) {
            t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
          }
        ),
        /***/
        f559: (
          /***/
          function(t, i, o) {
            var a = o("5ca1"), s = o("9def"), l = o("d2c8"), u = "startsWith", c = ""[u];
            a(a.P + a.F * o("5147")(u), "String", {
              startsWith: function(p) {
                var g = l(this, p, u), d = s(Math.min(arguments.length > 1 ? arguments[1] : void 0, g.length)), h = String(p);
                return c ? c.call(g, h, d) : g.slice(d, d + h.length) === h;
              }
            });
          }
        ),
        /***/
        f6fd: (
          /***/
          function(t, i) {
            (function(o) {
              var a = "currentScript", s = o.getElementsByTagName("script");
              a in o || Object.defineProperty(o, a, {
                get: function() {
                  try {
                    throw new Error();
                  } catch (c) {
                    var l, u = (/.*at [^\(]*\((.*):.+:.+\)$/ig.exec(c.stack) || [!1])[1];
                    for (l in s)
                      if (s[l].src == u || s[l].readyState == "interactive")
                        return s[l];
                    return null;
                  }
                }
              });
            })(document);
          }
        ),
        /***/
        f751: (
          /***/
          function(t, i, o) {
            var a = o("5ca1");
            a(a.S + a.F, "Object", { assign: o("7333") });
          }
        ),
        /***/
        fa5b: (
          /***/
          function(t, i, o) {
            t.exports = o("5537")("native-function-to-string", Function.toString);
          }
        ),
        /***/
        fab2: (
          /***/
          function(t, i, o) {
            var a = o("7726").document;
            t.exports = a && a.documentElement;
          }
        ),
        /***/
        fb15: (
          /***/
          function(t, i, o) {
            if (o.r(i), typeof window < "u") {
              o("f6fd");
              var a;
              (a = window.document.currentScript) && (a = a.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)) && (o.p = a[1]);
            }
            o("f751"), o("f559"), o("ac6a"), o("cadf"), o("456d");
            function s(y) {
              if (Array.isArray(y)) return y;
            }
            function l(y, m) {
              if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(y)))) {
                var b = [], E = !0, P = !1, j = void 0;
                try {
                  for (var G = y[Symbol.iterator](), et; !(E = (et = G.next()).done) && (b.push(et.value), !(m && b.length === m)); E = !0)
                    ;
                } catch (Dt) {
                  P = !0, j = Dt;
                } finally {
                  try {
                    !E && G.return != null && G.return();
                  } finally {
                    if (P) throw j;
                  }
                }
                return b;
              }
            }
            function u(y, m) {
              (m == null || m > y.length) && (m = y.length);
              for (var b = 0, E = new Array(m); b < m; b++)
                E[b] = y[b];
              return E;
            }
            function c(y, m) {
              if (y) {
                if (typeof y == "string") return u(y, m);
                var b = Object.prototype.toString.call(y).slice(8, -1);
                if (b === "Object" && y.constructor && (b = y.constructor.name), b === "Map" || b === "Set") return Array.from(y);
                if (b === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(b)) return u(y, m);
              }
            }
            function f() {
              throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
            }
            function p(y, m) {
              return s(y) || l(y, m) || c(y, m) || f();
            }
            o("6762"), o("2fdb");
            function g(y) {
              if (Array.isArray(y)) return u(y);
            }
            function d(y) {
              if (typeof Symbol < "u" && Symbol.iterator in Object(y)) return Array.from(y);
            }
            function h() {
              throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
            }
            function v(y) {
              return g(y) || d(y) || c(y) || h();
            }
            var x = o("a352"), D = /* @__PURE__ */ o.n(x), O = o("c649");
            function C(y, m, b) {
              return b === void 0 || (y = y || {}, y[m] = b), y;
            }
            function L(y, m) {
              return y.map(function(b) {
                return b.elm;
              }).indexOf(m);
            }
            function V(y, m, b, E) {
              if (!y)
                return [];
              var P = y.map(function(et) {
                return et.elm;
              }), j = m.length - E, G = v(m).map(function(et, Dt) {
                return Dt >= j ? P.length : P.indexOf(et);
              });
              return b ? G.filter(function(et) {
                return et !== -1;
              }) : G;
            }
            function U(y, m) {
              var b = this;
              this.$nextTick(function() {
                return b.$emit(y.toLowerCase(), m);
              });
            }
            function I(y) {
              var m = this;
              return function(b) {
                m.realList !== null && m["onDrag" + y](b), U.call(m, y, b);
              };
            }
            function N(y) {
              return ["transition-group", "TransitionGroup"].includes(y);
            }
            function A(y) {
              if (!y || y.length !== 1)
                return !1;
              var m = p(y, 1), b = m[0].componentOptions;
              return b ? N(b.tag) : !1;
            }
            function B(y, m, b) {
              return y[b] || (m[b] ? m[b]() : void 0);
            }
            function J(y, m, b) {
              var E = 0, P = 0, j = B(m, b, "header");
              j && (E = j.length, y = y ? [].concat(v(j), v(y)) : v(j));
              var G = B(m, b, "footer");
              return G && (P = G.length, y = y ? [].concat(v(y), v(G)) : v(G)), {
                children: y,
                headerOffset: E,
                footerOffset: P
              };
            }
            function nt(y, m) {
              var b = null, E = function(re, Dn) {
                b = C(b, re, Dn);
              }, P = Object.keys(y).filter(function(Dt) {
                return Dt === "id" || Dt.startsWith("data-");
              }).reduce(function(Dt, re) {
                return Dt[re] = y[re], Dt;
              }, {});
              if (E("attrs", P), !m)
                return b;
              var j = m.on, G = m.props, et = m.attrs;
              return E("on", j), E("props", G), Object.assign(b.attrs, et), b;
            }
            var tt = ["Start", "Add", "Remove", "Update", "End"], H = ["Choose", "Unchoose", "Sort", "Filter", "Clone"], z = ["Move"].concat(tt, H).map(function(y) {
              return "on" + y;
            }), X = null, dt = {
              options: Object,
              list: {
                type: Array,
                required: !1,
                default: null
              },
              value: {
                type: Array,
                required: !1,
                default: null
              },
              noTransitionOnDrag: {
                type: Boolean,
                default: !1
              },
              clone: {
                type: Function,
                default: function(m) {
                  return m;
                }
              },
              element: {
                type: String,
                default: "div"
              },
              tag: {
                type: String,
                default: null
              },
              move: {
                type: Function,
                default: null
              },
              componentData: {
                type: Object,
                required: !1,
                default: null
              }
            }, st = {
              name: "draggable",
              inheritAttrs: !1,
              props: dt,
              data: function() {
                return {
                  transitionMode: !1,
                  noneFunctionalComponentMode: !1
                };
              },
              render: function(m) {
                var b = this.$slots.default;
                this.transitionMode = A(b);
                var E = J(b, this.$slots, this.$scopedSlots), P = E.children, j = E.headerOffset, G = E.footerOffset;
                this.headerOffset = j, this.footerOffset = G;
                var et = nt(this.$attrs, this.componentData);
                return m(this.getTag(), et, P);
              },
              created: function() {
                this.list !== null && this.value !== null && O.b.error("Value and list props are mutually exclusive! Please set one or another."), this.element !== "div" && O.b.warn("Element props is deprecated please use tag props instead. See https://github.com/SortableJS/Vue.Draggable/blob/master/documentation/migrate.md#element-props"), this.options !== void 0 && O.b.warn("Options props is deprecated, add sortable options directly as vue.draggable item, or use v-bind. See https://github.com/SortableJS/Vue.Draggable/blob/master/documentation/migrate.md#options-props");
              },
              mounted: function() {
                var m = this;
                if (this.noneFunctionalComponentMode = this.getTag().toLowerCase() !== this.$el.nodeName.toLowerCase() && !this.getIsFunctional(), this.noneFunctionalComponentMode && this.transitionMode)
                  throw new Error("Transition-group inside component is not supported. Please alter tag value or remove transition-group. Current tag value: ".concat(this.getTag()));
                var b = {};
                tt.forEach(function(j) {
                  b["on" + j] = I.call(m, j);
                }), H.forEach(function(j) {
                  b["on" + j] = U.bind(m, j);
                });
                var E = Object.keys(this.$attrs).reduce(function(j, G) {
                  return j[Object(O.a)(G)] = m.$attrs[G], j;
                }, {}), P = Object.assign({}, this.options, E, b, {
                  onMove: function(G, et) {
                    return m.onDragMove(G, et);
                  }
                });
                !("draggable" in P) && (P.draggable = ">*"), this._sortable = new D.a(this.rootContainer, P), this.computeIndexes();
              },
              beforeDestroy: function() {
                this._sortable !== void 0 && this._sortable.destroy();
              },
              computed: {
                rootContainer: function() {
                  return this.transitionMode ? this.$el.children[0] : this.$el;
                },
                realList: function() {
                  return this.list ? this.list : this.value;
                }
              },
              watch: {
                options: {
                  handler: function(m) {
                    this.updateOptions(m);
                  },
                  deep: !0
                },
                $attrs: {
                  handler: function(m) {
                    this.updateOptions(m);
                  },
                  deep: !0
                },
                realList: function() {
                  this.computeIndexes();
                }
              },
              methods: {
                getIsFunctional: function() {
                  var m = this._vnode.fnOptions;
                  return m && m.functional;
                },
                getTag: function() {
                  return this.tag || this.element;
                },
                updateOptions: function(m) {
                  for (var b in m) {
                    var E = Object(O.a)(b);
                    z.indexOf(E) === -1 && this._sortable.option(E, m[b]);
                  }
                },
                getChildrenNodes: function() {
                  if (this.noneFunctionalComponentMode)
                    return this.$children[0].$slots.default;
                  var m = this.$slots.default;
                  return this.transitionMode ? m[0].child.$slots.default : m;
                },
                computeIndexes: function() {
                  var m = this;
                  this.$nextTick(function() {
                    m.visibleIndexes = V(m.getChildrenNodes(), m.rootContainer.children, m.transitionMode, m.footerOffset);
                  });
                },
                getUnderlyingVm: function(m) {
                  var b = L(this.getChildrenNodes() || [], m);
                  if (b === -1)
                    return null;
                  var E = this.realList[b];
                  return {
                    index: b,
                    element: E
                  };
                },
                getUnderlyingPotencialDraggableComponent: function(m) {
                  var b = m.__vue__;
                  return !b || !b.$options || !N(b.$options._componentTag) ? !("realList" in b) && b.$children.length === 1 && "realList" in b.$children[0] ? b.$children[0] : b : b.$parent;
                },
                emitChanges: function(m) {
                  var b = this;
                  this.$nextTick(function() {
                    b.$emit("change", m);
                  });
                },
                alterList: function(m) {
                  if (this.list) {
                    m(this.list);
                    return;
                  }
                  var b = v(this.value);
                  m(b), this.$emit("input", b);
                },
                spliceList: function() {
                  var m = arguments, b = function(P) {
                    return P.splice.apply(P, v(m));
                  };
                  this.alterList(b);
                },
                updatePosition: function(m, b) {
                  var E = function(j) {
                    return j.splice(b, 0, j.splice(m, 1)[0]);
                  };
                  this.alterList(E);
                },
                getRelatedContextFromMoveEvent: function(m) {
                  var b = m.to, E = m.related, P = this.getUnderlyingPotencialDraggableComponent(b);
                  if (!P)
                    return {
                      component: P
                    };
                  var j = P.realList, G = {
                    list: j,
                    component: P
                  };
                  if (b !== E && j && P.getUnderlyingVm) {
                    var et = P.getUnderlyingVm(E);
                    if (et)
                      return Object.assign(et, G);
                  }
                  return G;
                },
                getVmIndex: function(m) {
                  var b = this.visibleIndexes, E = b.length;
                  return m > E - 1 ? E : b[m];
                },
                getComponent: function() {
                  return this.$slots.default[0].componentInstance;
                },
                resetTransitionData: function(m) {
                  if (!(!this.noTransitionOnDrag || !this.transitionMode)) {
                    var b = this.getChildrenNodes();
                    b[m].data = null;
                    var E = this.getComponent();
                    E.children = [], E.kept = void 0;
                  }
                },
                onDragStart: function(m) {
                  this.context = this.getUnderlyingVm(m.item), m.item._underlying_vm_ = this.clone(this.context.element), X = m.item;
                },
                onDragAdd: function(m) {
                  var b = m.item._underlying_vm_;
                  if (b !== void 0) {
                    Object(O.d)(m.item);
                    var E = this.getVmIndex(m.newIndex);
                    this.spliceList(E, 0, b), this.computeIndexes();
                    var P = {
                      element: b,
                      newIndex: E
                    };
                    this.emitChanges({
                      added: P
                    });
                  }
                },
                onDragRemove: function(m) {
                  if (Object(O.c)(this.rootContainer, m.item, m.oldIndex), m.pullMode === "clone") {
                    Object(O.d)(m.clone);
                    return;
                  }
                  var b = this.context.index;
                  this.spliceList(b, 1);
                  var E = {
                    element: this.context.element,
                    oldIndex: b
                  };
                  this.resetTransitionData(b), this.emitChanges({
                    removed: E
                  });
                },
                onDragUpdate: function(m) {
                  Object(O.d)(m.item), Object(O.c)(m.from, m.item, m.oldIndex);
                  var b = this.context.index, E = this.getVmIndex(m.newIndex);
                  this.updatePosition(b, E);
                  var P = {
                    element: this.context.element,
                    oldIndex: b,
                    newIndex: E
                  };
                  this.emitChanges({
                    moved: P
                  });
                },
                updateProperty: function(m, b) {
                  m.hasOwnProperty(b) && (m[b] += this.headerOffset);
                },
                computeFutureIndex: function(m, b) {
                  if (!m.element)
                    return 0;
                  var E = v(b.to.children).filter(function(et) {
                    return et.style.display !== "none";
                  }), P = E.indexOf(b.related), j = m.component.getVmIndex(P), G = E.indexOf(X) !== -1;
                  return G || !b.willInsertAfter ? j : j + 1;
                },
                onDragMove: function(m, b) {
                  var E = this.move;
                  if (!E || !this.realList)
                    return !0;
                  var P = this.getRelatedContextFromMoveEvent(m), j = this.context, G = this.computeFutureIndex(P, m);
                  Object.assign(j, {
                    futureIndex: G
                  });
                  var et = Object.assign({}, m, {
                    relatedContext: P,
                    draggedContext: j
                  });
                  return E(et, b);
                },
                onDragEnd: function() {
                  this.computeIndexes(), X = null;
                }
              }
            };
            typeof window < "u" && "Vue" in window && window.Vue.component("draggable", st);
            var it = st;
            i.default = it;
          }
        )
        /******/
      }).default
    );
  });
})(fn);
var gr = fn.exports;
const vr = /* @__PURE__ */ Pn(gr), mr = {
  name: "vue-pivottable-ui",
  mixins: [
    we
  ],
  model: {
    prop: "config",
    event: "onRefresh"
  },
  props: {
    async: {
      type: Boolean,
      default: !1
    },
    hiddenAttributes: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hiddenFromAggregators: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hiddenFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    sortonlyFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    disabledFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    menuLimit: {
      type: Number,
      default: 500
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  computed: {
    appliedFilter() {
      return this.propsData.valueFilter;
    },
    rendererItems() {
      return this.renderers || Object.assign({}, We);
    },
    aggregatorItems() {
      return this.aggregators || te;
    },
    numValsAllowed() {
      return this.aggregatorItems[this.propsData.aggregatorName]([])().numInputs || 0;
    },
    rowAttrs() {
      return this.propsData.rows.filter(
        (e) => !this.hiddenAttributes.includes(e) && !this.hiddenFromDragDrop.includes(e)
      );
    },
    colAttrs() {
      return this.propsData.cols.filter(
        (e) => !this.hiddenAttributes.includes(e) && !this.hiddenFromDragDrop.includes(e)
      );
    },
    unusedAttrs() {
      return this.propsData.attributes.filter(
        (e) => !this.propsData.rows.includes(e) && !this.propsData.cols.includes(e) && !this.hiddenAttributes.includes(e) && !this.hiddenFromDragDrop.includes(e)
      ).sort(un(this.unusedOrder));
    }
  },
  data() {
    return {
      propsData: {
        aggregatorName: "",
        rendererName: "",
        rowOrder: "key_a_to_z",
        colOrder: "key_a_to_z",
        vals: [],
        cols: [],
        rows: [],
        attributes: [],
        /**
         * ValueFilter's keys with the special field '*' will match all values and filter them out (true) or show (false).
         Sample:
          ```
          valueFilter: {
            field1: {
              '*': true, // filter out all values
              'value1': true, // filter out value1
              'value2': false // select to display value2
            },
            field2: {
              '*': false, // select to display all values
              'value1': true, // filter out value1
              'value2': false // select to display value2
            }
          }
          ```
        */
        valueFilter: {},
        renderer: null
      },
      pivotData: [],
      openStatus: {},
      attrValues: {},
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1e3,
      openDropdown: !1,
      materializedInput: [],
      sortIcons: {
        key_a_to_z: {
          rowSymbol: "↕",
          colSymbol: "↔",
          next: "value_a_to_z"
        },
        value_a_to_z: {
          rowSymbol: "↓",
          colSymbol: "→",
          next: "value_z_to_a"
        },
        value_z_to_a: {
          rowSymbol: "↑",
          colSymbol: "←",
          next: "key_a_to_z"
        }
      }
    };
  },
  beforeUpdated(e) {
    this.materializeInput(e.data);
  },
  watch: {
    rowOrder: {
      handler(e) {
        this.propsData.rowOrder = e;
      }
    },
    colOrder: {
      handler(e) {
        this.propsData.colOrder = e;
      }
    },
    cols: {
      handler(e) {
        this.propsData.cols = e;
      }
    },
    rows: {
      handler(e) {
        this.propsData.rows = e;
      }
    },
    rendererName: {
      handler(e) {
        this.propsData.rendererName = e;
      }
    },
    appliedFilter: {
      handler(e, n) {
        this.$emit("update:valueFilter", e);
      },
      immediate: !0,
      deep: !0
    },
    valueFilter: {
      handler(e) {
        this.propsData.valueFilter = e;
      },
      immediate: !0,
      deep: !0
    },
    data: {
      handler(e) {
        this.init();
      },
      immediate: !0,
      deep: !0
    },
    attributes: {
      handler(e) {
        this.propsData.attributes = e.length > 0 ? e : Object.keys(this.attrValues);
      },
      deep: !0
    },
    propsData: {
      handler(e) {
        if (this.pivotData.length === 0) return;
        const n = {
          derivedAttributes: this.derivedAttributes,
          hiddenAttributes: this.hiddenAttributes,
          hiddenFromAggregators: this.hiddenFromAggregators,
          hiddenFromDragDrop: this.hiddenFromDragDrop,
          sortonlyFromDragDrop: this.sortonlyFromDragDrop,
          disabledFromDragDrop: this.disabledFromDragDrop,
          menuLimit: this.menuLimit,
          attributes: e.attributes,
          unusedAttrs: this.unusedAttrs,
          sorters: this.sorters,
          data: this.materializedInput,
          rowOrder: e.rowOrder,
          colOrder: e.colOrder,
          valueFilter: e.valueFilter,
          rows: e.rows,
          cols: e.cols,
          rendererName: e.rendererName,
          aggregatorName: e.aggregatorName,
          aggregators: this.aggregatorItems,
          vals: e.vals
        };
        this.$emit("onRefresh", n);
      },
      immediate: !1,
      deep: !0
    }
  },
  methods: {
    init() {
      this.materializeInput(this.data), this.propsData.vals = this.vals.slice(), this.propsData.rows = this.rows, this.propsData.cols = this.cols, this.propsData.rowOrder = this.rowOrder, this.propsData.colOrder = this.colOrder, this.propsData.rendererName = this.rendererName, this.propsData.aggregatorName = this.aggregatorName, this.propsData.attributes = this.attributes.length > 0 ? this.attributes : Object.keys(this.attrValues), this.unusedOrder = this.unusedAttrs;
      const e = "*";
      Object.entries(this.attrValues).forEach(([n, r]) => {
        let t = {};
        const i = this.valueFilter && this.valueFilter[n];
        i && Object.keys(i).length && (i[e] === !0 ? Object.keys(r).forEach((o) => {
          if (o !== e) {
            const a = i[o];
            (a === void 0 || a === !0) && (t[o] = !0);
          }
        }) : t = i), this.updateValueFilter({
          attribute: n,
          valueFilter: t
        });
      });
    },
    assignValue(e) {
      this.propsData.valueFilter = {
        ...this.propsData.valueFilter,
        [e]: {}
      };
    },
    propUpdater(e) {
      return (n) => {
        this.propsData[e] = n;
      };
    },
    updateValueFilter({ attribute: e, valueFilter: n }) {
      this.propsData.valueFilter = {
        ...this.propsData.valueFilter,
        [e]: n
      };
    },
    moveFilterBoxToTop({ attribute: e }) {
      this.maxZIndex += 1, this.zIndices[e] = this.maxZIndex + 1;
    },
    openFilterBox({ attribute: e, open: n }) {
      this.propsData.valueFilter = {
        ...this.propsData.valueFilter,
        [e]: n
      };
    },
    closeFilterBox(e) {
      this.openStatus = {};
    },
    materializeInput(e) {
      if (this.pivotData === e)
        return;
      this.pivotData = e;
      const n = {}, r = [];
      let t = 0;
      Ot.forEachRecord(this.pivotData, this.derivedAttributes, function(i) {
        r.push(i);
        for (const o of Object.keys(i))
          o in n || (n[o] = {}, t > 0 && (n[o].null = t));
        for (const o in n) {
          const a = o in i ? i[o] : "null";
          a in n[o] || (n[o][a] = 0), n[o][a]++;
        }
        t++;
      }), this.materializedInput = r, this.attrValues = n;
    },
    makeDnDCell(e, n, r, t) {
      var o;
      const i = (o = this.$scopedSlots) == null ? void 0 : o.pvtAttr;
      return t(
        vr,
        {
          attrs: {
            draggable: "li[data-id]",
            group: "sharted",
            ghostClass: ".pvtPlaceholder",
            filter: ".pvtFilterBox",
            preventOnFilter: !1,
            tag: "td"
          },
          props: {
            value: e
          },
          staticClass: r,
          on: {
            sort: n.bind(this)
          }
        },
        [
          e.map((a) => t(Nn, {
            scopedSlots: i ? {
              pvtAttr: (s) => t("slot", i(s))
            } : void 0,
            props: {
              sortable: this.sortonlyFromDragDrop.includes(a) || !this.disabledFromDragDrop.includes(a),
              draggable: !this.sortonlyFromDragDrop.includes(a) && !this.disabledFromDragDrop.includes(a),
              name: a,
              key: a,
              attrValues: this.attrValues[a],
              sorter: De(this.sorters, a),
              menuLimit: this.menuLimit,
              zIndex: this.zIndices[a] || this.maxZIndex,
              valueFilter: this.propsData.valueFilter[a],
              open: this.openStatus[a],
              async: this.async,
              unused: this.unusedAttrs.includes(a),
              localeStrings: this.locales[this.locale].localeStrings
            },
            domProps: {},
            on: {
              "update:filter": this.updateValueFilter,
              "moveToTop:filterbox": this.moveFilterBoxToTop,
              "open:filterbox": this.openFilterBox,
              "no:filterbox": () => this.$emit("no:filterbox")
            }
          }))
        ]
      );
    },
    rendererCell(e, n) {
      return this.$slots.rendererCell ? n("td", {
        staticClass: ["pvtRenderers pvtVals pvtText"]
      }, this.$slots.rendererCell) : n(
        "td",
        {
          staticClass: ["pvtRenderers"]
        },
        [
          n(Ce, {
            props: {
              values: Object.keys(this.rendererItems),
              value: e
            },
            on: {
              input: (r) => {
                this.propUpdater("rendererName")(r), this.propUpdater("renderer", this.rendererItems[this.rendererName]);
              }
            }
          })
        ]
      );
    },
    aggregatorCell(e, n, r) {
      return this.$slots.aggregatorCell ? r("td", {
        staticClass: ["pvtVals pvtText"]
      }, this.$slots.aggregatorCell) : r(
        "td",
        {
          staticClass: ["pvtVals"]
        },
        [
          r(
            "div",
            [
              r(Ce, {
                props: {
                  values: Object.keys(this.aggregatorItems),
                  value: e
                },
                on: {
                  input: (t) => {
                    this.propUpdater("aggregatorName")(t);
                  }
                }
              }),
              r("a", {
                staticClass: ["pvtRowOrder"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => {
                    this.propUpdater("rowOrder")(this.sortIcons[this.propsData.rowOrder].next);
                  }
                }
              }, this.sortIcons[this.propsData.rowOrder].rowSymbol),
              r("a", {
                staticClass: ["pvtColOrder"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => {
                    this.propUpdater("colOrder")(this.sortIcons[this.propsData.colOrder].next);
                  }
                }
              }, this.sortIcons[this.propsData.colOrder].colSymbol)
            ]
          ),
          this.numValsAllowed > 0 ? new Array(this.numValsAllowed).fill().map((t, i) => [
            r(Ce, {
              props: {
                values: Object.keys(this.attrValues).filter((o) => !this.hiddenAttributes.includes(o) && !this.hiddenFromAggregators.includes(o)),
                value: n[i]
              },
              on: {
                input: (o) => {
                  this.propsData.vals.splice(i, 1, o);
                }
              }
            })
          ]) : void 0
        ]
      );
    },
    outputCell(e, n, r) {
      return r(
        "td",
        {
          staticClass: ["pvtOutput"]
        },
        [
          r(Ke, {
            props: Object.assign(
              e,
              { tableMaxWidth: this.tableMaxWidth }
            )
          })
        ]
      );
    }
  },
  render(e) {
    var h;
    if (this.data.length < 1) return;
    const n = (h = this.$scopedSlots) == null ? void 0 : h.output, r = this.$slots.output, t = this.propsData.rendererName, i = this.propsData.aggregatorName, o = this.propsData.vals, a = this.makeDnDCell(
      this.unusedAttrs,
      (v) => {
        const x = v.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(x) && (!v.from.classList.contains("pvtUnused") || !v.to.classList.contains("pvtUnused")) || (v.from.classList.contains("pvtUnused") && (this.openFilterBox({ attribute: x, open: !1 }), this.unusedOrder.splice(v.oldIndex, 1), this.$emit("dragged:unused", x)), v.to.classList.contains("pvtUnused") && (this.openFilterBox({ attribute: x, open: !1 }), this.unusedOrder.splice(v.newIndex, 0, x), this.$emit("dropped:unused", x)));
      },
      "pvtAxisContainer pvtUnused pvtHorizList",
      e
    ), s = this.makeDnDCell(
      this.colAttrs,
      (v) => {
        const x = v.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(x) && (!v.from.classList.contains("pvtCols") || !v.to.classList.contains("pvtCols")) || (v.from.classList.contains("pvtCols") && (this.propsData.cols.splice(v.oldIndex, 1), this.$emit("dragged:cols", x)), v.to.classList.contains("pvtCols") && (this.propsData.cols.splice(v.newIndex, 0, x), this.$emit("dropped:cols", x)));
      },
      "pvtAxisContainer pvtHorizList pvtCols",
      e
    ), l = this.makeDnDCell(
      this.rowAttrs,
      (v) => {
        const x = v.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(x) && (!v.from.classList.contains("pvtRows") || !v.to.classList.contains("pvtRows")) || (v.from.classList.contains("pvtRows") && (this.propsData.rows.splice(v.oldIndex, 1), this.$emit("dragged:rows", x)), v.to.classList.contains("pvtRows") && (this.propsData.rows.splice(v.newIndex, 0, x), this.$emit("dropped:rows", x)));
      },
      "pvtAxisContainer pvtVertList pvtRows",
      e
    ), u = Object.assign({}, this.$props, {
      localeStrings: this.localeStrings,
      data: this.materializedInput,
      rowOrder: this.propsData.rowOrder,
      colOrder: this.propsData.colOrder,
      valueFilter: this.propsData.valueFilter,
      rows: this.propsData.rows,
      cols: this.propsData.cols,
      aggregators: this.aggregatorItems,
      rendererName: t,
      aggregatorName: i,
      vals: o
    });
    let c = null;
    try {
      c = new Ot(u);
    } catch (v) {
      if (console && console.error(v.stack))
        return this.computeError(e);
    }
    const f = this.rendererCell(t, e), p = this.aggregatorCell(i, o, e), g = this.outputCell(u, t.indexOf("Chart") > -1, e), d = this.$slots.colGroup;
    return e(
      "table",
      {
        staticClass: ["pvtUi"]
      },
      [
        d,
        e(
          "tbody",
          {
            on: {
              click: this.closeFilterBox
            }
          },
          [
            e(
              "tr",
              [
                f,
                a
              ]
            ),
            e(
              "tr",
              [
                p,
                s
              ]
            ),
            e(
              "tr",
              [
                l,
                r ? e("td", { staticClass: "pvtOutput" }, r) : void 0,
                n && !r ? e("td", { staticClass: "pvtOutput" }, n({ pivotData: c })) : void 0,
                !r && !n ? g : void 0
              ]
            )
          ]
        )
      ]
    );
  },
  renderError(e, n) {
    return this.uiRenderError(e);
  }
}, br = {
  aggregatorTemplates: Z,
  aggregators: te,
  derivers: An,
  locales: cn,
  naturalSort: Rt,
  numberFormat: Oe,
  getSort: De,
  sortAs: un,
  PivotData: Ot
}, yr = {
  TableRenderer: We
}, Be = {
  VuePivottable: Ke,
  VuePivottableUi: mr
};
typeof window < "u" && window.Vue && window.Vue.use(Ke);
const xr = (e) => {
  for (const n in Be)
    e.component(Be[n].name, Be[n]);
};
export {
  br as PivotUtilities,
  yr as Renderer,
  Ke as VuePivottable,
  mr as VuePivottableUi,
  xr as default
};
