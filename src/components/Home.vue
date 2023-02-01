<template>
  <!-- <h1 class="text-white">{{ zoomLevel }}</h1> -->
  <Notifications ref="notifications" />
  <div
    v-if="createSection"
    class="z-[70] absolute bottom-5 left-5 w-[15rem] bg-gray-600 border-gray-500 border-2 rounded p-3 text-white flex flex-col gap-1">
    <!-- CREATE -->
    <h1>Eintrag erstellen</h1>
    <input
      class="input w-full"
      placeholder="Titel"
      type="text"
      v-model="input_title" />
    <textarea
      class="input w-full resize-none h-[10rem]"
      placeholder="Text"
      v-model="input_comment">
    </textarea>
    <input
      class="input w-full"
      placeholder="Titel"
      type="date"
      v-model="input_date" />
    <input
      type="submit"
      class="border-2 w-full rounded py-2"
      value="Bestätigen"
      @click="create"
      :class="isCreateFormValid() ? 'bg-green-500 border-green-600 cursor-pointer hover:bg-green-600 hover:border-green-500 transition duration-300' : 'bg-gray-500 border-gray-400 cursor-not-allowed'" />
  </div>
  <div class="w-screen h-screen flex justify-center items-center text-white select-none">
    <div class="absolute right-2 bottom-2 flex justify-center gap-2">
      <!-- CONTROLS -->
      <icon
        icon="plus"
        v-tooltip="'Eintrag erstellen'"
        @click="toggleCreateSection"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <div
        class="p-3 flex items-center justify-center rounded bg-gray-600 border-gray-500 border-2 cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300"
        v-tooltip="'Projekt laden'"
        @click="uploadFile">
        <icon icon="cloud-upload" />
        <input
          ref="file"
          @change="handleFileUpload"
          accept="application/JSON"
          type="file"
          class="hidden" />
      </div>
      <icon
        icon="download"
        v-tooltip="'Projekt speichern'"
        @click="save"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <icon
        icon="arrow-left"
        v-tooltip="'Nach links scrollen'"
        @pointerdown="setScroll(-1)"
        @pointerup="setScroll(undefined)"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <icon
        icon="arrow-right"
        v-tooltip="'Nach rechts scrollen'"
        @pointerdown="setScroll(1)"
        @pointerup="setScroll(undefined)"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <icon
        icon="magnifying-glass-plus"
        v-tooltip="'Reinzoomen'"
        @pointerdown="setZoom(-1)"
        @pointerup="setZoom(undefined)"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <icon
        icon="magnifying-glass-minus"
        v-tooltip="'Rauszoomen'"
        @pointerdown="setZoom(1)"
        @pointerup="setZoom(undefined)"
        class="p-3 text-lg bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-500 hover:border-gray-600 transition duration-300" />
    </div>
    <div class="absolute z-10">
      <!-- ZEITSTRAHL -->
      <div class="w-screen h-0.5 bg-white">
        <div
          v-for="(time, index) in getVisibleDates()"
          :key="index"
          class="absolute"
          :style="`left: ${time[1]}%;`">
          <h1>{{ time[0] }}</h1>
        </div>
      </div>
    </div>
    <div class="absolute z-50 w-full h-1/2 flex items-end top-0">
      <!-- ENTRIES -->
      <div
        v-for="(entry, index) in getVisibleEntries()"
        :key="index"
        :ref="`entry-${index}`"
        class="bg-gray-600 border-gray-500 border-2 rounded-t absolute hover:z-30 p-3 flex flex-col gap-2.5"
        :style="`left: ${getXPosition(entry)}%;`">
        <div class="flex justify-between items-center">
          <input
            v-model="entry.title"
            class="font-semibold text-lg input2" />
          <div
            @click="deleteEntry(entry)"
            v-tooltip="`Eintrag löschen (${entry.title})`"
            class="w-8 h-8 rounded-full bg-red-500 border-red-600 border-2 flex justify-center items-center cursor-pointer">
            <icon icon="trash" />
          </div>
        </div>
        <textarea
          class="whitespace-pre-line input2 resize max-h-[20rem] max-w-[25rem] min-h-[10rem] min-w-[17.5rem]"
          v-model="entry.comment"></textarea>
        <h1 class="font-light text-sm">{{ stringify(entry.timeStamp) }}</h1>
      </div>
    </div>
  </div>
</template>
<script lang="ts">

const START_TIME = '1930-01-01'
const YEAR = 31_536_000_000
const DATES_VISIBLE = 10

import { defineComponent } from 'vue'
import Notifications from './Notifications.vue'

function isIEntryArray (arr: any): arr is IEntry[] {
  return Array.isArray(arr) && arr.every(entry => ['id', 'title', 'timeStamp'].every(prop => entry.hasOwnProperty(prop)))
}

export default defineComponent({
  components: { Notifications },
  data() {
    return {
      entries: [] as IEntry[],
      leftEnd: Date.parse(START_TIME),
      scrollYears: undefined as undefined | 1 | -1,
      createSection: false,
      input_title: undefined as string | undefined,
      input_comment: undefined as string | undefined,
      input_date: undefined as string | undefined,
      zoomLevel: 10, // Anzahl an Jahren, die zu sehen sind (Max: 50, Min: 1)
      zoom: undefined as undefined | 1 | -1
    }
  },
  methods: {
    notification(type: number, text: string, ms: number = 1000) {
      // @ts-ignore
      this.$refs['notifications'].createNotification(type, text, ms)
    },
    getRightEnd() {
      return this.leftEnd + this.zoomLevel * YEAR
    },
    getVisibleEntries(): IEntry[] {
      return this.entries.filter(e => (e.timeStamp > this.leftEnd) && (e.timeStamp < this.getRightEnd()))
    },
    setScroll(years: 1 | -1 | undefined) {
      this.scrollYears = years
    },
    setZoom(zoom: undefined | 1 | -1) {
      this.zoom = zoom
    },
    getVisibleDates(): [string, number][] {
      const start = this.leftEnd
      const zoom = this.zoomLevel
      const end = 100 / zoom // offset to the left in years
      const timeOffsetPerZoom = YEAR / end
      const offsetPerZoom = end / DATES_VISIBLE / 100 // 0-1
      console.log("getVisibleDates ~ offsetPerZoom", offsetPerZoom)
      const res: [string, number][] = []
      for (let i=0; i<DATES_VISIBLE; i++) {
        const timeStamp = start + (i * timeOffsetPerZoom)
        const date = new Date(timeStamp).toLocaleDateString()
        console.log(`${i} = ${date}`)
        const offset = Math.abs(this.leftEnd - timeStamp) * offsetPerZoom
        console.log("getVisibleDates ~ offset", offset)
        res.push([date, offset])
      }
      return res
    },
    stringify(timeStamp: number) {
      return new Date(timeStamp).toLocaleDateString()
    },
    getXPosition(entry: IEntry) {
      const timeStamp = entry.timeStamp
      const offset = Math.abs(timeStamp - this.leftEnd)
      const yearsDisplayed = this.zoomLevel
      const offsetPerYear = 100 / yearsDisplayed
      const res = offsetPerYear * (offset / YEAR)
      return res
    },
    async handleFileUpload() {
      try {
        const fileElement = this.$refs['file'] as HTMLInputElement
        if (!fileElement || !fileElement.files) return
        const file = fileElement.files[0]
        const text = await file.text()
        const entries: unknown = JSON.parse(text)

        if (!isIEntryArray(entries))
          throw 'UNKNOWN FORMAT!'

        this.entries = entries

        this.notification(1, 'Die Datei wurde erfolgreich importiert.')
      } catch(e) {
        this.notification(3 ,'Die Datei konnte nicht importiert werden!')
        console.log(e)
      }
    },
    uploadFile() {
      const fileElement = this.$refs['file'] as HTMLInputElement
      fileElement.click()
    },
    save() {
      if (this.entries.length == 0) {
        this.notification(2, 'Du hast keine Einträge erstellt.')
        return
      }
      const jsonEntries = JSON.stringify(this.entries)
      const blob = new Blob([jsonEntries], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const downloadElement = document.createElement('a')
      downloadElement.href = url
      downloadElement.download = 'timeline.json'
      document.body.appendChild(downloadElement)
      downloadElement.click()
    },
    toggleCreateSection() {
      this.createSection = !this.createSection
    },
    isCreateFormValid() {
      return this.input_title && this.input_date
    },
    create() {
      if (!this.isCreateFormValid()) return

      const id = Math.floor(Math.random() * 999_999_999_999) * 999_999_999
      const title = this.input_title as string
      const comment = this.input_comment
      const date = new Date(this.input_date as string).getTime()

      this.entries.push({
        id: id,
        title: title,
        comment: comment,
        timeStamp: date
      })

      this.notification(1, 'Der Eintrag wurde erstellt.\nVergiss nicht, das Projekt zu speichern!')
    },
    deleteEntry(entry: IEntry) {
      const index = this.entries.indexOf(entry)
      this.entries.splice(index, 1)
    }
  },
  mounted() {
    setInterval(() => {
      if (typeof this.scrollYears != 'undefined')
        this.leftEnd += this.scrollYears * (YEAR / 20)
      
      if (typeof this.zoom != 'undefined') {
          this.zoomLevel += (this.zoom * 0.05)
        if (this.zoomLevel < 1)
          this.zoomLevel = 1
        if (this.zoomLevel > 50)
          this.zoomLevel = 50
      }
    }, 1)
  }
})
</script>
