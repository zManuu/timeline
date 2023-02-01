<template>
    <div class="z-50 absolute right-5 top-5 flex flex-col max-h-screen gap-2 text-white select-none">
        <div
            v-for="(notification, index) in notifications.sort(e => (e.msLeft))"
            :key="index"
            class="rounded max-w-xs opacity-75"
            :style="`background: ${notification.type.color}; filter: drop-shadow(0 5px 5px ${notification.type.color});`">
            <div class="flex justify-evenly items-center gap-5 p-5">
                <icon
                    class="text-xl"
                    :icon="notification.type.icon" />
                <h1 class="whitespace-pre-line">{{ notification.text }}</h1>
            </div>
            <div
                class="h-1 rounded"
                :style="`width: ${(notification.msLeft / notification.startMs) * 100}%; background: ${notification.type.darkerColor};`">
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    data() {
        return {
            notifications: [] as INotification[],
            types: [
                { color: '#3498DB', darkerColor: '#2E86C1', icon: 'info-circle' },
                { color: '#2ECC71', darkerColor: '#28B463', icon: 'check' },
                { color: '#F39C12', darkerColor: '#D68910', icon: 'triangle-exclamation' },
                { color: '#E74C3C', darkerColor: '#CB4335', icon: 'circle-exclamation' }
            ] as INotificationType[],
        }
    },
    methods: {
        createNotification(type: number, text: string, ms: number) {
            this.notifications.push({
                id: Math.floor(Math.random() * 999_999_999_999),
                type: this.types[type],
                text: text,
                msLeft: ms,
                startMs: ms
            })
        }
    },
    mounted() {
        setInterval(() => {
            for (let i=0; i<this.notifications.length; i++) {
                const notification = this.notifications[i]
                notification.msLeft -= 1
                if (notification.msLeft <= 0) {
                    // delete notification
                    this.notifications.splice(i, 1)
                }
            }
        }, 1)
    }
})

</script>