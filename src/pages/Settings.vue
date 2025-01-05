<style lang="scss" scoped>
.settings-wrapper {
  .settings-header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-md);
    padding-bottom: var(--gap-sm);
    border-bottom: 1px solid var(--button-color);

    h1 {
      margin: 0;
    }
  }

  .error {
    background-color: #a8121271;
    border: 3px #d41515;
    border-radius: 5px;
    padding: 10px;
    color: var(--text-highlight-color);
  }

  .settings-content {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-md);

    .settings-section {
      display: flex;
      flex-flow: column nowrap;
      gap: var(--gap-sm);

      .settings-list {
        display: flex;
        flex-flow: column nowrap;
        gap: var(--gap-sm);

        .settings-list-item {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          gap: var(--gap-md);

          padding: var(--gap-md);
          border-radius: var(--radius-md);
          background-color: var(--highlighted-foreground-color);

          .settings-list-item-icon {
            display: grid;
            place-items: center;
            padding: var(--gap-md);
            border-radius: var(--radius-md);
            background-color: var(--button-color);
          }

          .settings-list-item-text {
            display: flex;
            flex-flow: column nowrap;
            gap: var(--gap-sm);

            .settings-list-item-title {
              margin: 0;
            }

            .settings-item-value {
              margin: 0;

              h3 {
                margin: 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>

<template>
  <div class="settings-wrapper" id="settings_page_wrapper">
    <div class="settings-header">
      <nav>
        <Button @click="goBack">
          <ArrowIcon style="transform: rotate(90deg)" />
        </Button>
      </nav>
      <h1>Settings</h1>
      <div class="action-wrapper">
        <Button @click="saveSettings" :loading="isSaving" color="primary" :disabled="!canSave">Save</Button>
      </div>
    </div>
    <div class="error" v-if="errorData">{{ errorData }}</div>
    <div class="settings-content">
      <div class="settings-section">
        <h2>Accessibility</h2>
        <div class="settings-list">
          <div v-for="(value, key) in localSettings" :key="key" class="settings-list-item">
            <div class="settings-list-item-icon">
              <component :is="getIconByName(key)" />
            </div>
            <div class="settings-list-item-text">
              <Checkbox v-if="typeof localSettings[key] === 'boolean'" class="settings-item-value"
                v-model="localSettings[key]">
                <h3>{{ formatText(key) }}</h3>
              </Checkbox>
              <div v-else class="settings-item-value">
                <h3>{{ formatText(key) }}</h3>
                <Input v-model="localSettings[key]" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p>
        local: {{ localSettings }}
      </p>
      <p>
        global: {{ apx.utils.clientSettings }}
      </p>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import ArrowIcon from "../components/icons/ArrowIcon.vue";
import SendIcon from "../components/icons/SendIcon.vue";
import ReactionEmojiIcon from "../components/icons/ReactionEmojiIcon.vue";
import { invoke } from "@tauri-apps/api/core";
import Button from "../components/base/Button.vue";
import Input from "../components/base/Input.vue";
import Checkbox from "../components/base/Checkbox.vue";
export default {
  components: { ArrowIcon, SendIcon, Button, Input, Checkbox },
  data() {
    return {
      apx: useAppStore(),
      isSaving: false,
      errorData: null,
      localSettings: {},
    };
  },
  mounted() {
    this.localSettings = {
      ...JSON.parse(
        JSON.stringify(this.apx.utils.clientSettings),
      )
    };
    console.log(this.localSettings);
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    getIconByName(name) {
      switch (name) {
        case "render_videos":
          return SendIcon;
        case "favorite_emojis":
          return ReactionEmojiIcon;
      }
    },
    async saveSettings() {
      this.isSaving = true;
      try {
        await invoke("set_client_settings", {
          data: JSON.stringify(this.localSettings),
        });
        this.apx.utils.clientSettings = JSON.parse(JSON.stringify(this.localSettings));
        this.errorData = null;
        console.log("Settings saved");
      } catch (e) {
        this.errorData = e;
      }
      this.isSaving = false;
    },
    formatText(text) {
      return text
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },
  },
  computed: {
    canSave() {
      return (
        JSON.stringify(this.localSettings) !==
        JSON.stringify(this.apx.utils.clientSettings)
      );
    },
  },
};
</script>
