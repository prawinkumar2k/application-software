const map = {
  DRAFT: 'badge-draft', SUBMITTED: 'badge-submitted', PAID: 'badge-paid',
  VERIFIED: 'badge-verified', ALLOCATED: 'badge-allocated', REJECTED: 'badge-rejected',
  SUCCESS: 'badge-paid', FAILED: 'badge-rejected', PENDING: 'badge-draft', ABORTED: 'badge-rejected',
};

export default function StatusBadge({ status }) {
  return <span className={map[status] || 'badge-draft'}>{status}</span>;
}
