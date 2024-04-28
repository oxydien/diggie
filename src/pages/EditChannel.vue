<style lang="scss" scoped>
.edit-channel-page-wrapper {
  position: relative;
  display: grid;
  grid-template-rows: 40px auto;
  width: 100%;

  .heading {
    h1,
    h2,
    h3 {
      margin: 0;
    }
  }

  .channel-editor {
    display: flex;
    flex-flow: column nowrap;
    gap: var(--gap-sm);
    width: 100%;
  }

  select,
  input[type="text"],
  input[type="number"],
  textarea,
  button,
  input:-internal-autofill-selected {
    display: block;
    width: 100%;
    padding: var(--gap-sm);
    background-color: var(--button-color);
    color: var(--text-color);
    border: none;
    font-size: 16px;
    border-radius: 5px;
  }

  input[type="text"]:focus-visible,
  input[type="number"]:focus-visible,
  textarea:focus-visible,
  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  textarea {
    max-width: 100% !important;
    min-width: 100% !important;
    resize: vertical;
  }

  button {
    transition: all 150ms;
    cursor: pointer;

    &:hover {
      background-color: var(--primary-muted-color);
      color: var(--text-highlight-color);
    }
    &:disabled {
      background-color: var(--button-color) !important;
      filter: brightness(70%);
      cursor: not-allowed;
    }
  }

  label:has(input[type="checkbox"]) {
    display: inline-block;
    max-width: 200px;

    padding: 10px 20px;
    color: var(--text-color);
    background-color: var(--button-color);
    outline: 2px solid var(--primary-muted-color);
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-align: center;
    font-weight: 600;

    &:hover {
      background-color: var(--button-color-muted);
    }

    input[type="checkbox"] {
      display: none;
    }
    &:has(input[type="checkbox"]:checked) {
      background-color: var(--primary-muted-color);
      outline-color: var(--primary-color);
    }
  }
}
.error-data {
  background-color: #a8121271;
  border: 3px #d41515;
  border-radius: 5px;
  padding: 10px;
  color: var(--text-highlight-color);
}
</style>

<template>
  <div class="edit-channel-page-wrapper">
    <div class="loading-default" v-if="apx.buffer.editingChannel">
      <LoadingIcon :animated="true" />
    </div>
    <div class="heading">
      <h2>{{ $route.params.channelId != 0 ? `Edit channel ${$route.params.channelId}` : "Create new channel" }}</h2>
    </div>
    <div class="channel-editor" v-if="editingChannel">
      <p class="create-warning" v-if="creating">Permissions will be copied from last channel you have visited</p>
      <div class="error-data" v-if="errorData" v-show="errorData.show">
        {{ errorData.message }}
      </div>
      <label for="channel_name">Channel name</label>
      <input type="text" id="channel_name" v-model="editingChannel.name" />
      <label for="channel_parent">Channel parent</label>
      <select name="channel_type" id="channel_type" v-model="editingChannel.parent_id">
        <option :value="null">None</option>
        <option :value="channel.id" v-for="channel in listOfCategories">{{ channel.name }}</option>
      </select>
      <label for="channel_position">Channel position</label>
      <input type="number" id="channel_position" v-model="editingChannel.position" />
      <label for="channel_type">Channel type</label>
      <select name="channel_type" id="channel_type" v-model="editingChannel.type">
        <option value="0">Text (0)</option>
        <option value="2">Voice (2)</option>
        <option value="4">Category (4)</option>
        <option value="5">News (5)</option>
        <option value="13">Stage (13)</option>
        <option value="15">Forum (15)</option>
      </select>
      <label for="channel_nsfw"
        ><input type="checkbox" id="channel_nsfw" name="channel_nsfw" v-model="editingChannel.nsfw" />Channel NSFW
      </label>
      <label for="channel_topic">Channel Topic</label>
      <textarea name="channel_topic" id="channel_topic"></textarea>
      <button @click="handleSendButton">Send it!</button>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../stores/app";
import { invoke } from "@tauri-apps/api/core";
import LoadingIcon from "../components/icons/LoadingIcon.vue";

export default {
  components: { LoadingIcon },
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
        permission_overwrites: this.apx.data.currentChannel ? this.apx.data.currentChannel.permission_overwrites : [],
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
          permission_overwrites: this.apx.data.currentChannel.permission_overwrites,
          parent_id: null,
          nsfw: false,
        };
      } else this.handleChannelSwitch();
    },
  },
  methods: {
    handleChannelSwitch() {
      if (!this.apx.data.currentChannel) return;
      this.editingChannel = {
        name: this.apx.data.currentChannel.name,
        topic: this.apx.data.currentChannel.topic || "",
        type: this.apx.data.currentChannel.type,
        position: this.apx.data.currentChannel.position,
        permission_overwrites: this.apx.data.currentChannel.permission_overwrites,
        parent_id: this.apx.data.currentChannel.parent_id,
        nsfw: this.apx.data.currentChannel.nsfw,
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
      const data = JSON.stringify(this.editingChannel);
      this.apx.buffer.editingChannel = true;
      console.log(data);
      invoke("edit_discord_channel", {
        channelId: this.$route.params.channelId,
        data,
      })
        .then((response) => console.log(response))
        .catch((e) => {
          console.error(e);
          this.errorData = {
            show: true,
            message: e,
          };
        })
        .finally(() => (this.apx.buffer.editingChannel = false));
    },
    handleCreateChannel() {
      const data = JSON.stringify(this.editingChannel);
      this.apx.buffer.editingChannel = true;
      console.log(data);
      invoke("create_discord_channel", {
        guildId: this.apx.data.currentServerId,
        data,
      })
        .then((response) => console.log(response))
        .catch((e) => {
          console.error(e);
          this.errorData = {
            show: true,
            message: e,
          };
        })
        .finally(() => (this.apx.buffer.editingChannel = false));
    },
  },
  computed: {
    listOfCategories() {
      return this.apx.data.channels.filter((channel) => channel.type === 4);
    },
  },
};
</script>
