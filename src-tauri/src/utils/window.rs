
#[macro_export]
macro_rules! emit_to_app {
    ($name:expr, $($key:expr => $value:expr),+) => {
        if let Some(app) = &*crate::MAIN_APP.lock().await {
            if let Err(_) = app.emit(($name), json!({ $($key: $value),+ })) {
                eprintln!("[bot::event-{}] Could not emit to windows", stringify!($name));
            }
        }
    };
}
