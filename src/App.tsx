import { useEffect, useMemo, useState } from "react";
import { filterPayments, payments, summarize, type PaymentStatus } from "./domain/payments";
import { toCsv } from "./domain/csv";
import { DEFAULT_FILTERS, paginate, parseFilters, segmentRisk, serializeFilters, type PaymentFilters } from "./domain/query";
import { loadSavedViews, makeSavedView, persistSavedViews, type SavedView } from "./domain/savedViews";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function App() {
  const [filters, setFilters] = useState<PaymentFilters>(() => parseFilters(window.location.search));
  const [announce, setAnnounce] = useState("");
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => loadSavedViews());
  const filteredRows = useMemo(() => filterPayments(payments, filters.query, filters.status), [filters.query, filters.status]);
  const page = useMemo(() => paginate(filteredRows, filters.page, filters.pageSize), [filteredRows, filters.page, filters.pageSize]);
  const totals = useMemo(() => summarize(filteredRows), [filteredRows]);
  const risk = useMemo(() => segmentRisk(filteredRows), [filteredRows]);

  useEffect(() => {
    const next = serializeFilters(filters);
    window.history.replaceState(null, "", next || window.location.pathname);
  }, [filters]);

  const update = (patch: Partial<PaymentFilters>) => setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  const exportCsv = () => {
    const blob = new Blob([toCsv(filteredRows, ["id", "merchant", "customer", "amount", "currency", "status", "createdAt", "riskScore"])], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "payments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setAnnounce(`Exported ${filteredRows.length} payments as CSV.`);
  };
  const saveView = () => { const name = window.prompt("Name this saved view"); if (!name?.trim()) return; const next = [makeSavedView(name, filters), ...savedViews.filter((view) => view.name.toLowerCase() !== name.trim().toLowerCase())]; setSavedViews(next); persistSavedViews(next); setAnnounce(`Saved view ${name.trim()}.`); };
  const selectView = (id: string) => { const view = savedViews.find((entry) => entry.id === id); if (view) update(view.filters); };

  return <div className="shell">
    <a className="skip" href="#main">Skip to content</a>
    <header className="topbar">
      <div><p className="eyebrow">CLEARPAY ANALYTICS</p><h1>Payment operations, made legible.</h1><p className="muted">A keyboard-first view of transaction health and settlement risk.</p></div>
      <button className="secondary" onClick={exportCsv}>Export visible CSV</button>
    </header>
    <main id="main">
      <section className="metrics" aria-label="Payment summary">
        <article><span>Total visible</span><strong>{totals.count}</strong></article>
        <article><span>Gross volume</span><strong>{currency.format(totals.gross)}</strong></article>
        <article><span>Settled volume</span><strong>{currency.format(totals.settled)}</strong></article>
        <article><span>Failures</span><strong>{totals.failures}</strong></article>
      </section>
      <section className="panel" aria-labelledby="transactions-title">
        <div className="panel-head">
          <div><h2 id="transactions-title">Transactions</h2><p className="muted">Search state is shareable through the URL.</p></div>
          <div className="filters">
            <label>Saved view<select aria-label="Saved view" defaultValue="" onChange={(event) => selectView(event.target.value)}><option value="">Choose a saved view</option>{savedViews.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}</select></label>
            <button className="secondary" onClick={saveView}>Save current view</button>
            <label>Search<input value={filters.query} onChange={(event) => update({ query: event.target.value })} placeholder="e.g. Northwind" /></label>
            <label>Status<select value={filters.status} onChange={(event) => update({ status: event.target.value as PaymentFilters["status"] })}><option value="all">All statuses</option><option value="settled">Settled</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label>
            <label>Rows<select value={filters.pageSize} onChange={(event) => update({ pageSize: Number(event.target.value) })}><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></label>
          </div>
        </div>
        <div className="muted" aria-label="Risk distribution">Risk distribution: low {risk.low}, medium {risk.medium}, high {risk.high}</div>
        <div className="table-wrap"><table><caption className="sr-only">Payment transactions filtered by search and status</caption><thead><tr><th scope="col">Payment</th><th scope="col">Customer</th><th scope="col">Merchant</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col">Risk</th><th scope="col">Created</th></tr></thead>
          <tbody>{page.rows.length ? page.rows.map((row) => <tr key={row.id}><th scope="row"><span className="mono">{row.id}</span></th><td>{row.customer}</td><td>{row.merchant}</td><td>{currency.format(row.amount)}</td><td><span className={`badge ${row.status}`}>{row.status}</span></td><td><span aria-label={`Risk score ${row.riskScore} out of 100`}>{row.riskScore}/100</span></td><td><time dateTime={row.createdAt}>{new Date(row.createdAt).toLocaleDateString()}</time></td></tr>) : <tr><td colSpan={7} className="empty">No transactions match those filters.</td></tr>}</tbody>
        </table></div>
        <nav aria-label="Transaction pages" className="pagination"><button className="secondary" disabled={page.currentPage === 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</button><span>Page {page.currentPage} of {page.totalPages} · {page.totalRows} rows</span><button className="secondary" disabled={page.currentPage === page.totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</button></nav>
      </section>
    </main>
    <div className="sr-only" aria-live="polite">{announce}</div>
    <footer><span>Demo data only · WCAG 2.2 AA target</span><span>URL filters persist across refreshes</span></footer>
  </div>;
}
export default App;

