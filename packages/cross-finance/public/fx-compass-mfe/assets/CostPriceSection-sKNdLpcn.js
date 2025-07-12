import { m as jsxRuntimeExports, T as TooltipProvider, C as Card, n as CardHeader, o as CardTitle, p as CurrencyFlag, q as CardContent, r as formatCurrency, t as TrendingUp, v as TrendingDown, S as Skeleton } from './__federation_expose_App-CCWU0bnW.js';
import { importShared } from './__federation_fn_import-KjEjubjT.js';

const {useEffect,useRef} = await importShared('react');
const CurrencyCard = ({
  currencyCode,
  ngnValue,
  previousValue,
  isLoading = false
}) => {
  const valueRef = useRef(null);
  useEffect(() => {
    if (valueRef.current && previousValue !== void 0 && previousValue !== ngnValue) {
      valueRef.current.classList.remove("animate-count");
      void valueRef.current.offsetWidth;
      valueRef.current.classList.add("animate-count");
    }
  }, [ngnValue, previousValue]);
  const getChangeIndicator = () => {
    if (!previousValue || ngnValue === previousValue) return null;
    const isIncrease = ngnValue > previousValue;
    const changePercent = Math.abs((ngnValue - previousValue) / previousValue * 100).toFixed(2);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${isIncrease ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`,
        "aria-label": `${isIncrease ? "Increased" : "Decreased"} by ${changePercent}%`,
        children: [
          isIncrease ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3 mr-1", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-3 w-3 mr-1", "aria-hidden": "true" }),
          changePercent,
          "%"
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `fx-card relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] ${isLoading ? "opacity-70" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${previousValue && ngnValue > previousValue ? "from-danger/30 via-danger to-danger/30" : previousValue && ngnValue < previousValue ? "from-success/30 via-success to-success/30" : "from-primary/30 via-primary to-primary/30"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CurrencyFlag, { currency: currencyCode, size: "md", className: "mr-1.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          "NGN/",
          currencyCode
        ] })
      ] }),
      getChangeIndicator()
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 pt-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-full skeleton-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-white", ref: valueRef, children: formatCurrency(ngnValue, "NGN") }) })
  ] }) });
};

const CostPricePanel = ({
  costPrices,
  previousCostPrices,
  isLoading
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dashboard-grid mb-8", children: ["USD", "EUR", "GBP", "CAD"].map((currency) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    CurrencyCard,
    {
      currencyCode: currency,
      ngnValue: costPrices[currency] || 0,
      previousValue: previousCostPrices[currency],
      isLoading
    },
    currency
  )) });
};

const CostPriceSection = ({
  costPrices,
  previousCostPrices,
  isLoading
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-medium mb-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-primary" }),
      "Cost Prices (NGN)"
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      CostPricePanel,
      {
        costPrices,
        previousCostPrices,
        isLoading
      }
    )
  ] });
};

export { CostPriceSection as default };
