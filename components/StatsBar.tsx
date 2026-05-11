'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/AnimatedCounter'

const ease = [0.22, 1, 0.36, 1] as const

const items = [
  { value: '20', suffix: '', label: 'años de trayectoria', numeric: true, end: 20 },
  { value: '+5.000', suffix: '', label: 'clientes acompañados', numeric: true, end: 5000 },
  { value: null, label: 'Especialistas en\noperaciones simultáneas', numeric: false },
  { value: null, label: 'Palermo\ny zona norte', numeric: false },
]

export default function CredibilityBar() {
  return (
    <section className="bg-[#f5f5f5] border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className="px-6 sm:px-10 py-2 text-center first:pl-0 last:pr-0"
            >
              {item.numeric ? (
                <span className="block font-serif text-[clamp(2rem,4vw,3rem)] font-normal text-gray-900 leading-none mb-2">
                  {item.end === 5000
                    ? <><span className="text-[0.6em] mr-0.5 align-middle">+</span><AnimatedCounter end={5000} /></>
                    : <AnimatedCounter end={item.end!} />
                  }
                </span>
              ) : (
                <span className="block font-serif text-[clamp(1rem,2vw,1.4rem)] font-normal text-gray-900 leading-tight mb-2 whitespace-pre-line italic">
                  {item.label.split('\n')[0]}
                </span>
              )}
              <span className="block text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-gray-500 font-medium leading-snug">
                {item.numeric ? item.label : item.label.split('\n')[1] ?? ''}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

