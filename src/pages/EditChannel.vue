<style lang="scss" scoped>
.edit-channel-page-wrapper {
  position: relative;
  display: grid;
  grid-template-rows: 40px auto;
  overflow: auto;
  width: 100%;
  height: 100%;

  .heading {
    position: sticky;
    top: 0;
    padding: var(--gap-md);
    text-align: center;
    background-color: var(--foreground-color);
    z-index: 3;

    h1,
    h2,
    h3 {
      margin: 0;
    }
  }

  .channel-editor {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: var(--gap-sm);
    width: 100%;
    padding-top: 5rem;

    .channel-form {
      display: flex;
      flex-flow: column nowrap;
      gap: var(--gap-md);
      max-width: 500px;
      font-size: 1.2em;
      background-color: var(--background-color);
      padding: var(--gap-lg);
      border-radius: var(--radius-md);

      section {
        display: flex;
        flex-flow: column nowrap;

        &:not(:first-child) {
          margin-top: var(--gap-md);
        }

        h4,
        label {
          margin: 0;
          margin-bottom: var(--gap-sm);
          font-weight: 600;
        }

        input {
          padding: var(--gap-md);
          background-color: var(--button-color);
        }

        textarea {
          min-height: 60px;
        }

        p {
          margin: 0 0 var(--gap-sm) 0;
          font-size: 0.9em;
          color: var(--text-muted-color);

          a {
            color: var(--primary-muted-color);
          }
        }
      }
    }
  }

  .fix-popup {
    max-width: 500px;
    margin-inline: auto;
  }

  .loading-default>div {
    z-index: 6;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: var(--gap-sm);

    strong, em {
      font-size: 1rem;
    }
  }
}

.error-data {
  background-color: #a8121271;
  border: 3px #d41515;
  border-radius: var(--radius-md);
  padding: 10px;
  color: var(--text-highlight-color);
  max-width: 480px;
  margin-inline: auto;
  margin-bottom: var(--gap-md);
}
</style>

<template>
  <div class="edit-channel-page-wrapper">
    <div class="loading-default" v-if="apx.buffer.editingChannel">
      <div>
        <LoadingIcon :animated="true" />
        <strong>Don't forget that rate limits apply</strong>
        <em>If you are stuck here, trying to do anything else in the mean time will likely result in an error. Try
          restarting the app.</em>
      </div>
    </div>
    <div class="heading">
      <h2>
        {{
          $route.params.channelId != 0
            ? `Edit channel ${$route.params.channelId}`
            : "Create new channel"
        }}
      </h2>
    </div>
    <div class="channel-editor" v-if="editingChannel">
      <div class="error-data" v-if="errorData" v-show="errorData.show">
        {{ errorData.message }}
      </div>
      <div class="channel-form">
        <section>
          <label for="channel_name">Name ({{ previewName }})</label>
          <Input type="text" id="channel_name" placeholder="Channel Name" v-model="editingChannel.name" />
        </section>
        <section>
          <label for="channel_parent">Parent (category)</label>
          <Dropdown @change="editingChannel.parent_id = $event" :options="formattedCategories"
            :currentVal="editingChannel.parent_id" />
        </section>
        <section><label for="channel_position">Position (from top 0)</label>
          <Input type="number" id="channel_position" placeholder="Channel Position" v-model="editingChannel.position" />
        </section>
        <section>
          <label for="channel_type">Type</label>
          <Dropdown @change="editingChannel.type = $event" :options="[
            {
              name: 'Text (0)',
              value: 0,
            },
            {
              name: 'Voice (2)',
              value: 2,
            },
            {
              name: 'Category (4)',
              value: 4,
            },
            {
              name: 'News (5)',
              value: 5,
            },
            {
              name: 'Stage (13)',
              value: 13,
            },
            {
              name: 'Forum (15)',
              value: 15,
            },
          ]" :currentVal="editingChannel.type" />
          <p>
            Looking for other types? <a target="_top"
              href="https://github.com/oxydien/diggie/blob/main/INFO.md#other-channel-types">[learn more]</a>
          </p>
        </section>
        <section>
          <h4>Permissions</h4>
          <p>Currently you cannot edit channel permissions <a target="_top"
              href="https://github.com/oxydien/diggie/blob/main/INFO.md#cannot-edit-permissions-on-a-channel">[learn
              more]</a></p>
          <p class="create-warning" v-if="creating">
            <strong>You are creating a new channel.</strong>
            Permissions will be copied from last channel you have visited (if any).
          </p>
        </section>
        <section>
          <Checkbox v-model="editingChannel.nsfw">Channel NSFW</Checkbox>
        </section>
        <section>
          <label for="channel_topic">Topic (optional)</label>
          <Textarea name="channel_topic" id="channel_topic" v-model="editingChannel.topic"
            placeholder="Channel Topic..."></Textarea>
        </section>
        <Button color="primary" @click="handleSendButton">Send it!</Button>
      </div>
    </div>
    <div class="fix-popup" v-else>
      <div class="fix-popup-content">
        <h4>It seems the content here couldn't be loaded properly</h4>
        <p>It seems there was an issue loading the channel data. You can try to fix this by clicking the button below or
          going back to the guild and attempting to edit the given channel again. If the issue persists, please file a
          bug report.</p>

        <em>Usually happens because of wrong reload</em>
        <Button color="primary" @click="tryFixPage">Load data</Button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import { invoke } from "@tauri-apps/api/core";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import Button from "../components/base/Button.vue";
import Dropdown from "../components/base/Dropdown.vue";
import Input from "../components/base/Input.vue";
import Textarea from "../components/base/Textarea.vue";
import Checkbox from "../components/base/Checkbox.vue";
import { loadFromChannelId, tryCreateChannel, tryEditChannel } from "../core/discord/channels";

export default {
  components: { LoadingIcon, Button, Dropdown, Textarea, Input, Checkbox },
  data() {
    return {
      creating: false,
      apx: useAppStore(),
      editingChannel: null,
      errorData: null,
    };
  },
  mounted() {
    if (this.$route.params.channelId === "0") {
      this.creating = true;
      this.editingChannel = {
        name: "",
        topic: "",
        type: 0,
        position: 0,
        permission_overwrites: this.apx.data.currentChannel
          ? this.apx.data.currentChannel.permission_overwrites
          : [],
        parent_id: null,
        nsfw: false,
      };
    } else {
      this.handleChannelSwitch();
    }
  },
  watch: {
    "$route.params.channelId"() {
      if (this.$route.params.channelId === "0") {
        this.creating = true;
        this.editingChannel = {
          name: "",
          topic: "",
          type: 0,
          position: 0,
          permission_overwrites:
            this.apx.data.currentChannel.permission_overwrites,
          parent_id: null,
          nsfw: false,
        };
      } else this.handleChannelSwitch();
    },

    // When app loads and user was logged in, wait for user data and load the channel data
    "apx.user"() {
      this.tryFixPage();
    }
  },
  methods: {
    handleChannelSwitch(data) {
      if (!this.apx.data.currentChannel && !data) return;
      const channelData = data || this.apx.data.currentChannel;

      this.editingChannel = {
        name: channelData.name,
        topic: channelData.topic || "",
        type: channelData.type,
        position: channelData.position,
        permission_overwrites:
          channelData.permission_overwrites,
        parent_id: channelData.parent_id,
        nsfw: channelData.nsfw,
      };
    },
    handleSendButton() {
      if (this.creating) {
        this.handleCreateChannel();
      } else {
        this.handleEditChannel();
      }
    },
    handleEditChannel() {
      const data = this.getJsonChannel();
      tryEditChannel(this.$route.params.channelId, data).then(this.handleErrors)
    },
    handleCreateChannel() {
      const data = this.getJsonChannel();
      tryCreateChannel(this.apx.data.currentServerId, data).then(this.handleErrors)
    },
    handleErrors(errors) {
      this.errorData = null;
      if (errors !== "") {
        this.errorData = {
          show: true,
          message: errors,
        };
      }
    },
    getJsonChannel() {
      return JSON.stringify({
        ...this.editingChannel,
        position: Number.parseInt(this.editingChannel.position, 10),
      });
    },
    tryFixPage() {
      console.debug("Requested reload fix")
      loadFromChannelId(this.$route.params.channelId, true).then(() => {
        this.handleChannelSwitch();
      })
    }
  },
  computed: {
    listOfCategories() {
      return this.apx.data.channels.filter((channel) => channel.type === 4);
    },
    formattedCategories() {
      return [{ name: "None", value: null }].concat(
        this.listOfCategories.map((l) => ({ name: l.name, value: l.id }))
      );
    },
    previewName() {
      return this.editingChannel.type === 4
        ? this.editingChannel.name
        : this.editingChannel.name.replace(/\s+/g, '-').toLowerCase();
    }
  },
};
</script>
