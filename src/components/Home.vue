<template>
  <Notifications ref="notifications" />
  <!-- zoom -->
  <h1
    v-if="!createSection"
    class="dark:text-white text-gray-800 absolute z-30 left-5 top-5 text-xl transition duration-300">
    <icon icon="magnifying-glass" />
    {{ project.zoomLevel }}
  </h1>
  <div
    v-if="createSection"
    class="z-[35] absolute top-5 left-5 w-[15rem] bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 border-2 rounded p-3 dark:text-white text-black flex flex-col gap-1 transition duration-300">
    <!-- CREATE -->
    <h1>Eintrag erstellen</h1>
    <input
      class="input w-full dark:bg-gray-500 dark:border-gray-400 bg-gray-200 border-gray-400"
      placeholder="Titel"
      type="text"
      v-model="input_create_title" />
    <textarea
      class="input w-full resize-none h-[10rem] dark:bg-gray-500 dark:border-gray-400 bg-gray-200 border-gray-400"
      placeholder="Text"
      v-model="input_create_comment">
    </textarea>
    <input
      class="input w-full dark:bg-gray-500 dark:border-gray-400 bg-gray-200 border-gray-400"
      placeholder="Titel"
      type="date"
      v-model="input_create_date" />
    <input
      type="submit"
      class="border-2 w-full rounded py-2"
      value="Bestätigen"
      @click="create"
      :class="isCreateFormValid() ? 'bg-green-500 border-green-600 cursor-pointer hover:bg-green-600 hover:border-green-500 transition duration-300' : 'bg-gray-200 dark:bg-gray-500 border-gray-400 cursor-not-allowed'" />
  </div>
  <div class="w-screen h-screen flex justify-center items-center dark:text-white text-black transition duration-300 select-none">
    <div class="absolute right-5 bottom-5 flex justify-center gap-2">
      <!-- CONTROLS -->
      <icon
        icon="plus"
        v-tooltip="'Eintrag erstellen'"
        @click="toggleCreateSection"
        class="p-3 text-lg bg-gray-100 dark:bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <div
        class="p-3 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-600 border-gray-500 border-2 cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-500 hover:border-gray-600 transition duration-300"
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
        class="p-3 text-lg bg-gray-100 dark:bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <icon
        icon="arrow-left"
        v-tooltip="'Nach links scrollen'"
        @mouseover="setScroll(-1)"
        @mouseleave="setScroll(undefined)"
        class="p-3 text-lg bg-gray-100 dark:bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <icon
        icon="arrow-right"
        v-tooltip="'Nach rechts scrollen'"
        @mouseover="setScroll(1)"
        @mouseleave="setScroll(undefined)"
        class="p-3 text-lg bg-gray-100 dark:bg-gray-600 border-gray-500 border-2 rounded cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-500 hover:border-gray-600 transition duration-300" />
      <div
        class="p-3 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-600 border-gray-500 border-2 cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-500 hover:border-gray-600 transition duration-300"
        v-tooltip="'Nacht- / Tagmodus umschalten'"
        @click="toggleDark()">
        <icon :icon="isDark ? 'moon' : 'sun'" />
      </div>
    </div>
    <div
      v-if="editedEntry"
      class="absolute z-40 w-screen h-screen bg-black bg-opacity-75 flex items-center justify-center">
      <div class="bg-gray-300 dark:bg-gray-800 dark:border-gray-700 border-gray-400 border-2 w-[30rem] rounded p-3">
        <div class="flex justify-between items-center">
          <h1 class="font-semibold text-lg dark:text-white">Eintrag Bearbeiten</h1>
          <div
            @click="editEntry(undefined)"
            v-tooltip="'Schließen'"
            class="bg-red-500 border-2 border-red-600 w-8 h-8 rounded flex justify-center items-center cursor-pointer text-white">
            <icon icon="xmark" />
          </div>
        </div>
        <div class="flex flex-col gap-2 w-3/4 m-auto mt-5">
          <input
            placeholder="Titel"
            maxlength="50"
            minlength="1"
            v-model="editedEntry.title"
            class="input dark:bg-gray-600 dark:border-gray-700" />
          <textarea
            placeholder="Beschreibung"
            v-model="editedEntry.comment"
            class="input resize-y min-h-[5rem] max-h-[20rem] dark:bg-gray-600 dark:border-gray-700"></textarea>
          <div class="flex justify-between items-center">
            <input
              type="date"
              v-model="input_edit_date"
              class="input w-[47.5%] dark:bg-gray-600 dark:border-gray-700 " />
            <input
              type="color"
              v-model="editedEntry.color"
              class="w-[47.5%] dark:bg-gray-600 dark:border-gray-700" />
          </div>
          <button
            @click="deleteEntry()"
            class="bg-red-600 border-red-700 border-2 rounded py-2 text-white"
            v-tooltip="'NICHT RÜCKGÄNGIG ZU MACHEN'">
            Eintrag LÖSCHEN
          </button>
        </div>
      </div>
    </div>
    <div class="absolute z-10 bottom-1/3">
      <!-- ZEITSTRAHL -->
      <div class="w-screen h-0.5 dark:bg-white bg-black transition duration-300">
        <div
          v-for="(time, index) in getVisibleDates()"
          :key="index"
          class="absolute dark:text-white text-black transition duration-300"
          :style="`left: ${time[1]}%;`">
          <h1>{{ time[0] }}</h1>
        </div>
      </div>
    </div>
    <div class="absolute z-30 w-full h-2/3 flex items-end top-0">
      <!-- ENTRIES -->
      <div
        v-for="(entry, index) in getVisibleEntries()"
        :key="index"
        :ref="`entry-${index}`"
        @click="editEntry(entry)"
        v-tooltip="'Klicke, um zu bearbeiten'"
        class="dark:border-gray-500 border-gray-400 border-2 rounded-t absolute hover:z-30 p-3 flex flex-col gap-2.5 cursor-pointer"
        :style="`left: ${getXPosition(entry)}%; background: ${getBG(entry)};`">
        <div class="flex justify-between items-center text-black dark:text-white transition duration-300">
          <h1 class="font-semibold text-lg">
            {{ entry.title }}
          </h1>
        </div>
        <h1
          v-if="entry.comment"
          class="whitespace-pre-line">
          {{ entry.comment }}
        </h1>
        <h1 class="font-light text-sm">{{ stringify(entry.timeStamp) }}</h1>
      </div>
    </div>
  </div>
</template>
<script lang="ts">

const YEAR = 31_536_000_000
const DATES_VISIBLE = 10
const ZOOM_MIN = 2
const ZOOM_MAX = 200

import { defineComponent } from 'vue'
import Notifications from './Notifications.vue'
import { EmptyProject, isIProject } from '@/utils/emptyProject'
import { useDark, useToggle } from '@vueuse/core'

export default defineComponent({
  components: { Notifications },
  data() {
    return {
      project: EmptyProject,
      scrollYears: undefined as Nullable<1 | -1>,
      createSection: false,
      input_create_title: undefined as Nullable<string>,
      input_create_comment: undefined as Nullable<string>,
      input_create_date: undefined as Nullable<string>,
      input_edit_date: undefined as Nullable<string>,
      editedEntry: undefined as IEntry | undefined
    }
  },
  setup() {
    const isDark = useDark()
    const toggleDark = useToggle(isDark)
    return { isDark, toggleDark }
  },
  watch: {
    input_edit_date(val: Nullable<string>) {
      if (!val) return
      this.editedEntry!.timeStamp = Date.parse(val)
    }
  },
  methods: {
    notification(type: number, text: string, ms: number = 1000) {
      // @ts-ignore
      this.$refs['notifications'].createNotification(type, text, ms)
    },
    getRightEnd() {
      return this.project.leftEnd + this.project.zoomLevel * YEAR
    },
    getVisibleEntries(): IEntry[] {
      return this.project.entries.filter(e => (e.timeStamp > this.project.leftEnd) && (e.timeStamp < this.getRightEnd()))
    },
    setScroll(years: Nullable<1 | -1>) {
      this.scrollYears = years
    },
    getVisibleDates(): [string, number][] {
      const res: [string, number][] = []
      const left = this.project.leftEnd
      const right = this.getRightEnd()
      const offsetLeftRight = Math.abs(left - right)
      const timeOffsetPerDate = offsetLeftRight / DATES_VISIBLE
      const posOffsetPerDate = 100 / DATES_VISIBLE
      for (let i=0; i<DATES_VISIBLE; i++) {
        const timeStamp = left + (i * timeOffsetPerDate)
        const display = this.stringify(timeStamp)
        const x = i * posOffsetPerDate
        res.push([ display, x ])
      }
      return res
    },
    stringify(timeStamp: number) {
      return new Date(timeStamp).toLocaleDateString()
    },
    getXPosition(entry: IEntry) {
      const timeStamp = entry.timeStamp
      const offset = Math.abs(timeStamp - this.project.leftEnd)
      const yearsDisplayed = this.project.zoomLevel
      const offsetPerYear = 100 / yearsDisplayed
      const res = offsetPerYear * (offset / YEAR)
      return res
    },
    getBG(entry: IEntry) {
      return entry.color
        ? entry.color
        : this.isDark
          ? 'rgb(75, 85, 99)'
          : 'rgb(250, 250, 250)'
    },
    async handleFileUpload() {
      try {
        const fileElement = this.$refs['file'] as HTMLInputElement
        if (!fileElement || !fileElement.files) return
        const file = fileElement.files[0]
        const text = await file.text()
        const project: unknown = JSON.parse(text)

        if (!isIProject(project))
          throw 'UNKNOWN FORMAT!'

        this.project = project

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
      const jsonEntries = JSON.stringify(this.project)
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
      return this.input_create_title && this.input_create_date
    },
    create() {
      if (!this.isCreateFormValid()) return

      const id = Math.floor(Math.random() * 999_999_999_999) * 999_999_999
      const title = this.input_create_title as string
      const comment = this.input_create_comment
      const date = new Date(this.input_create_date as string).getTime()

      this.project.entries.push({
        id: id,
        title: title,
        comment: comment,
        timeStamp: date
      })

      this.notification(1, 'Der Eintrag wurde erstellt.\nVergiss nicht, das Projekt zu speichern!')
    },
    deleteEntry() {
      const entry = this.editedEntry!
      this.editedEntry = undefined
      const index = this.project.entries.indexOf(entry)
      this.project.entries.splice(index, 1)
    },
    editEntry(entry: Nullable<IEntry>) {
      this.editedEntry = entry
    },
    handleScroll(ev: WheelEvent) {

      this.project.zoomLevel += ev.deltaY / 100
      
      if (ev.ctrlKey) {
        ev.preventDefault()
        
        // zoom in at cursor pos
        const left = this.project.leftEnd
        const right = this.getRightEnd()
        const a = left + (Math.abs(left - right) / window.screen.width * ev.clientX)
        const b = left
        const c = right
        const m = Math.abs(b - c) / 2
        const v1 = a - b
        const v2 = v1 - m
        this.project.leftEnd += v2
      }

      if (this.project.zoomLevel < ZOOM_MIN)
        this.project.zoomLevel = ZOOM_MIN
      if (this.project.zoomLevel > ZOOM_MAX)
        this.project.zoomLevel = ZOOM_MAX
    }
  },
  mounted() {
    setInterval(() => {
      // left/right
      if (typeof this.scrollYears != 'undefined')
        this.project.leftEnd += this.scrollYears * (YEAR / 100) * this.project.zoomLevel
    }, 1)

    // zoom
    window.addEventListener('wheel', this.handleScroll, { passive: false })
  }
})
</script>