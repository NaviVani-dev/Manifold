// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod users;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            users::list_users,
            users::get_username,
            users::create_user
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
