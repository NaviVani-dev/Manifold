use base64::Engine as _;
use serde::{Deserialize, Serialize};
use std::fs::{metadata, read, File};
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::Command;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize)]
pub struct SteamAccount {
    id: String,
    username: String,
}

#[derive(Serialize)]
pub struct UserInfo {
    username: String,
    uid: u32,
    folder: String,
    pfp: Option<String>,
    created_at: Option<i64>,
    steam_accs: Vec<SteamAccount>,
}

#[tauri::command]
pub fn list_users() -> Vec<UserInfo> {
    let file = File::open("/etc/passwd").expect("couldnt open /etc/passwd");
    let reader = BufReader::new(file);

    let mut users = Vec::new();

    for line in reader.lines() {
        if let Ok(line) = line {
            let parts: Vec<&str> = line.split(':').collect();
            if parts.len() >= 7 {
                let username = parts[0].to_string();
                let uid_str = parts[2];
                let folder = parts[5].to_string();
                let shell = parts[6].to_string();

                if let Ok(uid) = uid_str.parse::<u32>() {
                    if uid >= 1000 && !shell.contains("nologin") && !shell.contains("false") {
                        let face_path = format!("{}/.face", folder);
                        let pfp = if Path::new(&face_path).exists() {
                            if let Ok(bytes) = read(&face_path) {
                                let encoded =
                                    base64::engine::general_purpose::STANDARD.encode(bytes);
                                Some(format!("data:image/png;base64,{}", encoded))
                            } else {
                                None
                            }
                        } else {
                            None
                        };

                        let created_at = if let Ok(meta) = metadata(&folder) {
                            #[cfg(unix)]
                            {
                                use std::os::unix::fs::MetadataExt;
                                Some(meta.ctime())
                            }
                            #[cfg(not(unix))]
                            {
                                None
                            }
                        } else {
                            None
                        };

                        let steam_accs = get_steam_accounts(&folder);

                        users.push(UserInfo {
                            username,
                            uid,
                            folder,
                            pfp,
                            created_at,
                            steam_accs,
                        });
                    }
                }
            }
        }
    }

    users
}

fn get_steam_accounts(user_folder: &str) -> Vec<SteamAccount> {
    let mut accounts = Vec::new();
    let vdf_path = format!("{}/.steam/steam/config/loginusers.vdf", user_folder);

    if !Path::new(&vdf_path).exists() {
        return accounts;
    }

    if let Ok(file) = File::open(&vdf_path) {
        let reader = BufReader::new(file);
        let mut current_id: Option<String> = None;

        for line in reader.lines().flatten() {
            let trimmed = line.trim();

            if trimmed.starts_with('"') {
                let parts: Vec<&str> = trimmed.split('"').collect();

                if parts.len() == 3 && parts[1].chars().all(|c| c.is_numeric()) {
                    current_id = Some(parts[1].to_string());
                }

                if parts.len() >= 4 && parts[1] == "PersonaName" {
                    if let Some(id) = &current_id {
                        accounts.push(SteamAccount {
                            id: id.clone(),
                            username: parts[3].to_string(),
                        });
                    }
                }
            }
        }
    }

    accounts
}

#[tauri::command]
pub fn get_username() -> String {
    whoami::username()
}

#[derive(Deserialize)]
pub struct CreateUserPayload {
    folder: String,
    username: String,
}

#[tauri::command]
pub fn create_user(handle: tauri::AppHandle, payload: CreateUserPayload) -> Result<String, String> {
    let host = get_username();

    let script_path = handle
        .path()
        .resolve("scripts/create_user.sh", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    let output = Command::new("pkexec")
        .arg(script_path)
        .arg(&host)
        .arg(&payload.username)
        .arg(&payload.folder)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!(
            "User {} created at {}",
            payload.username, payload.folder
        ))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
