<script setup lang="ts">
// WelcomeOverlay — Landing & Hero Layar Sambutan UKAI Labs OSCE Center 3D
// Mengikuti referensi visual high-end fintech/healthtech: deep violet aurora mesh,
// floating glassmorphic cards, sparkline chart, orbital avatar rings, & centerpiece 3D.
import {
  Play,
  ArrowUpRight,
  Check,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Award,
  Compass,
  X,
  Eye,
  Gamepad2,
  Joystick,
  Keyboard as KbIcon,
} from '@lucide/vue'
import type { OsceMode } from '~/stores/osce'
import { stations } from '~/data/stations'
import type { ControlScheme } from '~/composables/useControls'

const store = useOsceStore()
const emit = defineEmits<{ start: [mode: OsceMode] }>()

const chosen = ref<OsceMode>('LATIHAN')
const { scheme, setScheme } = useControls()
const controlOptions: { id: ControlScheme, label: string, desc: string, icon: unknown }[] = [
  { id: 'dpad', label: 'Tombol layar', desc: 'D-pad di pojok layar', icon: Gamepad2 },
  { id: 'joystick', label: 'Joystick analog', desc: 'Geser bebas segala arah', icon: Joystick },
  { id: 'keyboard', label: 'Keyboard', desc: 'WASD / panah (tanpa on-screen)', icon: KbIcon },
]
const showGuide = ref(false)
const guideTab = ref<'stations' | 'controls' | 'rubric'>('stations')
const peekMode = ref(false)

function onStart() {
  store.setMode(chosen.value)
  emit('start', chosen.value)
}
</script>

<template>
  <div
    class="pointer-events-auto fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto lg:overflow-hidden select-none transition-opacity duration-300"
    :class="peekMode ? 'bg-black/40 backdrop-blur-none' : 'bg-[#060312]/92 backdrop-blur-xl'"
  >
    <!-- Background Ambient Lighting / Aurora Glow Mesh -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" :class="peekMode ? 'opacity-20' : 'opacity-100'">
      <!-- Radial gradient orbs matching reference image lighting -->
      <div
        class="absolute -top-24 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-600/35 via-fuchsia-600/20 to-transparent blur-[110px]"
      />
      <div
        class="absolute -bottom-20 -left-16 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-indigo-700/30 via-violet-800/25 to-transparent blur-[120px]"
      />
      <div
        class="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/15 blur-[120px]"
      />
      <!-- Subtle geometric grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
      />
    </div>

    <!-- Top Navigation & Brand Header -->
    <header class="relative z-10 w-full px-5 py-3 sm:px-8 lg:px-12">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Award class="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-display text-sm font-extrabold tracking-wide text-white">UKAI LABS</span>
              <span class="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-semibold text-violet-300 ring-1 ring-violet-500/30">
                PRO 3D
              </span>
            </div>
            <p class="text-[11px] text-slate-400">Simulator OSCE Apoteker Indonesia</p>
          </div>
        </div>

        <!-- Center / Right Status Pills -->
        <div class="flex items-center gap-2.5">
          <div class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur-md md:flex">
            <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse-soft" />
            <span>10 Station Siap Diuji</span>
            <span class="text-white/20">|</span>
            <span class="text-violet-300 font-medium">Standar UKAI & UKOM</span>
          </div>

          <!-- Peek 3D Corridor button -->
          <button
            class="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            :class="peekMode ? 'bg-violet-600/30 border-violet-400 text-white' : ''"
            title="Sembunyikan panel untuk melihat lorong klinik 3D di belakang"
            @click="peekMode = !peekMode"
          >
            <Eye class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">{{ peekMode ? 'Kembali ke Menu' : 'Intip Koridor 3D' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Hero Body (Fit perfectly on 100vh on Desktop) -->
    <main class="relative z-10 flex flex-1 items-center px-5 py-2 sm:px-8 lg:px-12">
      <div class="mx-auto grid w-full max-w-7xl items-center gap-6 lg:grid-cols-12 lg:gap-8">
        
        <!-- Left Column: Copywriting, Mode Selector, & CTAs -->
        <div class="space-y-4 lg:col-span-7 lg:pr-3">
          <!-- Top Tag Pill (Matching Reference) -->
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 backdrop-blur-md shadow-sm">
            <span class="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-500/30 text-violet-300">
              <Sparkles class="h-3 w-3 text-violet-300" />
            </span>
            <span class="text-[11px] sm:text-xs font-medium tracking-wide text-violet-200">
              Platform Simulasi Ujian OSCE 3D Apoteker Pertama di Indonesia
            </span>
          </div>

          <!-- Headline (Modern Bold Sora Typography) -->
          <div>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Kuasai 10 Station <br />
              <span class="bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
                OSCE Apoteker 3D
              </span>
            </h1>
          </div>

          <!-- Description -->
          <p class="max-w-xl text-xs sm:text-sm lg:text-[15px] leading-relaxed text-slate-300/90 font-normal">
            Alur ujian riil standar UKOM: 1 menit waktu baca di depan pintu stasiun, 9 menit sesi konseling & interaksi prop 3D di dalam ruang, serta penilaian otomatis sesuai lembar rubrik nasional.
          </p>

          <!-- Mode Selector (Two Sleek Glass Cards) -->
          <div class="space-y-1.5 pt-0.5">
            <div class="text-[11px] font-semibold uppercase tracking-wider text-violet-300/80">
              PILIH MODE SIMULASI:
            </div>
            <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-w-xl">
              <!-- Mode: Latihan -->
              <button
                type="button"
                class="group relative flex flex-col justify-between rounded-xl p-3 text-left transition-all duration-200"
                :class="chosen === 'LATIHAN'
                  ? 'bg-violet-600/25 border-2 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'"
                @click="chosen = 'LATIHAN'"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="flex h-7 w-7 items-center justify-center rounded-lg"
                      :class="chosen === 'LATIHAN' ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-300'"
                    >
                      <Compass class="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span class="block text-xs font-bold text-white">Mode Latihan</span>
                      <span class="text-[10px] text-violet-300 font-medium">Belajar Mandiri</span>
                    </div>
                  </div>
                  <div
                    class="flex h-4.5 w-4.5 items-center justify-center rounded-full border transition"
                    :class="chosen === 'LATIHAN' ? 'border-violet-400 bg-violet-500 text-white' : 'border-white/20 bg-transparent'"
                  >
                    <Check v-if="chosen === 'LATIHAN'" class="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-300/80">
                  Bebas pilih stasiun, lewati waktu baca, dan teleport antar ruangan sesuka hati.
                </p>
              </button>

              <!-- Mode: Simulasi Penuh -->
              <button
                type="button"
                class="group relative flex flex-col justify-between rounded-xl p-3 text-left transition-all duration-200"
                :class="chosen === 'SIMULASI'
                  ? 'bg-violet-600/25 border-2 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'"
                @click="chosen = 'SIMULASI'"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="flex h-7 w-7 items-center justify-center rounded-lg"
                      :class="chosen === 'SIMULASI' ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-300'"
                    >
                      <ShieldCheck class="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span class="block text-xs font-bold text-white">Simulasi Penuh</span>
                      <span class="text-[10px] text-fuchsia-300 font-medium">Standar UKAI / UKOM</span>
                    </div>
                  </div>
                  <div
                    class="flex h-4.5 w-4.5 items-center justify-center rounded-full border transition"
                    :class="chosen === 'SIMULASI' ? 'border-violet-400 bg-violet-500 text-white' : 'border-white/20 bg-transparent'"
                  >
                    <Check v-if="chosen === 'SIMULASI'" class="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-300/80">
                  Rangkaian 10 stasiun berurutan tanpa jeda, dengan batasan waktu 1+9 menit ketat.
                </p>
              </button>
            </div>
          </div>

          <!-- Control Scheme Selector -->
          <div class="space-y-1.5 pt-0.5">
            <div class="text-[11px] font-semibold uppercase tracking-wider text-violet-300/80">
              PILIH KONTROL:
            </div>
            <div class="grid max-w-xl grid-cols-3 gap-2">
              <button
                v-for="opt in controlOptions" :key="opt.id"
                class="rounded-xl p-2.5 text-left transition-all duration-200"
                :class="scheme === opt.id
                  ? 'bg-violet-600/25 border-2 border-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.3)]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'"
                @click="setScheme(opt.id)"
              >
                <div class="flex items-center gap-1.5">
                  <component :is="opt.icon" class="h-3.5 w-3.5" :class="scheme === opt.id ? 'text-violet-300' : 'text-slate-400'" />
                  <span class="text-[11px] font-bold text-white">{{ opt.label }}</span>
                </div>
                <p class="mt-1 text-[10px] leading-snug text-slate-400">{{ opt.desc }}</p>
              </button>
            </div>
            <p class="text-[10px] text-slate-500">Bisa diganti kapan pun lewat tombol <b class="text-slate-400">Menu</b>. Keyboard WASD selalu aktif di semua mode.</p>
          </div>

          <!-- Action Buttons (Matching Image 2 Reference Style) -->
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <!-- Primary White Pill Button -->
            <button
              class="group flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.25)] transition duration-200 hover:scale-[1.03] hover:bg-slate-100 active:scale-[0.98]"
              @click="onStart"
            >
              <span>Mulai Ujian Sekarang</span>
              <ArrowUpRight class="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <!-- Secondary Glass Pill with Play Icon -->
            <button
              class="flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-5 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition duration-200 hover:border-white/35 hover:bg-white/10"
              @click="showGuide = true"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/35 text-violet-200 shadow-sm">
                <Play class="h-3 w-3 fill-current ml-0.5" />
              </span>
              <span>Panduan 10 Station</span>
            </button>
          </div>

          <!-- Keyboard & Mouse Controls Bar -->
          <div class="pt-0.5">
            <div class="inline-flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
              <span class="font-semibold text-violet-300">Kontrol:</span>
              <kbd class="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">WASD</kbd>
              <span>jalan</span>
              <span class="text-white/20">·</span>
              <kbd class="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">Mouse</kbd>
              <span>lihat sekeliling</span>
              <span class="text-white/20">·</span>
              <kbd class="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">Klik / E</kbd>
              <span>interaksi prop & resep</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Visual Showcase Matching Image 2 Reference -->
        <div class="relative flex items-center justify-center lg:col-span-5">
          <!-- Background Arch Portal Frame -->
          <div class="relative w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[400px]">
            <!-- Outer Glow Behind Arch -->
            <div class="absolute -inset-2.5 rounded-t-[190px] rounded-b-2xl bg-gradient-to-b from-violet-500/30 via-indigo-500/20 to-transparent blur-xl" />

            <!-- Arch Border Container -->
            <div class="relative overflow-hidden rounded-t-[170px] rounded-b-2xl border border-white/20 bg-gradient-to-b from-white/15 via-violet-950/25 to-black/60 p-3 sm:p-3.5 shadow-2xl backdrop-blur-md">
              <!-- Center 3D Illustration: Pharmacist Hands with Medical Tablet & Medicine Bottle -->
              <div class="relative overflow-hidden rounded-t-[150px] rounded-b-xl border border-white/15 shadow-inner">
                <img
                  src="/images/hero_device.jpg"
                  alt="3D Prescription Tablet & OSCE Props"
                  class="h-[300px] sm:h-[330px] lg:h-[350px] w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <!-- Subtle reflective gradient overlay on image -->
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/10" />
              </div>
            </div>

            <!-- Floating Glassmorphic Metric Card 1 (Top Left, like "Profit And Loss $682.5" in ref image) -->
            <div
              class="animate-float absolute -top-3 -left-4 z-20 w-44 rounded-xl border border-white/20 bg-slate-900/85 p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:-left-6 sm:w-48 sm:p-3"
            >
              <div class="flex items-center justify-between text-[10px] font-medium text-slate-300">
                <span>Rapor Evaluasi</span>
                <span class="rounded bg-violet-500/20 px-1.5 py-0.5 text-[9px] text-violet-300 font-semibold">Target A</span>
              </div>
              <div class="mt-0.5 flex items-baseline gap-1.5">
                <span class="font-display text-xl sm:text-2xl font-bold text-white">88.5</span>
                <span class="text-[10px] text-emerald-400 font-semibold">✓ Lulus UKAI</span>
              </div>
              <p class="text-[9px] text-slate-400">Passing grade 70 · 10 Station</p>

              <!-- Glowing SVG Sparkline Wave Chart -->
              <div class="mt-1.5 h-8 w-full overflow-hidden">
                <svg viewBox="0 0 100 35" class="h-full w-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.5" />
                      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,28 Q15,22 30,24 T60,12 T85,15 T100,6 L100,35 L0,35 Z"
                    fill="url(#chartGradient2)"
                  />
                  <path
                    d="M0,28 Q15,22 30,24 T60,12 T85,15 T100,6"
                    fill="none"
                    stroke="#a78bfa"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                  <circle cx="100" cy="6" r="3" fill="#ffffff" class="animate-pulse" />
                </svg>
              </div>
            </div>

            <!-- Floating Glassmorphic Card 2 (Top Right, like "Quick Transfer" in ref image) -->
            <div
              class="animate-float-delayed absolute -top-1 -right-3 z-20 w-38 sm:w-42 rounded-xl border border-white/20 bg-slate-900/85 p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:-right-6"
            >
              <div class="flex items-center justify-between text-[10px] font-semibold text-slate-300">
                <span>Stasiun 01</span>
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
              <div class="mt-1 rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10">
                <span class="block text-[10px] font-semibold text-white">Konseling Asma</span>
                <span class="text-[9px] text-violet-300">MDI & Peak Flow</span>
              </div>
              <div class="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
                <span>Waktu Sesi</span>
                <span class="font-mono text-white font-semibold">10:00 mnt</span>
              </div>
            </div>

            <!-- Concentric Orbital Rings with Floating Avatars (Center-Bottom, matching ref image!) -->
            <div class="pointer-events-none absolute -bottom-4 -left-4 z-20 flex items-center justify-center sm:-bottom-6 sm:-left-8">
              <!-- Outer Orbital Circle -->
              <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-violet-400/30 bg-violet-950/35 p-1.5 backdrop-blur-md shadow-lg">
                <!-- Inner Orbital Circle -->
                <div class="flex h-14 w-14 items-center justify-center rounded-full border border-violet-300/40 bg-violet-600/30">
                  <Award class="h-5 w-5 text-violet-200" />
                </div>

                <!-- Avatar 1 (Top, Evaluator Doctor) -->
                <div
                  class="absolute -top-3 -right-0.5 h-8 w-8 overflow-hidden rounded-full border-2 border-white/80 shadow-md"
                  title="Apt. Sarah, M.Clin.Pharm (Penguji)"
                  style="background-image: url('/images/avatars.jpg'); background-size: 200% 200%; background-position: 0% 0%;"
                />

                <!-- Avatar 2 (Left, Patient) -->
                <div
                  class="absolute -left-3 top-1/2 -translate-y-1/2 h-7.5 w-7.5 overflow-hidden rounded-full border-2 border-white/80 shadow-md"
                  title="Ny. Ratna (Pasien Simulasi)"
                  style="background-image: url('/images/avatars.jpg'); background-size: 200% 200%; background-position: 0% 100%;"
                />

                <!-- Avatar 3 (Bottom, Candidate Student) -->
                <div
                  class="absolute -bottom-1.5 right-1/4 h-7 w-7 overflow-hidden rounded-full border-2 border-emerald-400 shadow-md"
                  title="Peserta 001 (Anda)"
                  style="background-image: url('/images/avatars.jpg'); background-size: 200% 200%; background-position: 100% 100%;"
                />
              </div>
            </div>

            <!-- Floating Activity Pill (Bottom Right, like "Received from Michael V" in ref image) -->
            <div
              class="animate-float-reverse absolute -bottom-2 -right-3 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-3 py-1.5 shadow-xl backdrop-blur-xl sm:-right-5"
            >
              <div
                class="h-6 w-6 rounded-full border border-white/60"
                style="background-image: url('/images/avatars.jpg'); background-size: 200% 200%; background-position: 100% 0%;"
              />
              <div class="text-left leading-tight">
                <span class="block text-[10px] font-bold text-white">Rubrik Dinilai</span>
                <span class="text-[9px] text-slate-300">Penguji: dr. Miller ✓</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>

    <!-- Bottom Footer -->
    <footer class="relative z-10 w-full px-5 py-2.5 sm:px-8 lg:px-12 text-center">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div>
          <span>UKAI LABS © 2026</span>
          <span class="mx-2 text-white/20">·</span>
          <span>Simulator Uji Kompetensi Apoteker Indonesia</span>
        </div>
        <div class="flex items-center gap-3">
          <button class="hover:text-white transition" @click="showGuide = true">Panduan Penggunaan</button>
          <span class="text-white/20">·</span>
          <span>Versi 1.0 (WebGL 3D)</span>
        </div>
      </div>
    </footer>

    <!-- Interactive Guide Modal -->
    <div
      v-if="showGuide"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div class="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          @click="showGuide = false"
        >
          <X class="h-4.5 w-4.5" />
        </button>

        <!-- Modal Header -->
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
            <BookOpen class="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 class="font-display text-lg font-bold text-white">Panduan Ujian OSCE Apoteker 3D</h2>
            <p class="text-[11px] text-slate-400">Struktur simulasi, kontrol interaksi, dan sistem penilaian rubrik</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="mt-5 flex border-b border-white/10 pb-2">
          <button
            class="px-3.5 py-1.5 text-xs font-semibold transition"
            :class="guideTab === 'stations' ? 'border-b-2 border-violet-400 text-white' : 'text-slate-400 hover:text-white'"
            @click="guideTab = 'stations'"
          >
            10 Station Ujian
          </button>
          <button
            class="px-3.5 py-1.5 text-xs font-semibold transition"
            :class="guideTab === 'controls' ? 'border-b-2 border-violet-400 text-white' : 'text-slate-400 hover:text-white'"
            @click="guideTab = 'controls'"
          >
            Kontrol 3D & Gerak
          </button>
          <button
            class="px-3.5 py-1.5 text-xs font-semibold transition"
            :class="guideTab === 'rubric' ? 'border-b-2 border-violet-400 text-white' : 'text-slate-400 hover:text-white'"
            @click="guideTab = 'rubric'"
          >
            Rubrik Penilaian
          </button>
        </div>

        <!-- Tab 1: 10 Station -->
        <div v-if="guideTab === 'stations'" class="mt-3.5 max-h-64 overflow-y-auto pr-2 space-y-2">
          <div
            v-for="st in stations"
            :key="st.id"
            class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5"
          >
            <div class="flex items-center gap-2.5">
              <span class="rounded-lg bg-violet-600/40 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-300">
                {{ st.id }}
              </span>
              <div>
                <h4 class="text-xs font-bold text-white">{{ st.title }}</h4>
                <p class="text-[11px] text-slate-400">{{ st.topic }}</p>
              </div>
            </div>
            <span class="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
              {{ st.category }}
            </span>
          </div>
        </div>

        <!-- Tab 2: Controls -->
        <div v-if="guideTab === 'controls'" class="mt-3.5 space-y-2.5">
          <div class="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-300">Berjalan di Koridor & Masuk Ruang:</span>
              <div class="flex gap-1">
                <kbd class="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">W</kbd>
                <kbd class="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">A</kbd>
                <kbd class="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">S</kbd>
                <kbd class="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">D</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-300">Melihat Sekeliling / Rotasi Kamera:</span>
              <span class="font-mono text-[11px] text-violet-300">Geser Mouse</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-300">Inspeksi Prop & Buka Dokumen Resep:</span>
              <span class="font-mono text-[11px] text-violet-300">Klik Objek Meja</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-300">Aksi Prosedur & Tutup Dokumen:</span>
              <kbd class="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">E</kbd>
            </div>
          </div>
        </div>

        <!-- Tab 3: Rubric -->
        <div v-if="guideTab === 'rubric'" class="mt-3.5 space-y-2.5">
          <div class="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong class="text-white">Kriteria Kelulusan:</strong> Nilai ambang batas lulus (passing grade) adalah <span class="text-emerald-400 font-bold">70 dari 100</span> per stasiun.
            </p>
            <p>
              <strong class="text-white">Komponen Rubrik:</strong> Penggalian informasi medis, skrining administratif & farmasetis, pemilihan obat yang tepat, teknik penggunaan alat (MDI/Insulin), serta komunikasi & konseling etis.
            </p>
            <p>
              <strong class="text-white">Rapor Evaluasi:</strong> Hasil detail setiap stasiun akan ditampilkan secara otomatis setelah ke-10 stasiun selesai disimulasikan.
            </p>
          </div>
        </div>

        <!-- Modal Footer CTA -->
        <div class="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <button
            class="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            @click="showGuide = false"
          >
            Tutup
          </button>
          <button
            class="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500"
            @click="showGuide = false; onStart()"
          >
            <span>Mulai Ujian</span>
            <ArrowUpRight class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
