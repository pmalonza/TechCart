import { formatAddressLines, type Address } from '../lib/addresses'

/** Read-only display of an address (name, street, city/region/postcode, country, phone). */
export default function AddressLines({ address }: { address: Pick<Address, 'fullName' | 'line1' | 'line2' | 'city' | 'region' | 'postalCode' | 'country' | 'phone'> }) {
  return (
    <address className="address-lines">
      {formatAddressLines(address).map((line, index) => (
        <span key={index}>{line}</span>
      ))}
      {address.phone && <span className="muted">{address.phone}</span>}
    </address>
  )
}
