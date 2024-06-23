import { ref } from "vue";
import NOTIFICATION_TYPE from "./notificationType";

export class Notification {
	constructor() {
		this.type = ref(NOTIFICATION_TYPE.None);
		this.title = ref("");
		this.body = ref("");
		this.code = ref("");
		this.duration = ref(0);
	}

	from_json(json) {
		this.type = ref(json.type);
		this.title = ref(json.title);
		this.body = ref(json.body);
		this.code = ref(json.code);
		this.duration = ref(json.duration);
	}
}
