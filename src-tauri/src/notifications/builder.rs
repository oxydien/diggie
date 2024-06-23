use crate::utils::string_utils::LocalToString;

use super::notification::{Notification, NotificationType};

pub struct NotificationBuilder {
    title: String,
    body: String,
    duration: u32,
    code: String,
    r#type: NotificationType,
}

impl NotificationBuilder {
    pub fn new(
        title: String,
        body: String,
        duration: u32,
        code: String,
        r#type: NotificationType,
    ) -> NotificationBuilder {
        NotificationBuilder {
            title,
            body,
            duration,
            code,
            r#type,
        }
    }

    pub fn build(self) -> Notification {
        Notification {
            r#type: self.r#type,
            title: self.title,
            body: self.body,
            duration: self.duration,
            code: self.code,
        }
    }

    pub fn info(
        title: impl LocalToString,
        body: Option<impl LocalToString>,
        duration: Option<u32>,
        code: Option<impl LocalToString>,
    ) -> NotificationBuilder {
        NotificationBuilder::new(
            title.local_to_string(),
            body.map(|b| b.local_to_string()).unwrap_or(String::new()),
            duration.unwrap_or(3),
            code.map(|b| b.local_to_string()).unwrap_or(String::new()),
            NotificationType::Info,
        )
    }

    pub fn warning(
        title: impl LocalToString,
        body: Option<impl LocalToString>,
        duration: Option<u32>,
        code: Option<impl LocalToString>,
    ) -> NotificationBuilder {
        NotificationBuilder::new(
            title.local_to_string(),
            body.map(|b| b.local_to_string()).unwrap_or(String::new()),
            duration.unwrap_or(3),
            code.map(|b| b.local_to_string()).unwrap_or(String::new()),
            NotificationType::Warning,
        )
    }

    pub fn error(
        title: impl LocalToString,
        body: Option<impl LocalToString>,
        duration: Option<u32>,
        code: Option<impl LocalToString>,
    ) -> NotificationBuilder {
        NotificationBuilder::new(
            title.local_to_string(),
            body.map(|b| b.local_to_string()).unwrap_or(String::new()),
            duration.unwrap_or(3),
            code.map(|b| b.local_to_string()).unwrap_or(String::new()),
            NotificationType::Error,
        )
    }

    pub fn set_type(mut self, r#type: NotificationType) -> NotificationBuilder {
        self.r#type = r#type;
        self
    }

    pub fn set_title(mut self, title: String) -> NotificationBuilder {
        self.title = title;
        self
    }

    pub fn set_body(mut self, body: String) -> NotificationBuilder {
        self.body = body;
        self
    }

    pub fn set_duration(mut self, duration: u32) -> NotificationBuilder {
        self.duration = duration;
        self
    }

    pub fn set_code(mut self, code: String) -> NotificationBuilder {
        self.code = code;
        self
    }
    
    pub async fn send(self) {
        self.build().send().await;
    }
}
