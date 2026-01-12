"use client"

import { redirect } from 'next/navigation'

export default function GetStarted() {
  redirect('/auth')
}

