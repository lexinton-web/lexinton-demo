'use client'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

export function TrustStrip() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] font-medium mb-3">
            Socios estratégicos
          </p>
          <h2 className="text-2xl md:text-3xl font-light text-gray-900">
            Presentes donde están los compradores
          </h2>
        </motion.div>

        {/* Grid de logos de portales y plataformas */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
          {[
            { name: 'Zonaprop', color: '#FF6600' },
            { name: 'Argenprop', color: '#00A651' },
            { name: 'Google Ads', icon: 'logos:google' },
            { name: 'Meta', icon: 'logos:meta-icon' },
            { name: 'Instagram', icon: 'skill-icons:instagram' },
            { name: 'Tokko Broker', color: '#111' },
          ].map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center justify-center h-16"
            >
              {partner.icon ? (
                <Icon icon={partner.icon} className="w-10 h-10" />
              ) : (
                <span className="text-lg font-semibold" style={{ color: partner.color }}>
                  {partner.name}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Barra de stats inline debajo */}
        <div className="mt-12 flex flex-wrap justify-center items-center
          gap-8 md:gap-14 pt-10 border-t border-gray-100">
          <Stat value="20+" label="años de trayectoria" />
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <Stat value="5.000+" label="clientes" />
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <Stat value="N°1" label="operaciones simultáneas" />
        </div>

      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl md:text-3xl font-light text-[#C41230]">
        {value}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </span>
    </div>
  )
}
