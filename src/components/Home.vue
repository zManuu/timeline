<template>
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
    </div>
    <div class="absolute z-10">
      <!-- ZEITSTRAHL -->
      <div class="w-screen h-0.5 bg-white flex justify-between">
        <div
          v-for="(time, index) in getVisibleYears()"
          :key="index">
          <h1>{{ time }}</h1>
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
          class="whitespace-pre-line input2 resize max-h-[20rem] max-w-[25rem] min-h-min min-w-min"
          v-model="entry.comment"></textarea>
        <h1 class="font-light text-sm">{{ stringify(entry.timeStamp) }}</h1>
      </div>
      <h1
        v-if="entries.length == 0"
        class="mb-2 ml-2 text-xl font-semibold">
        Keine Einträge gefunden.
      </h1>
    </div>
  </div>
</template>
<script lang="ts">

const START_TIME = '1930-01-01'
const YEAR = 31_536_000_000
const RIGHT_END_OFFSET = YEAR * 10

import { defineComponent } from 'vue'
import { generateItems } from '../utils/generator'
import Notifications from './Notifications.vue'

const requiredProperties = ['id', 'title', 'timeStamp']
const isIEntryArray = (arr: any): arr is IEntry[] => {
  return Array.isArray(arr) && arr.every(entry => 
    requiredProperties.every(prop => entry.hasOwnProperty(prop))
  )
}


export default defineComponent({
  components: { Notifications },
  data() {
    return {
      entries: [] as IEntry[],
      leftEnd: Date.parse(START_TIME),
      scrollYears: undefined as undefined | 1 | -1,
      createSection: true,
      input_title: undefined as string | undefined,
      input_comment: undefined as string | undefined,
      input_date: undefined as string | undefined
    }
  },
  methods: {
    notification(type: number, text: string, ms: number = 1000) {
      // @ts-ignore
      this.$refs['notifications'].createNotification(type, text, ms)
    },
    getRightEnd() {
      return this.leftEnd + RIGHT_END_OFFSET
    },
    getVisibleEntries(): IEntry[] {
      return this.entries.filter(e => (e.timeStamp > this.leftEnd) && (e.timeStamp < this.getRightEnd()))
    },
    setScroll(years: 1 | -1 | undefined) {
      this.scrollYears = years
    },
    getVisibleYears(): number[] {
      const leftEndYear = new Date(this.leftEnd).getFullYear()
      const yearsDisplayed = RIGHT_END_OFFSET / YEAR + 1
      return generateItems(yearsDisplayed, i => leftEndYear + i)
    },
    stringify(timeStamp: number) {
      return new Date(timeStamp).toLocaleDateString()
    },
    getXPosition(entry: IEntry) {
      const timeStamp = entry.timeStamp
      const offset = timeStamp - this.leftEnd
      const offsetYears = Math.abs(new Date(offset).getFullYear() - 1970)
      return offsetYears * (RIGHT_END_OFFSET / YEAR)
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
        this.notification(3, 'Du hast keine Einträge erstellt.')
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
    }, 1)
  }
})
</script>
