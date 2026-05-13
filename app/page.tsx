import HeroSection from '@/components/HeroSection'
import { DevelopmentsCarousel } from '@/components/DevelopmentsCarousel'
import { getDevelopments } from '@/lib/tokko/queries'
import dynamic from 'next/dynamic'

// Off-screen sections — lazy loaded to defer Framer Motion initialization
const TasacionCTA = dynamic(
  () => import('@/components/home/TasacionCTA').then(m => ({ default: m.TasacionCTA })),
  { ssr: false, loading: () => <div className="h-64 bg-[#f5f5f5]" /> }
)
const TrustStrip = dynamic(
  () => import('@/components/home/TrustStrip').then(m => ({ default: m.TrustStrip })),
  { ssr: false, loading: () => <div className="h-32 bg-white" /> }
)
const MetodoSection = dynamic(
  () => import('@/components/MetodoSection'),
  { ssr: false, loading: () => <div className="h-64 bg-[#f5f5f5]" /> }
)
const FeaturedProperties = dynamic(
  () => import('@/components/FeaturedProperties'),
  { ssr: false, loading: () => <div className="h-64 bg-white" /> }
)
const TestimonialsSection = dynamic(
  () => import('@/components/home/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })),
  { ssr: false, loading: () => <div className="h-48 bg-[#f5f5f5]" /> }
)
const DualCTA = dynamic(
  () => import('@/components/home/DualCTA').then(m => ({ default: m.DualCTA })),
  { ssr: false, loading: () => <div className="h-64 bg-white" /> }
)
const HomeContactCTA = dynamic(
  () => import('@/components/home/HomeContactCTA').then(m => ({ default: m.HomeContactCTA })),
  { ssr: false, loading: () => <div className="h-48 bg-[#f5f5f5]" /> }
)

export default async function HomePage() {
  const developments = await getDevelopments().catch(() => [])

  return (
    <main>
      <HeroSection />
      <DevelopmentsCarousel developments={developments} />
      <TasacionCTA />
      <TrustStrip />
      <MetodoSection />
      <FeaturedProperties />
      <TestimonialsSection />
      <DualCTA />
      <HomeContactCTA />
    </main>
  )
}

