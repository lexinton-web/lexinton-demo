'use client'

import { motion } from 'framer-motion'
import { testimonials } from '@/lib/properties'

const ease = [0.22, 1, 0.36, 1] as const

export default function TestimonialsSection() {
  return (
    <section className="bg-[#f5f5f5] py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 sm:mb-18"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="w-6 h-px bg-gray-300" />
            <span className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-gray-500">
              Testimonios
            </span>
          </div>
          <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal text-gray-900 leading-[1.12] tracking-[-0.01em]">
            Lo que dicen quienes<br />
            <em className="italic text-gray-500">confiaron en nosotros.</em>
          </h2>
        </motion.div>

        {/* Quotes grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease, delay: i * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-8 sm:p-10 flex flex-col"
            >
              {/* Large quote glyph */}
              <span className="font-serif text-[4.5rem] text-[#C41230]/20 leading-none mb-4 select-none">&ldquo;</span>

              {/* Quote text */}
              <blockquote className="text-[14.5px] text-gray-600 leading-[1.85] italic flex-1 mb-8">
                {t.text}
              </blockquote>

              {/* Author */}
              <footer className="pt-5 border-t border-gray-200">
                <p className="text-[13px] font-semibold text-gray-900">{t.name}</p>
                <p className="text-[11px] text-gray-500 tracking-[0.06em] mt-0.5">{t.source}</p>
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
