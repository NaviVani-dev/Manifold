#[tauri::command]
pub fn open_system_folder(folder: String) -> Result<String, String> {
    let mut cmd = std::process::Command::new("xdg-open");
    cmd.arg(&folder);

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("Folder {} successfully opened!", folder))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
