<style lang="scss">
.notification-container {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;

  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);

  .notification {
    --_color: var(--primary-color);

    position: relative;
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    width: 300px;
    max-height: 300px;

    background-color: var(--highlighted-foreground-color);
    color: var(--text-color);
    border-radius: var(--radius-md);
    padding: var(--gap-md);
    overflow: hidden;

    isolation: isolate;

    &.notification-error {
      --_color: #ca1336;
    }

    &.notification-warning {
      --_color: #faba12;
    }

    &.notification-info {
      --_color: #32a2cf;
    }

    .notification-duration {
      position: absolute;
      top: 0;
      left: 0;
      height: 5px;
      width: 100%;
      transition: all 120ms linear;
      background-color: var(--_color);
      z-index: -1;
    }

    .notification-header {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--gap-sm);

      button {
        width: 40px;
      }
    }

    .notification-body .notification-code:empty,
    .notification-body .notification-code:has(:empty),
    .notification-body:empty {
      display: none;
    }

    .notification-code {
      max-height: 200px;
      margin: 0;
      padding: 0;
      white-space: pre-wrap;
      font-family: Consolas, monospace;
      overflow: auto;
    }
  }
}

</style>

<template>
  <div class="notification-container">
    <div
      class="notification"
      :class="{
        'notification-error': notification.value.type === 'Error',
        'notification-warning': notification.value.type === 'Warning',
        'notification-info': notification.value.type === 'Info',
      }"
      v-for="(notification, index) in notifications"
      :id="`notification-${index}`"
      :key="notification"
    >
      <div
        class="notification-duration"
        :style="`width: ${Math.round((notification.value.remainingDuration / notification.value.duration) * 100)}%`"
        :ref="`notificationDuration_${notification}`"
      ></div>
      <div class="notification-header">
        <strong class="notification-title">{{
          notification.value.title
        }}</strong>
        <Button
          class="close-button"
          @click="notifications.splice(notification, 1)"
        >
          <CloseIcon />
        </Button>
      </div>
      <p class="notification-body">{{ notification.value.body }}
        <pre class="notification-code"><code>{{ notification.value.code.trim() }}</code></pre>
      </p>
    </div>
  </div>
</template>

<script>
import { notifications } from "../core/notifications/notificationHandler";
import { Notification } from "../core/notifications/notification";
import CloseIcon from "./icons/CloseIcon.vue";
import Button from "./base/Button.vue";

export default {
	components: {
		Button,
		CloseIcon,
	},
	data() {
		return {
			notifications: notifications,
			checkInterval: null,
		};
	},
	mounted() {
		this.checkInterval = setInterval(() => {
			notifications.value.forEach((notification, index) => {
				const notificationElement = document.getElementById(
					`notification-${index}`,
				);
				const isMouseOver = notificationElement?.querySelector(":hover");
				if (isMouseOver) {
					notification.value.remainingDuration =
						notification.value.duration || 0;
					return;
				}

				if (
					notification.value.remainingDuration == null &&
					!(notification.value.remainingDuration <= 0)
				) {
					notification.value.remainingDuration =
						notification.value.duration || 0;
				}
				notification.value.remainingDuration -= 0.1;
				if (notification.value.remainingDuration <= 0) {
					notifications.value.splice(index, 1);
				}
			});
		}, 100);
	},
};
</script>
