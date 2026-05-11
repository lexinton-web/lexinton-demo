import Link from 'next/link'
import Image from 'next/image'
import { LinkedInIcon, InstagramIcon, FacebookIcon, YouTubeIcon } from '@/components/icons/social'

const officeLinks = [
  {
    label: 'Palermo',
    address: 'Migueletes 1180, CABA',
    phone: '011 4776-5003',
    href: 'tel:01147765003',
  },
  {
    label: 'Vicente López',
    address: 'Madero 381, Vicente López',
    phone: '11 3151-9928',
    href: 'tel:01131519928',
  },
]

const links = [
  { label: 'Propiedades en venta', href: '/propiedades?operation=Sale' },
  { label: 'Alquileres', href: '/propiedades?operation=Rent' },
  { label: 'Emprendimientos', href: '/emprendimientos' },
  { label: 'Inversores', href: '/inversor' },
  { label: 'Tasar mi inmueble', href: '/tasar' },
  { label: 'Quiero vender', href: '/quiero-vender' },
  { label: 'Contacto', href: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logos/lexinton-logo-original.svg"
                alt="Lexinton Propiedades"
                width={187}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-[13px] text-gray-500 leading-[1.8] mb-5 max-w-[220px]">
              20 años asesorando a familias en compra, venta y operaciones simultáneas en CABA y GBA.
            </p>
            <a
              href="mailto:info@lexinton.com.ar"
              className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              info@lexinton.com.ar
            </a>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.linkedin.com/company/lexinton-propiedades/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/lexintonpropiedades/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/LexintonPropiedadesOficial" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@LexintonPropiedades" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-gray-700 transition-colors duration-200">
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400 mb-5">
              Servicios
            </h4>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400 mb-5">
              Sucursales
            </h4>
            <div className="space-y-6">
              {officeLinks.map((o) => (
                <div key={o.label}>
                  <p className="text-[12px] font-semibold text-gray-700 mb-1">{o.label}</p>
                  <p className="text-[12px] text-gray-500">{o.address}</p>
                  <a
                    href={o.href}
                    className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors duration-200 mt-0.5 inline-block"
                  >
                    {o.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
          <span>© {new Date().getFullYear()} Lexinton Propiedades. Todos los derechos reservados.</span>
          <a
            href="https://wa.me/5491131519928"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}
