<style lang="scss" scoped>
.member-nav-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.member-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--gap-sm);
  overflow-y: scroll;
  overflow-x: clip;

  &::-webkit-scrollbar {
    display: none;
  }

  .member {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: var(--gap-sm);
    background-color: var(--button-color-muted);
    border-radius: var(--radius-sm);
    padding: var(--gap-sm);
    text-overflow: ellipsis;
    white-space: nowrap;

    img {
      border-radius: 60px;
      outline: 4px solid transparent;

      &.member-status-online {
        outline-color: lime;
      }
      &.member-status-dnd {
        outline-color: red;
      }
      &.member-status-away {
        outline-color: orange;
      }
      &.member-status-offline {
        outline-color: gray;
      }
      &.member-status-unknown {
        outline-color: black;
      }
    }

    .member-info {
      display: flex;
      flex-flow: column nowrap;
    }

    .member-activity {
      font-size: 0.6rem;

      .member-app-status {
        display: flex;
        flex-flow: row nowrap;
        gap: var(--gap-sm);
      }
    }
  }
  .loading-default {
    max-height: 99svh;
  }
}
</style>

<template>
  <div class="member-nav-wrapper">
    <div class="loading-default" v-if="apx.buffer.loadingMembers">
      <LoadingIcon :animated="true" />
    </div>
    <div class="member-list" v-if="apx.data.currentServer">
      <div
        class="member"
        v-for="member in sortedMembers"
        :style="`color: ${member.roles.length > 0 ? '#' + member.roles[0].color : 'gray'}`"
      >
        <img
          :src="`https://cdn.discordapp.com/avatars/${member.user.id}/${
            member.avatar || member.user.avatar
          }.webp?size=40`"
          :class="`member-status-${member.status || 'unknown'}`"
          width="24"
          height="24"
          v-if="member.avatar || member.user.avatar"
        />
        <PersonIcon v-else />
        <div class="member-info">
          <div class="member-name">
            {{ member.nick || member.user.global_name || member.user.username }}
          </div>
          <div class="member-activity" v-if="member.activities && member.activities.length > 0">
            <div class="member-custom-status" v-if="member.activities[0].type === 4">
              {{ member.activities[0].state }}
            </div>
            <div class="member-app-status" v-else>
              <strong>{{ translateActivityType(member.activities[0].type) }}</strong>
              <span>{{ member.activities[0].name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "../../stores/app";
import LoadingIcon from "../icons/LoadingIcon.vue";
import PersonIcon from "../icons/PersonIcon.vue";

export default {
  components: { LoadingIcon, PersonIcon },
  data() {
    return {
      apx: useAppStore(),
    };
  },
  methods: {
    translateActivityType(type) {
      let string = "";
      switch (type) {
        case 0:
          string = "Playing";
          break;
        case 1:
          string = "Streaming";
          break;
        case 2:
          string = "Listening to";
          break;
        case 3:
          string = "Watching";
          break;
        case 4:
          string = "Custom";
          break;
        case 5:
          string = "Competing in";
          break;
        default:
          break;
      }
      return string;
    },
  },
  computed: {
    sortedMembers() {
      if (!this.apx.data.members || !this.apx.data.currentServer.roles) return [];
      const members = JSON.parse(JSON.stringify(this.apx.data.members));
      const roles = JSON.parse(JSON.stringify(this.apx.data.currentServer.roles));

      const enrichedMembers = members.map((member) => {
        const memberRoles = roles.filter((role) => member.roles.includes(role.id));
        member.roles = memberRoles.sort((a, b) => b.position - a.position);
        return member;
      });

      const sortByRole = (a, b) => {
        // If both members have the same role, sort them by username
        if (a.roles[0] && b.roles[0] && a.roles[0].position === b.roles[0].position) {
          return a.user.username.localeCompare(b.user.username);
        }

        // If a member does not have a role, assign a high index value to sort them to the end
        const aRoleIndex = a.roles[0] ? a.roles[0].position : -Infinity;
        const bRoleIndex = b.roles[0] ? b.roles[0].position : -Infinity;

        // Otherwise, sort by role index
        return bRoleIndex - aRoleIndex;
      };

      // Sort the enriched members array using the sorting function
      return enrichedMembers.sort(sortByRole);
    },
  },
};
</script>
