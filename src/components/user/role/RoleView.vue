<style lang="scss" scoped>
.role {
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--foreground-color);
  gap: 0.5rem;
  text-align: justify;
  padding: var(--gap-md);
  border-radius: var(--radius-sm);

  .role-info-wrapper {
    display: grid;
    grid-template-columns: 3ch 3ch 1fr 20ch;
    gap: 0.5rem;

    .role-emoji {
      text-align: center;
    }
  }
}
</style>

<template>
  <div class="role" :style="`color: #${role.color}`">
    <div class="role-info-wrapper">
      <span class="role-position">
        {{ role.position }}
      </span>
      <span class="role-emoji">
        {{ role.unicode_emoji || "-" }}
      </span>
      <span class="role-name">{{ role.name }}</span>
      <span class="role-id">{{ role.id }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "RoleView",
  props: {
    "role": {
      type: Object,
      required: true
    }
  },
};
</script>
