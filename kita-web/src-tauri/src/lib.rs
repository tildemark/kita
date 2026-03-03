use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Spawn kita-core sidecar on startup.
            // The binary must be present at src-tauri/binaries/kita-core-<target-triple>.exe
            let sidecar_command = app
                .shell()
                .sidecar("kita-core")
                .expect("kita-core sidecar not found — run the pre-build copy script");

            let (_rx, child) = sidecar_command
                .spawn()
                .expect("Failed to spawn kita-core sidecar");

            // Store the child handle so we can kill it on exit.
            app.manage(std::sync::Mutex::new(Some(child)));

            log::info!("kita-core sidecar started");
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Kill the sidecar when the main window closes.
                if let Some(child_mutex) = window
                    .app_handle()
                    .try_state::<std::sync::Mutex<Option<tauri_plugin_shell::process::CommandChild>>>()
                {
                    if let Ok(mut child_opt) = child_mutex.lock() {
                        if let Some(child) = child_opt.take() {
                            let _ = child.kill();
                            log::info!("kita-core sidecar stopped");
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running KITA");
}
