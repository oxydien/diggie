import { ref } from "vue";

export const notifications = ref([]);

export function handleNotification(notification) {
	notifications.value.push(ref(notification));
}
