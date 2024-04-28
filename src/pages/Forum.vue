<style lang="scss" scoped>
@mixin disableDefaultButton {
  border: none;
  color: var(--text-color);
  background-color: var(--button-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}

#forum_wrapper {
  height: 100%;
  display: grid;
  grid-template-rows: 40px 80px auto;
}

.channel-info {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 2px;
  border-bottom: 1px solid var(--button-color);
  margin-bottom: 10px;

  span {
    display: flex;
    gap: var(--gap-sm);
    align-items: center;
  }

  button {
    @include disableDefaultButton();
    display: grid;
    place-items: center;
    height: 100%;
    border-radius: var(--radius-sm);
    transform: rotate(180deg);
  }
}

.search-area {
  padding-inline: var(--gap-sm);

  input[type="text"],
  input:-internal-autofill-selected {
    display: block;
    width: 100%;
    padding: var(--gap-sm);
    background-color: var(--button-color);
    color: var(--text-color);
    border: none;
    font-size: 1.6rem;
    font-weight: 600;
    border-radius: 5px;
  }

  input[type="text"]:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }
}

.threads {
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
  gap: var(--gap-md);
  height: 100%;
  overflow: auto;

  .forum-thread {
    position: relative;
    width: 100%;
    height: 110px;
    transition: all 150ms;
    background-color: var(--button-color-muted);
    color: var(--text-highlight-color);
    border-radius: var(--radius-md);
    padding: var(--gap-md);
    cursor: pointer;

    &:hover {
      background-color: var(--button-color);
    }

    &.archived {
      color: var(--text-color);

      strong {
        font-weight: 400;
      }
    }

    .author {
      display: flex;
      gap: var(--gap-sm);
      max-height: 24px;

      width: fit-content;
      background-color: var(--button-color);
      border-radius: 4px;
      padding: 2px;

      img {
        width: 20px;
        height: 20px;
        border-radius: 10px;
      }
    }

    strong {
      font-size: 1.6rem;
      font-weight: 700;
    }

    .archived-icon {
      position: absolute;
      top: 0;
      right: 0;
      padding: var(--gap-md);
      background-color: var(--foreground-color);
      border-radius: 0 0 0 var(--radius-md);
    }

    .tags-wrapper {
      position: absolute;
      bottom: var(--gap-md);
      right: var(--gap-md);
      display: flex;
      gap: var(--gap-sm);

      .tag {
        display: flex;
        align-items: center;
        gap: var(--gap-sm);
        padding: 2px var(--gap-sm);
        background-color: var(--button-color);
        border-radius: var(--radius-sm);
      }
    }
  }
}
</style>

<template>
  <div id="forum_wrapper">
    <div class="channel-info">
      <span
        ><LoadingIcon v-if="apx.buffer.loadingMessages" />{{
          apx.data.currentChannel ? apx.data.currentChannel.name : ""
        }}</span
      >
      <button @click="apx.layout.showMembers = !apx.layout.showMembers">
        <ShowLayoutIcon :show="apx.layout.showMembers" />
      </button>
    </div>
    <div class="search-area">
      <div class="search-by-name">
        <input
          type="text"
          placeholder="Search or create thread..."
          v-model="searchString"
        />
      </div>
    </div>
    <div class="threads">
      <div
        class="forum-thread"
        :class="{ archived: thread.thread_metadata.archived }"
        v-for="thread in sortedThreads"
        @click="handleClick(thread)"
      >
        <div class="author found" v-if="findAuthor(thread.owner_id)">
          @
          <div class="author-avatar">
            <img
              :src="`https://cdn.discordapp.com/avatars/${thread.owner_id}/${
                findAuthor(thread.owner_id).user.avatar
              }.webp?size=32`"
            />
          </div>
          <span class="author-name">
            {{
              findAuthor(thread.owner_id).user.global_name ||
              findAuthor(thread.owner_id).user.username
            }}
          </span>
        </div>
        <div class="author not-found" v-else>
          <div class="author-name">@{{ thread.owner_id }}</div>
        </div>
        <strong>{{ thread.name }}</strong>
        <p><!-- Thread content --></p>
        <div class="archived-icon" v-if="thread.thread_metadata.archived">
          <ArchiveIcon />
        </div>
        <div class="tags-wrapper">
          <div class="tag message-count">
            <MessageIcon />
            <span>{{ thread.total_message_sent }}</span>
          </div>
          <div class="tag member-count">
            <UserIcon />
            <span>{{ thread.member_count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMessages } from "../core/discord/messages";
import { useAppStore } from "../stores/app.js";
import ArchiveIcon from "../components/icons/ArchiveIcon.vue";
import LoadingIcon from "../components/icons/LoadingIcon.vue";
import MessageIcon from "../components/icons/MessageIcon.vue";
import ShowLayoutIcon from "../components/icons/ShowLayoutIcon.vue";
import UserIcon from "../components/icons/UserIcon.vue";
export default {
	components: {
		ArchiveIcon,
		LoadingIcon,
		MessageIcon,
		ShowLayoutIcon,
		UserIcon,
	},
	data() {
		return {
			apx: useAppStore(),
			searchString: "",
		};
	},
	methods: {
		handleClick(channel) {
			if (this.apx.buffer.loadingMessages) return;
			this.apx.data.currentChannel = channel;
			this.apx.data.currentChannelId = channel.id;
			this.apx.data.messages = this.apx.cache.cachedMessages[channel.id] || [];
			this.$router.push(
				`/server/${this.apx.data.currentServerId}/${channel.id}`,
			);
			getMessages(channel.id);
		},
		findAuthor(userId) {
			return useAppStore().data.members.find(
				(member) => member.user.id === userId,
			);
		},
	},
	computed: {
		sortedThreads() {
			const data = this.apx.data.forums.threads;
			if (!data) return [];
			return data
				.filter((thread) =>
					thread.name.toLowerCase().includes(this.searchString.toLowerCase()),
				)
				.sort((a, b) => {
					if (a.thread_metadata.archived && !b.thread_metadata.archived)
						return 1;
					if (!a.thread_metadata.archived && b.thread_metadata.archived)
						return -1;

					return (
						new Date(a.thread_metadata.create_timestamp) -
						new Date(b.thread_metadata.create_timestamp)
					);
				});
		},
	},
};
</script>
