"use client"

/**
 * DEMO PAGE FOR PUBLIC PROFILE V2
 * Showcases the premium Flux design system with sample data
 */

import PublicProfileV2 from '@/views/public-profile-v2'
import { sampleProfileData } from '@/data/sample-profile'

export default function ProfileDemoPage() {
  return <PublicProfileV2 data={sampleProfileData} />
}
