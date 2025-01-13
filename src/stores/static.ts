import type { ITwemoji } from "../types/types";
import { type Ref, ref, type UnwrapRef } from "vue";

export const MarkdownParser: Ref<UnwrapRef<unknown | null>> = ref(null);
export const Twemojis: Ref<UnwrapRef<ITwemoji[]>> = ref([]);
