import markdownIt from "markdown-it";
import Shiki from "@shikijs/markdown-it";
import { useAppStore } from "../../stores/app";

// MARK: (!) Setup markdown parser
export async function SetupMarkdown() {
	const mdParser = markdownIt({
		html: true,
		linkify: true,
		typographer: true,
	});
	mdParser.use(
		await Shiki({
			theme: "github-dark-default",
			cssVariablePrefix: "_",
		}),
	);

	// MARK: Mention parser
	mdParser.inline.ruler.before(
		"text",
		"mention_placeholder",
		(state, silent) => {
			const start = state.pos;

			const match = state.src.slice(start).match(/<@(\d+)>/);
			if (!match) {
				return false;
			}
			const match_len = match[0].length;

			if (!silent) {
				const token = state.push("html_inline", "", 0);
				const index = useAppStore().data.members.findIndex(
					(user) => user.user.id === match[1],
				);
				let member = null;
				if (index !== -1) {
					member = useAppStore().data.members[index];
				}
				token.content = match.input
					.slice(0, match_len + match.index)
					.replace(
						match[0],
						`<span class="mention-placeholder" data-user-id="${match[1]}">@${
							member?.user.username || match[1]
						}</span>`,
					);
				token.markup = match[0];
			}

			state.pos += match_len + match.index;
			return true;
		},
	);

	// MARK: Role Mention parser
	mdParser.inline.ruler.before(
		"text",
		"role_mention_placeholder",
		(state, silent) => {
			const start = state.pos;

			const match = state.src.slice(start).match(/<@&(\d+)>/);
			if (!match) {
				return false;
			}
			const match_len = match[0].length;

			if (!silent) {
				const token = state.push("html_inline", "", 0);
				const index = useAppStore().data.currentServer?.roles?.findIndex(
					(role) => role.id === match[1],
				);
				let role = null;
				if (index !== -1) {
					role = useAppStore().data.currentServer.roles[index];
				}
				token.content = match.input
					.slice(0, match_len + match.index)
					.replace(
						match[0],
						`<span class="role-mention-placeholder" data-role-id="${
							match[1]
						}">@&${role ? role.name : match[1]}</span>`,
					);
				token.markup = match[0];
			}

			state.pos += match_len + match.index;
			return true;
		},
	);

	// MARK: Channel parser
	mdParser.inline.ruler.before(
		"text",
		"channel_placeholder",
		(state, silent) => {
			const start = state.pos;

			const match = state.src.slice(start).match(/<#(\d+)>/);
			if (!match) {
				return false;
			}
			const match_len = match[0].length;

			if (!silent) {
				const token = state.push("html_inline", "", 0);
				const channel = useAppStore().cache.cachedChannels[match[1]];
				token.content = match.input
					.slice(0, match_len + match.index)
					.replace(
						match[0],
						`<span class="channel-placeholder" data-channel-id="${match[1]}">#${
							channel ? channel.name : match[1]
						}</span>`,
					);
				token.markup = match[0];
			}

			state.pos += match_len + match.index;
			return true;
		},
	);

	// MARK: Timestamp parser
	mdParser.inline.ruler.before(
		"text",
		"timestamp_placeholder",
		(state, silent) => {
			const start = state.pos;

			const match = state.src.slice(start).match(/<t:(\d+):[a-zA-Z_]>/);
			if (!match) {
				return false;
			}
			const match_len = match[0].length;

			if (!silent) {
				const token = state.push("html_inline", "", 0);
				token.content = match.input
					.slice(0, match_len + match.index)
					.replace(
						match[0],
						`<span class="timestamp-placeholder" data-timestamp="${
							match[1]
						}">${new Date(
							Number.parseInt(match[1] * 1000),
						).toLocaleDateString()}</span>`,
					);
				token.markup = match[0];
			}

			state.pos += match_len + match.index;
			return true;
		},
	);

	// MARK: Emoji parser
	mdParser.inline.ruler.before("text", "emoji_parsed", (state, silent) => {
		const start = state.pos;

		const match = state.src.slice(start).match(/:([\w-]+[-_]?[\w-]+):/);
		if (!match) {
			return false;
		}
		const match_len = match[0].length;
		const emoji_name = match[1].replaceAll("_", " ");

		if (!silent) {
			const token = state.push("html_inline", "", 0);
			const emoji = useAppStore().utils.emojiData.find(
				(e) => e.label.toLowerCase() === emoji_name.toLowerCase(),
			);
			if (emoji) {
				token.content = match.input
					.slice(0, match_len + match.index)
					.replace(
						match[0],
						`<span class="emoji-holder">${emoji.unicode}</span>`,
					);
			} else {
				token.content = match.input.slice(0, match_len + match.index);
			}
			token.markup = match[0];
		}

		state.pos += match_len + match.index;
		return true;
	});

	return mdParser;
}
