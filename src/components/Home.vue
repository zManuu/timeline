<template>
  <div class="w-screen h-screen flex justify-center items-center text-white">
    <div class="absolute right-2 bottom-2 flex justify-center gap-2">
      <!-- CONTROLS -->
      <icon
        icon="arrow-left"
        v-tooltip="'Nach links scrollen'"
        @click="scroll(-1)"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer" />
      <icon
        icon="arrow-right"
        v-tooltip="'Nach rechts scrollen'"
        @click="scroll(1)"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer" />
    </div>
    <div class="absolute z-10">
      <!-- ZEITSTRAHL -->
      <div class="w-screen h-0.5 bg-white flex justify-between">
        <div
          v-for="(time, index) in getVisibleYears()"
          :key="index">
          <h1>{{ stringify(time) }}</h1>
        </div>
      </div>
    </div>
    <div class="absolute z-50">
      <!-- ENTRIES -->
      <div
        v-for="(entry, index) in getVisibleEntries()"
        :key="index"
        class="bg-gray-600 border-gray-500 border-2 p-3 rounded flex flex-col gap-1">
        <h1 class="font-semibold">
          <icon
            v-if="entry.icon"
            :icon="entry.icon" />
          {{ entry.title }}
        </h1>
        <h1>{{ entry.comment }}</h1>
      </div>
    </div>
  </div>
</template>
<script lang="ts">

const DEBUG = true
const YEAR = 31_536_000_000
const RIGHT_END_OFFSET = YEAR * 10
const TIME = new Date().getTime()

import { defineComponent } from 'vue'
import { debugEntries } from '../utils/debugEntries'
import * as fontawesome from '../utils/fontawesome'
import { generateItems } from '../utils/generator'

export default defineComponent({
  data() {
    return {
      entries: [] as IEntry[],
      leftEnd: TIME - Date.parse('1970-02-02')
    }
  },
  methods: {
    getRightEnd(): number {
      return this.leftEnd + RIGHT_END_OFFSET
    },
    isVisible(entry: IEntry) {
      return (entry.timeStamp > this.leftEnd) && (entry.timeStamp < this.getRightEnd())
    },
    getVisibleEntries(): IEntry[] {
      return this.entries.filter(e => this.isVisible(e))
    },
    scroll(years: number) {
      this.leftEnd += years * YEAR
    },
    getVisibleYears(): number[] {
      return generateItems(11, i => {
        return this.leftEnd + i * YEAR
      })
    },
    stringify(timeStamp: number) {
      return new Date(timeStamp).getFullYear()
    }
  },
  watch: {
    entries(val: IEntry[]) {
      for (const entry of val) {
        if (!entry.icon) continue
        fontawesome.importIcon(entry.icon)
      }
    }
  },
  mounted() {
    fontawesome.importIcon('arrowLeft')
    fontawesome.importIcon('arrowRight')

    if (DEBUG) {
      this.entries = debugEntries
    }
  }
})
</script>
