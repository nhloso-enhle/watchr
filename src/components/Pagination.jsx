export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8 mb-2">
      <button
        onClick={() => onPage(1)}
        disabled={page === 1}
        className="btn btn-ghost"
        style={{ padding: '7px 12px', fontSize: '0.8rem', opacity: page === 1 ? 0.4 : 1 }}
      >
        «
      </button>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn btn-ghost"
        style={{ padding: '7px 14px', fontSize: '0.85rem', opacity: page === 1 ? 0.4 : 1 }}
      >
        ← Prev
      </button>

      <span style={{ color: 'var(--text-2)', fontSize: '0.875rem', minWidth: '90px', textAlign: 'center' }}>
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="btn btn-ghost"
        style={{ padding: '7px 14px', fontSize: '0.85rem', opacity: page === totalPages ? 0.4 : 1 }}
      >
        Next →
      </button>
      <button
        onClick={() => onPage(totalPages)}
        disabled={page === totalPages}
        className="btn btn-ghost"
        style={{ padding: '7px 12px', fontSize: '0.8rem', opacity: page === totalPages ? 0.4 : 1 }}
      >
        »
      </button>
    </div>
  );
}
