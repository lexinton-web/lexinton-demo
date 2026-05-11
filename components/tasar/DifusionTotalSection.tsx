'use client'

import { motion } from 'framer-motion'
import {
  InstagramLogo,
  FacebookLogo,
  GoogleLogo,
  ZonapropLogo,
  ArgenpropLogo,
  MetaVideoLogo,
} from '@/components/icons/channel-logos'
import { EASE } from '@/lib/motion'

const channels = [
  {
    name: 'Zonaprop',
    copy: 'El portal donde el 70% de los compradores activos empieza su búsqueda',
    Logo: ZonapropLogo,
  },
  {
    name: 'Argenprop',
    copy: 'Segunda audiencia más grande del mercado inmobiliario argentino',
    Logo: ArgenpropLogo,
  },
  {
    name: 'Instagram Ads',
    copy: 'Campañas con foto y video de tu propiedad, segmentadas por zona y poder adquisitivo',
    Logo: InstagramLogo,
  },
  {
    name: 'Facebook Ads',
    copy: 'Alcance a compradores de 35-60 años en Palermo, Belgrano y zona norte',
    Logo: FacebookLogo,
  },
  {
    name: 'Google Ads',
    copy: 'Tu propiedad aparece primero cuando alguien busca “departamento en venta Palermo”',
    Logo: GoogleLogo,
  },
  {
    name: 'Meta Video Ads',
    copy: 'Recorrido virtual en video, con distribución paga a audiencias calificadas',
    Logo: MetaVideoLogo,
  },
]

/** Custom logo card variants — staggered “light up” entrance */
const logoVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: EASE,
    },
  }),
}

export default function DifusionTotalSection() {
  return (
    <section className="py-24 bg-[#f5f5f5]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] font-medium mb-3">
            DIFUSIÓN TOTAL
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            Publicamos donde vive
            <br />
            el comprador de tu barrio
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-2xl mx-auto mt-6">
            Cada propiedad de Lexinton se publica simultáneamente en los portales con mayor
            tráfico de Argentina y se activan campañas pagas segmentadas por zona.
          </p>
        </motion.div>

        {/* Grid de canales — cards con fondo oscuro diferenciado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {channels.map(({ name, copy, Logo }, i) => (
            <motion.div
              key={name}
              custom={i}
              variants={logoVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="group bg-white border border-gray-200 rounded-2xl p-6
                hover:border-gray-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Logo en contenedor blanco */}
                <div className="w-14 h-14 flex-shrink-0 bg-white rounded-xl
                  flex items-center justify-center">
                  <Logo size={40} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium mb-1">{name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{copy}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
