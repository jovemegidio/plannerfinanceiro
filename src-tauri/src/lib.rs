use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Configurar janela principal
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("Planner Financeiro");
                #[cfg(debug_assertions)]
                {
                    let _ = window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar Planner Financeiro");
}
