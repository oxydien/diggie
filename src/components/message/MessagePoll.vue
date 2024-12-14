<style scoped>
.message-poll {
  background-color: var(--button-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  isolation: isolate;
  max-width: 500px;
}

.poll-header {
  margin-bottom: 0.5rem;
}

.poll-subtitle {
  color: var(--text-muted-color);
  font-size: 0.875rem;
  display: block;
}

.poll-question {
  font-size: 1.125rem;
  font-weight: 600;
}

.poll-options {
  padding-top: 0.5rem;
}

.poll-option {
  position: relative;
  background-color: var(--primary-dark-color);
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.poll-option-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: var(--primary-color-highlighted);
  opacity: 0.5;
}

.poll-option-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
}

.poll-option-text {
  color: white;
  mix-blend-mode: difference;
  text-shadow: 0 0 2px black;
  z-index: 10;
}

.poll-option-percentage {
  color: #4b5563;
  z-index: 10;
}
</style>

<template>
  <div v-if="poll" class="message-poll">
    <div class="poll-header">
      <em class="poll-subtitle">WIP Poll preview</em>
      <strong class="poll-question">{{ poll.question.text }}</strong>
    </div>
    <div class="poll-options">
      <div 
        v-for="option in poll.answers" 
        :key="option.answer_id" 
        class="poll-option"
      >
        <div 
          class="poll-option-bar" 
          :style="{ width: `${calculatePercentage(option)}%` }"
        ></div>
        <div class="poll-option-content">
          <span class="poll-option-text">{{ option.poll_media.text }}</span>
          <em class="poll-option-percentage">
            {{ calculatePercentage(option) }}%
          </em>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
	name: "MessagePoll",
	props: {
		poll: {
			type: Object,
			required: false,
		},
	},
	methods: {
		calculatePercentage(option) {
      if (!this.poll) return 0;
			const totalVotes = this.poll.results.answer_counts.reduce(
				(sum, count) => sum + count.count,
				0,
			);
			const optionVotes =
				this.poll.results.answer_counts.find((ac) => ac.id === option.answer_id)
					?.count || 0;
			return Math.round((optionVotes / totalVotes) * 100);
		},
	},
};
</script>
