import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

/** Breadcrumb trail; the last crumb (no `to`) is the current page. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
