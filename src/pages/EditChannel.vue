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
      <h2>
        {{
          $route.params.channelId != 0
            ? `Edit channel ${$route.params.channelId}`
            : "Create new channel"
        }}
      </h2>
    </div>
    <div class="channel-editor" v-if="editingChannel">
      <p class="create-warning" v-if="creating">
        Permissions will be copied from last channel you have visited
      </p>
      <div class="error-data" v-if="errorData" v-show="errorData.show">
        {{ errorData.message }}
      </div>
      <label for="channel_name">Channel name</label>
      <Input type="text" id="channel_name" v-model="editingChannel.name" />
      <label for="channel_parent">Channel parent</label>
      <Dropdown
        @change="editingChannel.parent_id = $event"
        :options="formattedCategories"
        :currentVal="editingChannel.parent_id"
      />
      <label for="channel_position">Channel position</label>
      <Input
        type="number"
        id="channel_position"
        v-model="editingChannel.position"
      />
      <label for="channel_type">Channel type</label>
      <Dropdown
        @change="editingChannel.type = $event"
        :options="[
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
        ]"
        :currentVal="editingChannel.type"
      />
      <Checkbox v-model="editingChannel.nsfw">Channel NSFW</Checkbox>
      <label for="channel_topic">Channel Topic</label>
      <Textarea
        name="channel_topic"
        id="channel_topic"
        placeholder="Channel Topic"
      ></Textarea>
      <Button @click="handleSendButton">Send it!</Button>
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
  },
  methods: {
    handleChannelSwitch() {
      if (!this.apx.data.currentChannel) return;
      this.editingChannel = {
        name: this.apx.data.currentChannel.name,
        topic: this.apx.data.currentChannel.topic || "",
        type: this.apx.data.currentChannel.type,
        position: this.apx.data.currentChannel.position,
        permission_overwrites:
          this.apx.data.currentChannel.permission_overwrites,
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
        .finally(() => {
          this.apx.buffer.editingChannel = false;
        });
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
        .finally(() => {
          this.apx.buffer.editingChannel = false;
        });
    },
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
  },
};
</script>
