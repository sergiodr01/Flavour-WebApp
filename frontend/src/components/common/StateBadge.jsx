export default function StateBadge({ state }) {
  return <span className={`badge badge-${state}`}>{state}</span>;
}
