'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeInUp, viewportOnce } from '@/lib/animations'

interface PageHeroProps {
  label: string
  title: string
  /** Optional italic subtitle portion */
  titleEmphasis?: string
  description?: string
  /** Show /hero-poster.jpg parallax bg like TasarHero */
  withImage?: boolean
  /** Custom background image path (overrides withImage) */
  backgroundImage?: string
}

export default function PageHero({ label, title, titleEmphasis, description, withImage, backgroundImage }: PageHeroProps) {
  const bgSrc = backgroundImage || (withImage ? '/hero-poster.jpg' : null)
  return (
    <section className="bg-[#f5f5f5] border-b border-gray-200 pt-[calc(68px+4rem)] pb-20 sm:pt-[calc(68px+6rem)] sm:pb-28 relative overflow-hidden">
      {/* Optional background image */}
      {bgSrc && (
        <div className="absolute inset-0 pointer-events-none">
          <Image src={bgSrc} fill alt="" className="object-cover opacity-30" sizes="100vw" quality={75} priority />
        </div>
      )}
      {/* Subtle light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/40" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#C41230] mb-5"
        >
          {label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-serif text-[clamp(2.2rem,5vw,4rem)] font-normal text-gray-900 leading-[1.1] tracking-[-0.01em] mb-6 max-w-2xl"
        >
          {title}
          {titleEmphasis && (
            <>
              <br />
              <em className="italic text-gray-500">{titleEmphasis}</em>
            </>
          )}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="text-[16px] text-gray-600 leading-[1.85] max-w-xl"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  )
}
